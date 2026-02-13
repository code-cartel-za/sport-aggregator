import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, map } from 'rxjs';
import { FootballApiService } from './football-api.service';
import { F1ApiService } from './f1-api.service';
import { HeadToHead, Team, Driver } from '../models';

export interface FootballAnalysis {
  team1: Team;
  team2: Team;
  h2h: HeadToHead[];
  team1Wins: number;
  team2Wins: number;
  draws: number;
  team1Form: string;
  team2Form: string;
  totalGoals: number;
  avgGoals: number;
}

export interface DriverCircuitAnalysis {
  driver: Driver;
  circuitName: string;
  avgPosition: number;
  bestFinish: number;
  worstFinish: number;
  races: number;
  podiums: number;
  wins: number;
}

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  constructor(
    private footballApi: FootballApiService,
    private f1Api: F1ApiService,
  ) {}

  getFootballH2H(team1Id: number, team2Id: number): Observable<FootballAnalysis> {
    return forkJoin({
      h2h: this.footballApi.getHeadToHead(team1Id, team2Id),
      teams1: this.footballApi.getTeams(39),
    }).pipe(
      map(({ h2h, teams1 }) => {
        const team1 = teams1.find(t => t.id === team1Id) ?? teams1[0];
        const team2 = teams1.find(t => t.id === team2Id) ?? teams1[1];
        let t1w = 0, t2w = 0, dr = 0, totalGoals = 0;
        for (const m of h2h) {
          const hg = m.goals.home ?? 0;
          const ag = m.goals.away ?? 0;
          totalGoals += hg + ag;
          if (hg > ag) t1w++;
          else if (ag > hg) t2w++;
          else dr++;
        }
        return {
          team1, team2, h2h,
          team1Wins: t1w, team2Wins: t2w, draws: dr,
          team1Form: 'WWDLW', team2Form: 'WLWWD',
          totalGoals, avgGoals: h2h.length ? totalGoals / h2h.length : 0,
        };
      }),
    );
  }

  getDriverCircuitAnalysis(driverId: string, circuitId: string): Observable<DriverCircuitAnalysis> {
    // Mock analysis — in production, aggregate historical race results from Ergast
    return this.f1Api.getDrivers().pipe(
      map(drivers => {
        const driver = drivers.find(d => d.driverId === driverId) ?? drivers[0];
        return {
          driver,
          circuitName: circuitId,
          avgPosition: 3.2,
          bestFinish: 1,
          worstFinish: 7,
          races: 5,
          podiums: 4,
          wins: 2,
        };
      }),
    );
  }
}
