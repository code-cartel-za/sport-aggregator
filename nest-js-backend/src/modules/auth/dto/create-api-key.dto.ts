import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsEnum, IsOptional, MinLength } from 'class-validator';

export class CreateApiKeyDto {
  @ApiProperty({ example: 'My App', description: 'Name for this API key' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'dev@example.com', description: 'Contact email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: ['starter', 'growth', 'enterprise'], example: 'starter', description: 'Pricing tier' })
  @IsEnum(['starter', 'growth', 'enterprise'] as const)
  tier!: 'starter' | 'growth' | 'enterprise';

  @ApiProperty({ required: false, example: '2027-01-01', description: 'Expiration date (ISO)' })
  @IsOptional()
  @IsString()
  expiresAt?: string;
}

export class CreateApiKeyHeaderDto {
  @ApiProperty({ description: 'Admin secret for key creation' })
  @IsString()
  adminSecret!: string;
}

export class ApiKeyResponseDto {
  @ApiProperty({ example: 'sk_live_abc123def456' })
  key!: string;

  @ApiProperty({ example: 'My App' })
  name!: string;

  @ApiProperty({ example: 'dev@example.com' })
  email!: string;

  @ApiProperty({ enum: ['starter', 'growth', 'enterprise'], example: 'starter' })
  tier!: string;

  @ApiProperty({ enum: ['active', 'suspended', 'revoked'], example: 'active' })
  status!: string;

  @ApiProperty({ example: '2026-02-14T00:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: null, nullable: true })
  expiresAt!: string | null;
}

export class UsageSummaryResponseDto {
  @ApiProperty({ example: 'sk_live_abc123' })
  key!: string;

  @ApiProperty({ example: '2026-02-14' })
  date!: string;

  @ApiProperty({ example: 142 })
  requestCount!: number;

  @ApiProperty({ example: { '/v1/football/teams': 50, '/v1/fpl/players': 92 } })
  endpoints!: Record<string, number>;

  @ApiProperty({ example: '2026-02-14T12:34:56.000Z' })
  lastRequestAt!: string;
}
