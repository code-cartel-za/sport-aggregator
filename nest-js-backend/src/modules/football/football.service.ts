import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

interface Team {
  id: number; name: string; shortName: string; tla: string; crest: string;
  address: string; website: string; founded: number; clubColors: string;
  venue: string; competitionCode: string; coach: Coach | null; squadCount: number;
}
interface Coach {
  id: number; firstName: string; lastName: string; name: string;
  dateOfBirth: string; nationality: string; contract: { start: string; until: string } | null;
}
interface Player {
  id: number; name: string; firstName: string | null; lastName: string | null;
  dateOfBirth: string; nationality: string; position: string; shirtNumber: number | null;
  teamId: number; teamName: string; teamTla: string; competitionCode: string;
}
interface Fixture {
  id: number; competition: { id: number; name: string };
  season: { id: number; startDate: string; endDate: string };
  utcDate: string; status: string; matchday: number;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  score: { winner: string | null; fullTime: { home: number | null; away: number | null }; halfTime: { home: number | null; away: number | null } };
}
interface Standing {
  competitionId: number; competitionName: string;
  season: { id: number; startDate: string; endDate: string };
  standings: StandingGroup[];
}
interface StandingGroup {
  stage: string; type: string; group: string | null;
  table: StandingRow[];
}
interface StandingRow {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number; form: string | null; won: number; draw: number; lost: number;
  points: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
}

const STATUS_MAP: Record<string, string[]> = {
  live: ['LIVE', 'IN_PLAY', 'PAUSED'],
  scheduled: ['SCHEDULED', 'TIMED'],
  finished: ['FINISHED'],
};

@Injectable()
export class FootballService {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async getTeams(competition?: string): Promise<Team[]> {
    let query: admin.firestore.Query = this.db.collection('teams');
    if (competition) {
      query = query.where('competitionCode', '==', competition);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Team);
  }

  async getPlayers(teamId?: string, position?: string, competition?: string): Promise<Player[]> {
    let query: admin.firestore.Query = this.db.collection('players');
    if (teamId) query = query.where('teamId', '==', parseInt(teamId, 10));
    if (position) query = query.where('position', '==', position);
    if (competition) query = query.where('competitionCode', '==', competition);
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Player);
  }

  async getFixtures(status?: string, date?: string, competition?: string): Promise<Fixture[]> {
    let query: admin.firestore.Query = this.db.collection('cache');
    // Try to read from cache/fixtures or fallback
    const cacheDoc = await this.db.collection('cache').doc('fixtures').get();
    if (cacheDoc.exists) {
      let fixtures = (cacheDoc.data()?.['fixtures'] as Fixture[]) ?? [];
      if (status && STATUS_MAP[status]) {
        const statuses = STATUS_MAP[status] as string[];
        fixtures = fixtures.filter((f) => statuses.includes(f.status));
      }
      if (date) {
        fixtures = fixtures.filter((f) => f.utcDate.startsWith(date));
      }
      if (competition) {
        fixtures = fixtures.filter((f) => f.competition.name.includes(competition));
      }
      return fixtures;
    }
    // Fallback to fixtures collection
    query = this.db.collection('fixtures');
    if (status && STATUS_MAP[status]) {
      query = query.where('status', 'in', STATUS_MAP[status]);
    }
    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as Fixture);
  }

  async getStandings(competition?: string): Promise<Standing[]> {
    const code = competition ?? 'PL';
    const doc = await this.db.collection('competitions').doc(code).collection('standings').doc('current').get();
    if (doc.exists) {
      return [doc.data() as Standing];
    }
    // Fallback: check cache
    const cacheDoc = await this.db.collection('cache').doc(`standings_${code}`).get();
    if (cacheDoc.exists) {
      return [cacheDoc.data() as Standing];
    }
    return [];
  }
}
