import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Fixture, League, Standing, HeadToHead, Team } from '../models';

const MOCK_LEAGUES: League[] = [
  { id: 39, name: 'Premier League', country: 'England', logo: 'https://media.api-sports.io/football/leagues/39.png', season: 2025 },
  { id: 140, name: 'La Liga', country: 'Spain', logo: 'https://media.api-sports.io/football/leagues/140.png', season: 2025 },
  { id: 135, name: 'Serie A', country: 'Italy', logo: 'https://media.api-sports.io/football/leagues/135.png', season: 2025 },
  { id: 78, name: 'Bundesliga', country: 'Germany', logo: 'https://media.api-sports.io/football/leagues/78.png', season: 2025 },
  { id: 61, name: 'Ligue 1', country: 'France', logo: 'https://media.api-sports.io/football/leagues/61.png', season: 2025 },
  { id: 2, name: 'Champions League', country: 'Europe', logo: 'https://media.api-sports.io/football/leagues/2.png', season: 2025 },
];

const MOCK_TEAMS: Record<number, Team[]> = {
  39: [
    { id: 33, name: 'Manchester United', logo: 'https://media.api-sports.io/football/teams/33.png', code: 'MUN' },
    { id: 40, name: 'Liverpool', logo: 'https://media.api-sports.io/football/teams/40.png', code: 'LIV' },
    { id: 49, name: 'Chelsea', logo: 'https://media.api-sports.io/football/teams/49.png', code: 'CHE' },
    { id: 50, name: 'Manchester City', logo: 'https://media.api-sports.io/football/teams/50.png', code: 'MCI' },
    { id: 42, name: 'Arsenal', logo: 'https://media.api-sports.io/football/teams/42.png', code: 'ARS' },
    { id: 47, name: 'Tottenham', logo: 'https://media.api-sports.io/football/teams/47.png', code: 'TOT' },
  ],
};

function mockFixture(id: number, home: Team, away: Team, league: League, daysFromNow: number, status: string = 'NS'): Fixture {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const isFinished = status === 'FT';
  return {
    id,
    date: d.toISOString(),
    timestamp: Math.floor(d.getTime() / 1000),
    venue: { id: 1, name: 'Stadium', city: 'City' },
    status: { long: isFinished ? 'Match Finished' : 'Not Started', short: status, elapsed: isFinished ? 90 : undefined },
    league,
    teams: {
      home: { ...home, winner: isFinished ? true : null },
      away: { ...away, winner: isFinished ? false : null },
    },
    goals: { home: isFinished ? 2 : null, away: isFinished ? 1 : null },
    score: {
      halftime: { home: isFinished ? 1 : null, away: isFinished ? 0 : null },
      fulltime: { home: isFinished ? 2 : null, away: isFinished ? 1 : null },
    },
  };
}

const PL = MOCK_LEAGUES[0];
const T = MOCK_TEAMS[39]!;

const MOCK_FIXTURES: Fixture[] = [
  mockFixture(1001, T[0], T[1], PL, 1),
  mockFixture(1002, T[2], T[3], PL, 1),
  mockFixture(1003, T[4], T[5], PL, 2),
  mockFixture(1004, T[3], T[0], PL, 3),
  mockFixture(1005, T[1], T[4], PL, -1, 'FT'),
  mockFixture(1006, T[5], T[2], PL, -2, 'FT'),
];

function mockStandings(): Standing[] {
  return T.map((team, i) => ({
    rank: i + 1,
    team,
    points: 30 - i * 4,
    goalsDiff: 20 - i * 5,
    played: 15,
    win: 10 - i,
    draw: i,
    lose: 5 + i,
    goalsFor: 35 - i * 3,
    goalsAgainst: 15 + i * 2,
    form: 'WWDLW',
  }));
}

@Injectable({ providedIn: 'root' })
export class FootballApiService {
  // private apiUrl = 'https://v3.football.api-sports.io';
  // private apiKey = ''; // Set your API-Football key here

  constructor(private http: HttpClient) {}

  getLeagues(): Observable<League[]> {
    return of(MOCK_LEAGUES);
  }

  getTeams(leagueId: number): Observable<Team[]> {
    return of(MOCK_TEAMS[leagueId] ?? T);
  }

  getFixtures(leagueId?: number, next?: number): Observable<Fixture[]> {
    let fixtures = MOCK_FIXTURES;
    if (leagueId) fixtures = fixtures.filter(f => f.league.id === leagueId);
    if (next) fixtures = fixtures.filter(f => f.status.short === 'NS').slice(0, next);
    return of(fixtures);
  }

  getResults(leagueId?: number, last?: number): Observable<Fixture[]> {
    let results = MOCK_FIXTURES.filter(f => f.status.short === 'FT');
    if (leagueId) results = results.filter(f => f.league.id === leagueId);
    if (last) results = results.slice(-last);
    return of(results);
  }

  getStandings(leagueId: number): Observable<Standing[]> {
    return of(mockStandings());
  }

  getHeadToHead(team1Id: number, team2Id: number): Observable<HeadToHead[]> {
    const t1 = T.find(t => t.id === team1Id) ?? T[0];
    const t2 = T.find(t => t.id === team2Id) ?? T[1];
    return of([
      { fixture: mockFixture(2001, t1, t2, PL, -30, 'FT'), teams: { home: t1, away: t2 }, goals: { home: 2, away: 1 } },
      { fixture: mockFixture(2002, t2, t1, PL, -60, 'FT'), teams: { home: t2, away: t1 }, goals: { home: 0, away: 3 } },
      { fixture: mockFixture(2003, t1, t2, PL, -120, 'FT'), teams: { home: t1, away: t2 }, goals: { home: 1, away: 1 } },
    ]);
  }
}
