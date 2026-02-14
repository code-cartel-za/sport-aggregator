import { Injectable, inject } from '@angular/core';
import { Observable, from, of, map } from 'rxjs';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { FantasyPlayer, FplPosition } from '../models';

interface FplElement {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  selected_by_percent: string;
  form: string;
  points_per_game: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  ict_index: string;
  news: string;
  chance_of_playing_next_round: number | null;
  photo: string;
}

interface FplTeam {
  id: number;
  name: string;
  short_name: string;
}

interface FplEvent {
  id: number;
  name: string;
  deadline_time: string;
  finished: boolean;
  is_current: boolean;
  is_next: boolean;
}

interface FplBootstrap {
  elements: FplElement[];
  teams: FplTeam[];
  events: FplEvent[];
}

const POSITION_MAP: Record<number, FplPosition> = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

@Injectable({ providedIn: 'root' })
export class FplFirestoreService {
  private firestore = inject(Firestore);
  private bootstrapCache: FplBootstrap | null = null;

  private fetchBootstrap(): Observable<FplBootstrap | null> {
    if (this.bootstrapCache) {
      return of(this.bootstrapCache);
    }
    return from(getDoc(doc(this.firestore, 'fpl', 'bootstrap'))).pipe(
      map(snap => {
        if (!snap.exists()) return null;
        const data = snap.data() as FplBootstrap;
        this.bootstrapCache = data;
        return data;
      }),
    );
  }

  private mapElement(el: FplElement, teams: FplTeam[]): FantasyPlayer {
    const team = teams.find(t => t.id === el.team);
    const gamesPlayed = Math.max(el.minutes / 90, 1);
    return {
      id: el.id,
      name: `${el.first_name} ${el.second_name}`,
      shortName: el.web_name,
      team: team?.name ?? 'Unknown',
      teamShort: team?.short_name ?? 'UNK',
      position: POSITION_MAP[el.element_type] ?? 'MID',
      price: el.now_cost / 10,
      totalPoints: el.total_points,
      form: parseFloat(el.form) || 0,
      ownership: parseFloat(el.selected_by_percent) || 0,
      minutesPlayed: el.minutes,
      goals: el.goals_scored,
      assists: el.assists,
      cleanSheets: el.clean_sheets,
      yellowCards: el.yellow_cards,
      redCards: el.red_cards,
      saves: el.saves,
      bonus: el.bonus,
      pointsPerGame: parseFloat(el.points_per_game) || 0,
      ictIndex: parseFloat(el.ict_index) || 0,
      news: el.news || '',
      chanceOfPlaying: el.chance_of_playing_next_round ?? 100,
      photo: el.photo,
      last5: [],
      last10: [],
    };
  }

  getPlayers(): Observable<FantasyPlayer[]> {
    return this.fetchBootstrap().pipe(
      map(data => {
        if (!data?.elements?.length) return [];
        return data.elements.map(el => this.mapElement(el, data.teams ?? []));
      }),
    );
  }

  getPlayerById(id: number): Observable<FantasyPlayer | undefined> {
    return this.getPlayers().pipe(
      map(players => players.find(p => p.id === id)),
    );
  }

  getPlayersByPosition(position: FplPosition): Observable<FantasyPlayer[]> {
    return this.getPlayers().pipe(
      map(players => players.filter(p => p.position === position)),
    );
  }

  getTopPlayers(sortBy: keyof FantasyPlayer = 'totalPoints', limit = 20): Observable<FantasyPlayer[]> {
    return this.getPlayers().pipe(
      map(players =>
        [...players]
          .sort((a, b) => (b[sortBy] as number) - (a[sortBy] as number))
          .slice(0, limit)
      ),
    );
  }

  getGameweeks(): Observable<FplEvent[]> {
    return this.fetchBootstrap().pipe(
      map(data => data?.events ?? []),
    );
  }
}
