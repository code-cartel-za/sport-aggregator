import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { F1Service, F1DriverStanding, F1ConstructorStanding, F1Race, F1Position, F1Lap, F1PitStop } from './f1.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { B2bResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { GetF1StandingsDto, GetF1RacesDto, GetF1LivePositionsDto, GetF1LiveLapsDto, GetF1PitStopsDto } from './dto/query.dto';
import {
  F1DriverStandingResponseDto,
  F1ConstructorStandingResponseDto,
  F1RaceResponseDto,
  F1PositionResponseDto,
  F1LapResponseDto,
  F1PitStopResponseDto,
} from './dto/response.dto';

@ApiTags('F1')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@UseInterceptors(B2bResponseInterceptor)
@Controller('f1')
export class F1Controller {
  constructor(private readonly f1Service: F1Service) {}

  @Get('standings')
  @ApiOperation({ summary: 'Get F1 standings (drivers or constructors)' })
  @ApiQuery({ name: 'type', required: false, enum: ['drivers', 'constructors'], description: 'Standings type' })
  @ApiResponse({ status: 200, description: 'Driver standings', type: [F1DriverStandingResponseDto] })
  async getStandings(@Query() query: GetF1StandingsDto) {
    return this.f1Service.getStandings(query.type);
  }

  @Get('races')
  @ApiOperation({ summary: 'Get F1 race calendar' })
  @ApiQuery({ name: 'season', required: false, example: '2026', description: 'Season year' })
  @ApiResponse({ status: 200, description: 'Race calendar', type: [F1RaceResponseDto] })
  async getRaces(@Query() query: GetF1RacesDto) {
    return this.f1Service.getRaces(query.season);
  }

  @Get('live/positions')
  @ApiOperation({ summary: 'Get live position data' })
  @ApiQuery({ name: 'sessionKey', required: false, description: 'Session key' })
  @ApiResponse({ status: 200, description: 'Live positions', type: [F1PositionResponseDto] })
  async getLivePositions(@Query() query: GetF1LivePositionsDto) {
    return this.f1Service.getLivePositions(query.sessionKey);
  }

  @Get('live/laps')
  @ApiOperation({ summary: 'Get live lap data' })
  @ApiQuery({ name: 'sessionKey', required: false, description: 'Session key' })
  @ApiQuery({ name: 'driverNumber', required: false, description: 'Driver number' })
  @ApiResponse({ status: 200, description: 'Lap data', type: [F1LapResponseDto] })
  async getLiveLaps(@Query() query: GetF1LiveLapsDto) {
    return this.f1Service.getLiveLaps(query.sessionKey, query.driverNumber);
  }

  @Get('live/pitstops')
  @ApiOperation({ summary: 'Get pit stop data' })
  @ApiQuery({ name: 'sessionKey', required: false, description: 'Session key' })
  @ApiResponse({ status: 200, description: 'Pit stops', type: [F1PitStopResponseDto] })
  async getPitStops(@Query() query: GetF1PitStopsDto) {
    return this.f1Service.getPitStops(query.sessionKey);
  }
}
