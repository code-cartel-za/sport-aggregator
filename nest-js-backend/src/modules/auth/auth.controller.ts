import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiSecurity, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateApiKeyDto, ApiKeyResponseDto, UsageSummaryResponseDto } from './dto/create-api-key.dto';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { B2bResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { CurrentApiKey } from '../../common/decorators/api-key.decorator';
import { B2bApiKey } from '../../types';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('keys')
  @ApiOperation({ summary: 'Create a new API key (requires admin secret)' })
  @ApiHeader({ name: 'x-admin-secret', description: 'Admin secret for key creation', required: true })
  @ApiResponse({ status: 201, description: 'API key created', type: ApiKeyResponseDto })
  @ApiResponse({ status: 403, description: 'Invalid admin secret' })
  async createKey(
    @Body() dto: CreateApiKeyDto,
    @Headers('x-admin-secret') adminSecret: string,
  ): Promise<B2bApiKey> {
    return this.authService.createKey(dto, adminSecret);
  }

  @Delete('keys/:key')
  @ApiOperation({ summary: 'Revoke an API key (requires admin secret)' })
  @ApiHeader({ name: 'x-admin-secret', description: 'Admin secret', required: true })
  @ApiResponse({ status: 200, description: 'Key revoked' })
  async revokeKey(
    @Param('key') key: string,
    @Headers('x-admin-secret') adminSecret: string,
  ): Promise<{ message: string }> {
    const expectedSecret = process.env['ADMIN_SECRET'] ?? 'default-admin-secret';
    if (adminSecret !== expectedSecret) {
      throw new Error('Invalid admin secret');
    }
    await this.authService.revokeKey(key);
    return { message: 'Key revoked successfully' };
  }

  @Get('keys/usage')
  @ApiOperation({ summary: 'Get usage for your API key' })
  @ApiSecurity('api-key')
  @UseGuards(ApiKeyGuard)
  @UseInterceptors(B2bResponseInterceptor)
  @ApiResponse({ status: 200, description: 'Usage data', type: [UsageSummaryResponseDto] })
  async getUsage(@CurrentApiKey() apiKey: B2bApiKey) {
    return this.authService.getUsage(apiKey.key);
  }
}
