import { NotFoundException } from '@nestjs/common';
import { FplService } from './fpl.service';
import { createMockFirestore } from '../../test/helpers/mock-firestore';

const mockPlayers = [
  { id: 1, first_name: 'Erling', second_name: 'Haaland', web_name: 'Haaland', team: 11, element_type: 4, now_cost: 145, selected_by_percent: '55.0', form: '8.5', points_per_game: '7.2', total_points: 180, minutes: 1500, goals_scored: 20, assists: 3, clean_sheets: 0, goals_conceded: 0, own_goals: 0, penalties_saved: 0, penalties_missed: 0, yellow_cards: 1, red_cards: 0, saves: 0, bonus: 25, bps: 500, influence: '100', creativity: '30', threat: '200', ict_index: '330', expected_goals: '18', expected_assists: '2', expected_goal_involvements: '20', expected_goals_conceded: '0', chance_of_playing_next_round: 100, chance_of_playing_this_round: 100, news: '', news_added: null, transfers_in_event: 100, transfers_out_event: 50, cost_change_event: 0, cost_change_start: 5, ep_this: '6.5', ep_next: '6.5', status: 'a', photo: '' },
  { id: 2, first_name: 'Mohamed', second_name: 'Salah', web_name: 'Salah', team: 10, element_type: 3, now_cost: 130, selected_by_percent: '60.0', form: '9.0', points_per_game: '7.8', total_points: 200, minutes: 1600, goals_scored: 15, assists: 10, clean_sheets: 5, goals_conceded: 10, own_goals: 0, penalties_saved: 0, penalties_missed: 0, yellow_cards: 0, red_cards: 0, saves: 0, bonus: 30, bps: 600, influence: '120', creativity: '150', threat: '180', ict_index: '450', expected_goals: '14', expected_assists: '8', expected_goal_involvements: '22', expected_goals_conceded: '0', chance_of_playing_next_round: 100, chance_of_playing_this_round: 100, news: '', news_added: null, transfers_in_event: 200, transfers_out_event: 30, cost_change_event: 1, cost_change_start: 10, ep_this: '7.0', ep_next: '7.0', status: 'a', photo: '' },
  { id: 3, first_name: 'Virgil', second_name: 'van Dijk', web_name: 'van Dijk', team: 10, element_type: 2, now_cost: 65, selected_by_percent: '25.0', form: '5.0', points_per_game: '4.5', total_points: 100, minutes: 1800, goals_scored: 3, assists: 1, clean_sheets: 10, goals_conceded: 20, own_goals: 0, penalties_saved: 0, penalties_missed: 0, yellow_cards: 2, red_cards: 0, saves: 0, bonus: 10, bps: 300, influence: '80', creativity: '20', threat: '40', ict_index: '140', expected_goals: '2', expected_assists: '1', expected_goal_involvements: '3', expected_goals_conceded: '15', chance_of_playing_next_round: 100, chance_of_playing_this_round: 100, news: '', news_added: null, transfers_in_event: 50, transfers_out_event: 80, cost_change_event: 0, cost_change_start: -5, ep_this: '4.0', ep_next: '4.0', status: 'a', photo: '' },
];

const bootstrap = { elements: mockPlayers, events: [{ id: 1, name: 'Gameweek 1', deadline_time: '2025-08-15T11:30:00Z', average_entry_score: 50, finished: true, data_checked: true, highest_scoring_entry: null, highest_score: null, most_selected: null, most_transferred_in: null, most_captained: null, most_vice_captained: null, top_element: null, chip_plays: [] }] };

describe('FplService', () => {
  function createService(extraData: Record<string, Record<string, Record<string, unknown>>> = {}): FplService {
    const db = createMockFirestore({
      fpl: { bootstrap: { ...bootstrap } as unknown as Record<string, unknown> },
      ...extraData,
    });
    return new FplService(db as never);
  }

  it('should return all FPL players from cached bootstrap', async () => {
    const service = createService();
    const players = await service.getPlayers();
    expect(players).toHaveLength(3);
  });

  it('should filter by position', async () => {
    const service = createService();
    const players = await service.getPlayers('4'); // Forwards
    expect(players).toHaveLength(1);
    expect(players[0].web_name).toBe('Haaland');
  });

  it('should filter by team', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, '10'); // Liverpool
    expect(players).toHaveLength(2);
  });

  it('should filter by price range (minPrice/maxPrice)', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, undefined, '100', '140');
    expect(players).toHaveLength(1);
    expect(players[0].web_name).toBe('Salah');
  });

  it('should sort by form', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, undefined, undefined, undefined, 'form');
    expect(players[0].web_name).toBe('Salah');
    expect(players[1].web_name).toBe('Haaland');
  });

  it('should sort by points', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, undefined, undefined, undefined, 'points');
    expect(players[0].total_points).toBe(200);
  });

  it('should sort by price', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, undefined, undefined, undefined, 'price');
    expect(players[0].now_cost).toBe(145);
  });

  it('should sort by ownership', async () => {
    const service = createService();
    const players = await service.getPlayers(undefined, undefined, undefined, undefined, 'ownership');
    expect(players[0].web_name).toBe('Salah');
  });

  it('should return single player detail', async () => {
    const service = createService();
    const player = await service.getPlayerById(1);
    expect(player.web_name).toBe('Haaland');
    expect(player.history).toBeDefined();
  });

  it('should throw NotFoundException for nonexistent player', async () => {
    const service = createService();
    await expect(service.getPlayerById(999)).rejects.toThrow(NotFoundException);
  });

  it('should return live gameweek data', async () => {
    const liveData = [{ id: 1, stats: { minutes: 90 }, explain: [] }];
    const service = createService({
      cache: { fpl_live_1: { elements: liveData } as unknown as Record<string, unknown> },
    });
    const result = await service.getLiveGameweek('1');
    expect(result).toHaveLength(1);
  });
});
