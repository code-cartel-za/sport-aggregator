import { Controller, Get, Query, Param, UseGuards, UseInterceptors, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiSecurity, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { FplService, FplElement, FplPlayerHistory, FplLiveElement, FplPriceChange, FplGameweek } from './fpl.service';
import { ApiKeyGuard } from '../../common/guards/api-key.guard';
import { B2bResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { GetFplPlayersDto, GetFplLiveDto } from './dto/get-players.dto';
import {
  FplElementResponseDto,
  FplPlayerDetailResponseDto,
  FplLiveElementResponseDto,
  FplPriceChangeResponseDto,
  FplGameweekResponseDto,
} from './dto/response.dto';

@ApiTags('FPL')
@ApiSecurity('api-key')
@UseGuards(ApiKeyGuard)
@UseInterceptors(B2bResponseInterceptor)
@Controller('fpl')
export class FplController {
  constructor(private readonly fplService: FplService) {}

  @Get('players')
  @ApiOperation({ summary: 'Get FPL players with filtering and sorting' })
  @ApiQuery({ name: 'position', required: false, description: 'Position type (1=GK, 2=DEF, 3=MID, 4=FWD)' })
  @ApiQuery({ name: 'team', required: false, description: 'Team ID' })
  @ApiQuery({ name: 'minPrice', required: false, description: 'Min price (tenths)' })
  @ApiQuery({ name: 'maxPrice', required: false, description: 'Max price (tenths)' })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['form', 'points', 'price', 'ownership'] })
  @ApiResponse({ status: 200, description: 'List of FPL players', type: [FplElementResponseDto] })
  async getPlayers(@Query() query: GetFplPlayersDto) {
    return this.fplService.getPlayers(query.position, query.team, query.minPrice, query.maxPrice, query.sortBy);
  }

  @Get('players/:id')
  @ApiOperation({ summary: 'Get single FPL player with history' })
  @ApiParam({ name: 'id', type: Number, description: 'FPL player ID' })
  @ApiResponse({ status: 200, description: 'Player detail with history', type: FplPlayerDetailResponseDto })
  async getPlayerById(@Param('id', ParseIntPipe) id: number) {
    return this.fplService.getPlayerById(id);
  }

  @Get('live')
  @ApiOperation({ summary: 'Get live gameweek points' })
  @ApiQuery({ name: 'gw', required: false, description: 'Gameweek number' })
  @ApiResponse({ status: 200, description: 'Live gameweek data', type: [FplLiveElementResponseDto] })
  async getLive(@Query() query: GetFplLiveDto) {
    return this.fplService.getLiveGameweek(query.gw);
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get FPL price changes' })
  @ApiResponse({ status: 200, description: 'Price changes', type: [FplPriceChangeResponseDto] })
  async getPrices() {
    return this.fplService.getPriceChanges();
  }

  @Get('gameweeks')
  @ApiOperation({ summary: 'Get all gameweek data' })
  @ApiResponse({ status: 200, description: 'Gameweek data', type: [FplGameweekResponseDto] })
  async getGameweeks() {
    return this.fplService.getGameweeks();
  }
}
