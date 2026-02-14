import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn, IsNumberString, IsString } from 'class-validator';

export class GetF1StandingsDto {
  @ApiPropertyOptional({ enum: ['drivers', 'constructors'], example: 'drivers' })
  @IsOptional()
  @IsIn(['drivers', 'constructors'])
  type?: string;
}

export class GetF1RacesDto {
  @ApiPropertyOptional({ example: '2026', description: 'Season year' })
  @IsOptional()
  @IsString()
  season?: string;
}

export class GetF1LivePositionsDto {
  @ApiPropertyOptional({ example: '9001', description: 'Session key' })
  @IsOptional()
  @IsNumberString()
  sessionKey?: string;
}

export class GetF1LiveLapsDto {
  @ApiPropertyOptional({ example: '9001', description: 'Session key' })
  @IsOptional()
  @IsNumberString()
  sessionKey?: string;

  @ApiPropertyOptional({ example: '1', description: 'Driver number' })
  @IsOptional()
  @IsNumberString()
  driverNumber?: string;
}

export class GetF1PitStopsDto {
  @ApiPropertyOptional({ example: '9001', description: 'Session key' })
  @IsOptional()
  @IsNumberString()
  sessionKey?: string;
}
