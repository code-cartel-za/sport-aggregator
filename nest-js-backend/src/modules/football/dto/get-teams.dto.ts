import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetTeamsDto {
  @ApiPropertyOptional({ example: 'PL', description: 'Competition code (e.g. PL, BL1, SA)' })
  @IsOptional()
  @IsString()
  competition?: string;
}
