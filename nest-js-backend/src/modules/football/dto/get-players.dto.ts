import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumberString } from 'class-validator';

export class GetPlayersDto {
  @ApiPropertyOptional({ example: '57', description: 'Filter by team ID' })
  @IsOptional()
  @IsNumberString()
  teamId?: string;

  @ApiPropertyOptional({ example: 'Midfielder', description: 'Filter by position' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'PL', description: 'Competition code' })
  @IsOptional()
  @IsString()
  competition?: string;
}
