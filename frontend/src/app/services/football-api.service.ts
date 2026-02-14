import { Injectable, inject } from '@angular/core';
import { Observable, from, of, map } from 'rxjs';
import {
  Firestore, collection, doc, getDoc, getDocs, query, where, orderBy, limit,
} from '@angular/fire/firestore';
import { Fixture, League, Standing, HeadToHead, Team } from '../models';

const HARDCODED_LEAGUES: League[] = [
  { id: 39, name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png', season: 2025 },
  { id: 140, name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png', season: 2025 },
  { id: 135, name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png', season: 2025 },
  { id: 78, name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png', season: 2025 },
  { id: 61, name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png', season: 2025 },
  { id: 2, name: 'Champions League', country: 'Europe', logo: 'https://media.api-sports.io/football/leagues/2.png', season: 2025 },
];

const PL_LEAGUE = HARDCODED_LEAGUES[0];

function mapFirestoreFixture(d: any): Fixture {
  const homeTeam = d.homeTeam || {};
  const awayTeam = d.awayTeam || {};
  const score = d.score || {};
  const isFinished = d.status === 'FINISHED';
  const fullHome = score.fullTime?.home ?? score.fulltime?.home ?? null;
  const fullAway = score.fullTime?.away ?? score.fulltime?.away ?? null;
  const halfHome = score.halfTime?.home ?? score.halftime?.home ?? null;
  const halfAway = score.halfTime?.away ?? score.halftime?.away ?? null;

  return {
    id: d.id,
    date: d.utcDate || d.date || '',
    timestamp: d.utcDate ? Math.floor(new Date(d.utcDate).getTime() / 1000) : 0,
    venue: { id: 0, name: '', city: '' },
    status: {
      long: isFinished ? 'Match Finished' : d.status || 'Not Started',
      short: isFinished ? 'FT' : d.status === 'SCHEDULED' ? 'NS' : (d.status || 'NS'),
      elapsed: isFinished ? 90 : undefined,
    },
    league: PL_LEAGUE,
    teams: {
      home: {
        id: homeTeam.id || 0,
        name: homeTeam.name || '',
        logo: homeTeam.crest || homeTeam.logo || '',
        code: homeTeam.tla || homeTeam.code,
        winner: isFinished && fullHome !== null && fullAway !== null ? fullHome > fullAway : null,
      },
      away: {
        id: awayTeam.id || 0,
        name: awayTeam.name || '',
        logo: awayTeam.crest || awayTeam.logo || '',
        code: awayTeam.tla || awayTeam.code,
        winner: isFinished && fullHome !== null && fullAway !== null ? fullAway > fullHome : null,
      },
    },
    goals: { home: fullHome, away: fullAway },
    score: {
      halftime: { home: halfHome, away: halfAway },
      fulltime: { home: fullHome, away: fullAway },
    },
  };
}

@Injectable({ providedIn: 'root' })
export class FootballApiService {
  private firestore = inject(Firestore);

  getLeagues(): Observable<League[]> {
    return of(HARDCODED_LEAGUES);
  }

  getTeams(leagueId?: number): Observable<Team[]> {
    return from(getDocs(collection(this.firestore, 'teams'))).pipe(
      map(snapshot => snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: data['id'],
          name: data['name'],
          logo: data['crest'] || '',
          code: data['tla'],
          country: 'England',
          founded: data['founded'],
          venue: data['venue'],
        } as Team;
      })),
    );
  }

  getFixtures(leagueId?: number, next?: number): Observable<Fixture[]> {
    return from(getDoc(doc(this.firestore, 'cache', 'fixtures'))).pipe(
      map(snap => {
        const data = snap.data();
        const fixtures: any[] = data?.['fixtures'] || [];
        let mapped = fixtures.map(mapFirestoreFixture);
        // Filter to upcoming (not finished)
        mapped = mapped.filter(f => f.status.short !== 'FT');
        // Sort by date
        mapped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        if (next) mapped = mapped.slice(0, next);
        return mapped;
      }),
    );
  }

  getResults(leagueId?: number, last?: number): Observable<Fixture[]> {
    return from(getDoc(doc(this.firestore, 'cache', 'fixtures'))).pipe(
      map(snap => {
        const data = snap.data();
        const fixtures: any[] = data?.['fixtures'] || [];
        let mapped = fixtures.map(mapFirestoreFixture);
        mapped = mapped.filter(f => f.status.short === 'FT');
        mapped.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (last) mapped = mapped.slice(0, last);
        return mapped;
      }),
    );
  }

  getStandings(leagueId: number): Observable<Standing[]> {
    return from(getDoc(doc(this.firestore, 'competitions', 'PL', 'standings', 'current'))).pipe(
      map(snap => {
        const data = snap.data();
        const standings: any[] = data?.['standings'] || [];
        // standings may be nested: standings[0].table or flat array
        let table: any[] = [];
        if (standings.length > 0 && standings[0].table) {
          table = standings[0].table;
        } else {
          table = standings;
        }
        return table.map((s: any) => ({
          rank: s.position || s.rank || 0,
          team: {
            id: s.team?.id || 0,
            name: s.team?.name || '',
            logo: s.team?.crest || s.team?.logo || '',
            code: s.team?.tla || s.team?.code,
          } as Team,
          points: s.points || 0,
          goalsDiff: s.goalDifference ?? s.goalsDiff ?? 0,
          played: s.playedGames ?? s.played ?? 0,
          win: s.won ?? s.win ?? 0,
          draw: s.draw ?? 0,
          lose: s.lost ?? s.lose ?? 0,
          goalsFor: s.goalsFor ?? 0,
          goalsAgainst: s.goalsAgainst ?? 0,
          form: s.form || '',
        } as Standing));
      }),
    );
  }

  getHeadToHead(team1Id: number, team2Id: number): Observable<HeadToHead[]> {
    // H2H not stored in Firestore yet — return empty
    return of([]);
  }
}
