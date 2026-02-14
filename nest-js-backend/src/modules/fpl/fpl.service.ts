import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface FplElement {
  id: number; first_name: string; second_name: string; web_name: string;
  team: number; element_type: number; now_cost: number; selected_by_percent: string;
  form: string; points_per_game: string; total_points: number; minutes: number;
  goals_scored: number; assists: number; clean_sheets: number; goals_conceded: number;
  own_goals: number; penalties_saved: number; penalties_missed: number;
  yellow_cards: number; red_cards: number; saves: number; bonus: number; bps: number;
  influence: string; creativity: string; threat: string; ict_index: string;
  expected_goals: string; expected_assists: string; expected_goal_involvements: string;
  expected_goals_conceded: string; chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null; news: string; news_added: string | null;
  transfers_in_event: number; transfers_out_event: number; cost_change_event: number;
  cost_change_start: number; ep_this: string | null; ep_next: string | null;
  status: string; photo: string;
}

interface FplGameweek {
  id: number; name: string; deadline_time: string; average_entry_score: number;
  finished: boolean; data_checked: boolean; highest_scoring_entry: number | null;
  highest_score: number | null; most_selected: number | null;
  most_transferred_in: number | null; most_captained: number | null;
  most_vice_captained: number | null; top_element: number | null;
  chip_plays: { chip_name: string; num_played: number }[];
}

interface FplBootstrap {
  elements: FplElement[];
  events: FplGameweek[];
}

interface FplLiveElement {
  id: number;
  stats: Record<string, unknown>;
  explain: { fixture: number; stats: { identifier: string; points: number; value: number }[] }[];
}

interface FplPriceChange {
  playerId: number; webName: string; team: number;
  oldPrice: number; newPrice: number; change: number;
}

interface FplPlayerHistory {
  element: number; fixture: number; opponent_team: number; total_points: number;
  was_home: boolean; kickoff_time: string; team_h_score: number; team_a_score: number;
  round: number; minutes: number; goals_scored: number; assists: number;
  clean_sheets: number; goals_conceded: number; own_goals: number;
  penalties_saved: number; penalties_missed: number; yellow_cards: number;
  red_cards: number; saves: number; bonus: number; bps: number;
  influence: string; creativity: string; threat: string; ict_index: string;
  expected_goals: string; expected_assists: string; expected_goal_involvements: string;
  expected_goals_conceded: string; value: number; transfers_balance: number;
  selected: number; transfers_in: number; transfers_out: number;
}

type SortField = 'form' | 'points' | 'price' | 'ownership';

@Injectable()
export class FplService {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  private async getBootstrap(): Promise<FplBootstrap> {
    const doc = await this.db.collection('fpl').doc('bootstrap').get();
    if (!doc.exists) {
      // Fallback to cache
      const cache = await this.db.collection('cache').doc('fpl_bootstrap').get();
      if (!cache.exists) throw new NotFoundException('FPL bootstrap data not found');
      return cache.data() as FplBootstrap;
    }
    return doc.data() as FplBootstrap;
  }

  async getPlayers(
    position?: string, team?: string, minPrice?: string,
    maxPrice?: string, sortBy?: string,
  ): Promise<FplElement[]> {
    const bootstrap = await this.getBootstrap();
    let players = bootstrap.elements;

    if (position) players = players.filter((p) => p.element_type === parseInt(position, 10));
    if (team) players = players.filter((p) => p.team === parseInt(team, 10));
    if (minPrice) players = players.filter((p) => p.now_cost >= parseInt(minPrice, 10));
    if (maxPrice) players = players.filter((p) => p.now_cost <= parseInt(maxPrice, 10));

    const sortField = (sortBy ?? 'points') as SortField;
    const sortFns: Record<SortField, (a: FplElement, b: FplElement) => number> = {
      form: (a, b) => parseFloat(b.form) - parseFloat(a.form),
      points: (a, b) => b.total_points - a.total_points,
      price: (a, b) => b.now_cost - a.now_cost,
      ownership: (a, b) => parseFloat(b.selected_by_percent) - parseFloat(a.selected_by_percent),
    };
    players.sort(sortFns[sortField]);
    return players;
  }

  async getPlayerById(id: number): Promise<FplElement & { history: FplPlayerHistory[] }> {
    const bootstrap = await this.getBootstrap();
    const player = bootstrap.elements.find((p) => p.id === id);
    if (!player) throw new NotFoundException(`Player ${id} not found`);

    // Get history from cache
    const histDoc = await this.db.collection('cache').doc(`fpl_player_${id}`).get();
    const history: FplPlayerHistory[] = histDoc.exists
      ? (histDoc.data()?.['history'] as FplPlayerHistory[]) ?? []
      : [];

    return { ...player, history };
  }

  async getLiveGameweek(gw?: string): Promise<FplLiveElement[]> {
    const gwNum = gw ?? 'current';
    const doc = await this.db.collection('cache').doc(`fpl_live_${gwNum}`).get();
    if (!doc.exists) {
      // Try fpl/live
      const fplDoc = await this.db.collection('fpl').doc(`live_${gwNum}`).get();
      if (!fplDoc.exists) throw new NotFoundException(`Live data for GW ${gwNum} not found`);
      return (fplDoc.data()?.['elements'] as FplLiveElement[]) ?? [];
    }
    return (doc.data()?.['elements'] as FplLiveElement[]) ?? [];
  }

  async getPriceChanges(): Promise<FplPriceChange[]> {
    const doc = await this.db.collection('cache').doc('fpl_prices').get();
    if (!doc.exists) return [];
    return (doc.data()?.['changes'] as FplPriceChange[]) ?? [];
  }

  async getGameweeks(): Promise<FplGameweek[]> {
    const bootstrap = await this.getBootstrap();
    return bootstrap.events;
  }
}
