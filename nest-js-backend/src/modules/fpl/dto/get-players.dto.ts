import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumberString, IsIn, IsString } from 'class-validator';

export class GetFplPlayersDto {
  @ApiPropertyOptional({ example: '3', description: 'Position type (1=GK, 2=DEF, 3=MID, 4=FWD)' })
  @IsOptional()
  @IsNumberString()
  position?: string;

  @ApiPropertyOptional({ example: '1', description: 'Team ID' })
  @IsOptional()
  @IsNumberString()
  team?: string;

  @ApiPropertyOptional({ example: '45', description: 'Minimum price (in tenths, e.g. 45 = £4.5m)' })
  @IsOptional()
  @IsNumberString()
  minPrice?: string;

  @ApiPropertyOptional({ example: '120', description: 'Maximum price (in tenths)' })
  @IsOptional()
  @IsNumberString()
  maxPrice?: string;

  @ApiPropertyOptional({ example: 'form', enum: ['form', 'points', 'price', 'ownership'], description: 'Sort field' })
  @IsOptional()
  @IsIn(['form', 'points', 'price', 'ownership'])
  sortBy?: string;
}

export class GetFplLiveDto {
  @ApiPropertyOptional({ example: '25', description: 'Gameweek number' })
  @IsOptional()
  @IsNumberString()
  gw?: string;
}
