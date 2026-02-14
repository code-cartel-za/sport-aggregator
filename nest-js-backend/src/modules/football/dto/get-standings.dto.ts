import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetStandingsDto {
  @ApiPropertyOptional({ example: 'PL', description: 'Competition code' })
  @IsOptional()
  @IsString()
  competition?: string;
}
