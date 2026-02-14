import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsIn } from 'class-validator';

export class GetFixturesDto {
  @ApiPropertyOptional({ example: 'live', enum: ['live', 'scheduled', 'finished'], description: 'Fixture status filter' })
  @IsOptional()
  @IsIn(['live', 'scheduled', 'finished'])
  status?: string;

  @ApiPropertyOptional({ example: '2026-02-14', description: 'Date filter (YYYY-MM-DD)' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 'PL', description: 'Competition code' })
  @IsOptional()
  @IsString()
  competition?: string;
}
