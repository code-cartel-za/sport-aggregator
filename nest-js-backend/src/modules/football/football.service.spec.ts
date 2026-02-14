import { FootballService } from './football.service';
import { createMockFirestore } from '../../test/helpers/mock-firestore';

const mockTeams: Record<string, Record<string, unknown>> = {
  team1: { id: 1, name: 'Arsenal', shortName: 'Arsenal', tla: 'ARS', competitionCode: 'PL', crest: '', address: '', website: '', founded: 1886, clubColors: '', venue: '', coach: null, squadCount: 25 },
  team2: { id: 2, name: 'Chelsea', shortName: 'Chelsea', tla: 'CHE', competitionCode: 'PL', crest: '', address: '', website: '', founded: 1905, clubColors: '', venue: '', coach: null, squadCount: 25 },
};

const mockPlayers: Record<string, Record<string, unknown>> = {
  p1: { id: 1, name: 'Saka', firstName: 'Bukayo', lastName: 'Saka', dateOfBirth: '2001-09-05', nationality: 'England', position: 'Offence', shirtNumber: 7, teamId: 1, teamName: 'Arsenal', teamTla: 'ARS', competitionCode: 'PL' },
  p2: { id: 2, name: 'Palmer', firstName: 'Cole', lastName: 'Palmer', dateOfBirth: '2002-05-06', nationality: 'England', position: 'Midfield', shirtNumber: 20, teamId: 2, teamName: 'Chelsea', teamTla: 'CHE', competitionCode: 'PL' },
  p3: { id: 3, name: 'Havertz', firstName: 'Kai', lastName: 'Havertz', dateOfBirth: '1999-06-11', nationality: 'Germany', position: 'Offence', shirtNumber: 29, teamId: 1, teamName: 'Arsenal', teamTla: 'ARS', competitionCode: 'PL' },
};

const mockStandings = {
  competitionId: 2021, competitionName: 'Premier League',
  season: { id: 1, startDate: '2025-08-01', endDate: '2026-05-31' },
  standings: [{ stage: 'REGULAR_SEASON', type: 'TOTAL', group: null, table: [] }],
};

describe('FootballService', () => {
  it('should return teams from Firestore', async () => {
    const db = createMockFirestore({ teams: mockTeams });
    const service = new FootballService(db as never);
    const teams = await service.getTeams();
    expect(teams).toHaveLength(2);
  });

  it('should filter players by teamId', async () => {
    const db = createMockFirestore({ players: mockPlayers });
    const service = new FootballService(db as never);
    const players = await service.getPlayers('1');
    expect(players).toHaveLength(2);
    expect(players.every((p) => (p as unknown as Record<string, unknown>)['teamId'] === 1)).toBe(true);
  });

  it('should filter players by position', async () => {
    const db = createMockFirestore({ players: mockPlayers });
    const service = new FootballService(db as never);
    const players = await service.getPlayers(undefined, 'Midfield');
    expect(players).toHaveLength(1);
  });

  it('should return standings', async () => {
    const db = createMockFirestore({
      'competitions/PL/standings': { current: { ...mockStandings } },
    });
    const service = new FootballService(db as never);
    const standings = await service.getStandings('PL');
    expect(standings).toHaveLength(1);
    expect(standings[0].competitionName).toBe('Premier League');
  });
});
