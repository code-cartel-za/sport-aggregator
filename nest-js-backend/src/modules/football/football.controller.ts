import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { FootballService } from './football.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { B2bResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { GetTeamsDto } from './dto/get-teams.dto';
import { GetPlayersDto } from './dto/get-players.dto';
import { GetFixturesDto } from './dto/get-fixtures.dto';
import { GetStandingsDto } from './dto/get-standings.dto';
import {
  TeamResponseDto,
  PlayerResponseDto,
  FixtureResponseDto,
  StandingResponseDto,
} from './dto/response.dto';

@ApiTags('Football')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@UseInterceptors(B2bResponseInterceptor)
@Controller('football')
export class FootballController {
  constructor(private readonly footballService: FootballService) {}

  @Get('teams')
  @ApiOperation({ summary: 'Get football teams' })
  @ApiQuery({ name: 'competition', required: false, example: 'PL', description: 'Competition code' })
  @ApiResponse({ status: 200, description: 'List of teams', type: [TeamResponseDto] })
  async getTeams(@Query() query: GetTeamsDto) {
    return this.footballService.getTeams(query.competition);
  }

  @Get('players')
  @ApiOperation({ summary: 'Get football players' })
  @ApiQuery({ name: 'teamId', required: false, example: '57', description: 'Team ID' })
  @ApiQuery({ name: 'position', required: false, example: 'Midfielder', description: 'Position filter' })
  @ApiQuery({ name: 'competition', required: false, example: 'PL', description: 'Competition code' })
  @ApiResponse({ status: 200, description: 'List of players', type: [PlayerResponseDto] })
  async getPlayers(@Query() query: GetPlayersDto) {
    return this.footballService.getPlayers(query.teamId, query.position, query.competition);
  }

  @Get('fixtures')
  @ApiOperation({ summary: 'Get football fixtures' })
  @ApiQuery({ name: 'status', required: false, enum: ['live', 'scheduled', 'finished'], description: 'Status filter' })
  @ApiQuery({ name: 'date', required: false, example: '2026-02-14', description: 'Date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'competition', required: false, example: 'PL', description: 'Competition code' })
  @ApiResponse({ status: 200, description: 'List of fixtures', type: [FixtureResponseDto] })
  async getFixtures(@Query() query: GetFixturesDto) {
    return this.footballService.getFixtures(query.status, query.date, query.competition);
  }

  @Get('standings')
  @ApiOperation({ summary: 'Get league standings' })
  @ApiQuery({ name: 'competition', required: false, example: 'PL', description: 'Competition code' })
  @ApiResponse({ status: 200, description: 'Standings', type: [StandingResponseDto] })
  async getStandings(@Query() query: GetStandingsDto) {
    return this.footballService.getStandings(query.competition);
  }
}
