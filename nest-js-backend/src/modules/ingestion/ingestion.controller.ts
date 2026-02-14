import { Controller, Post, Get, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IngestionService, SyncResult } from './ingestion.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';

@ApiTags('Data Ingestion')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  // ── Full Sync ──

  @Post('sync-all')
  @ApiOperation({ summary: 'Run full data sync across all sources' })
  @ApiResponse({ status: 200, description: 'Sync results for all data sources' })
  async syncAll(): Promise<{ success: boolean; results: SyncResult[]; totalRecords: number; duration: number }> {
    const result = await this.ingestionService.syncAll();
    return { success: true, ...result };
  }

  // ── Football ──

  @Post('football/teams')
  @ApiOperation({ summary: 'Sync football teams from football-data.org' })
  @ApiQuery({ name: 'competition', required: false, description: 'Competition code (default: PL)' })
  async syncTeams(@Query('competition') competition?: string): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncTeams(competition);
    return { success: true, data };
  }

  @Post('football/players')
  @ApiOperation({ summary: 'Sync football players from football-data.org' })
  @ApiQuery({ name: 'competition', required: false, description: 'Competition code (default: PL)' })
  async syncPlayers(@Query('competition') competition?: string): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncPlayers(competition);
    return { success: true, data };
  }

  @Post('football/fixtures')
  @ApiOperation({ summary: 'Sync football fixtures from football-data.org' })
  @ApiQuery({ name: 'competition', required: false, description: 'Competition code (default: PL)' })
  async syncFixtures(@Query('competition') competition?: string): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncFixtures(competition);
    return { success: true, data };
  }

  @Post('football/standings')
  @ApiOperation({ summary: 'Sync football standings from football-data.org' })
  @ApiQuery({ name: 'competition', required: false, description: 'Competition code (default: PL)' })
  async syncStandings(@Query('competition') competition?: string): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncStandings(competition);
    return { success: true, data };
  }

  // ── FPL ──

  @Post('fpl/bootstrap')
  @ApiOperation({ summary: 'Sync FPL bootstrap (players, teams, gameweeks)' })
  async syncFplBootstrap(): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncFplBootstrap();
    return { success: true, data };
  }

  @Post('fpl/live')
  @ApiOperation({ summary: 'Sync FPL live gameweek data' })
  @ApiQuery({ name: 'gw', required: true, description: 'Gameweek number (1-38)' })
  async syncFplLive(@Query('gw', ParseIntPipe) gw: number): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncFplLive(gw);
    return { success: true, data };
  }

  @Post('fpl/player-history')
  @ApiOperation({ summary: 'Sync FPL player history' })
  @ApiQuery({ name: 'playerId', required: true, description: 'FPL player ID' })
  async syncFplPlayerHistory(@Query('playerId', ParseIntPipe) playerId: number): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncFplPlayerHistory(playerId);
    return { success: true, data };
  }

  // ── F1 ──

  @Post('f1/standings')
  @ApiOperation({ summary: 'Sync F1 driver & constructor standings' })
  async syncF1Standings(): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncF1Standings();
    return { success: true, data };
  }

  @Post('f1/races')
  @ApiOperation({ summary: 'Sync F1 race calendar' })
  @ApiQuery({ name: 'season', required: false, description: 'Season year (default: current)' })
  async syncF1Races(@Query('season') season?: string): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncF1Races(season);
    return { success: true, data };
  }

  @Post('f1/positions')
  @ApiOperation({ summary: 'Sync F1 live positions for a session' })
  @ApiQuery({ name: 'sessionKey', required: true, description: 'OpenF1 session key' })
  async syncF1Positions(@Query('sessionKey', ParseIntPipe) sessionKey: number): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncF1Positions(sessionKey);
    return { success: true, data };
  }

  @Post('f1/laps')
  @ApiOperation({ summary: 'Sync F1 lap data for a session' })
  @ApiQuery({ name: 'sessionKey', required: true, description: 'OpenF1 session key' })
  async syncF1Laps(@Query('sessionKey', ParseIntPipe) sessionKey: number): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncF1Laps(sessionKey);
    return { success: true, data };
  }

  @Post('f1/pit-stops')
  @ApiOperation({ summary: 'Sync F1 pit stop data for a session' })
  @ApiQuery({ name: 'sessionKey', required: true, description: 'OpenF1 session key' })
  async syncF1PitStops(@Query('sessionKey', ParseIntPipe) sessionKey: number): Promise<{ success: boolean; data: SyncResult }> {
    const data = await this.ingestionService.syncF1PitStops(sessionKey);
    return { success: true, data };
  }

  // ── Status ──

  @Get('status')
  @ApiOperation({ summary: 'Check ingestion service status and last sync times' })
  async getStatus(): Promise<{ success: boolean; status: string; endpoints: number }> {
    return {
      success: true,
      status: 'operational',
      endpoints: 12,
    };
  }
}
