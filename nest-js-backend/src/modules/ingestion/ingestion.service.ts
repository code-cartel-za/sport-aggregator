import { Injectable, Inject, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import axios, { AxiosInstance } from 'axios';
import { CacheService } from '../../common/services/cache.service';

// ── TTL Constants (ms) ──
const FIVE_SECONDS = 5_000;
const TEN_SECONDS = 10_000;
const FIFTEEN_SECONDS = 15_000;
const ONE_HOUR = 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

// ── API Response Types ──

interface FootballDataTeamsResponse {
  competition: { id: number; name: string; code: string; emblem: string; area?: { name: string } };
  season: { id: number; startDate: string; endDate: string; currentMatchday: number };
  teams: FootballDataTeam[];
}

interface FootballDataTeam {
  id: number; name: string; shortName: string; tla: string; crest: string;
  address: string; website: string; founded: number; clubColors: string; venue: string;
  coach?: { id: number; firstName: string; lastName: string; name: string; dateOfBirth: string; nationality: string; contract?: { start: string; until: string } };
  squad?: { id: number; name: string; firstName?: string; lastName?: string; dateOfBirth: string; nationality: string; position: string; shirtNumber?: number }[];
}

interface FootballDataFixturesResponse {
  matches: FootballDataMatch[];
}

interface FootballDataMatch {
  id: number; competition: { id: number; name: string };
  season: { id: number; startDate: string; endDate: string };
  utcDate: string; status: string; matchday: number;
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string };
  score: { winner: string | null; fullTime: { home: number | null; away: number | null }; halfTime: { home: number | null; away: number | null } };
}

interface FootballDataStandingsResponse {
  competition: { id: number; name: string };
  season: { id: number; startDate: string; endDate: string };
  standings: { stage: string; type: string; group: string | null; table: FootballDataStandingRow[] }[];
}

interface FootballDataStandingRow {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number; form: string | null; won: number; draw: number; lost: number;
  points: number; goalsFor: number; goalsAgainst: number; goalDifference: number;
}

interface FplBootstrapResponse {
  elements: Record<string, unknown>[];
  teams: Record<string, unknown>[];
  events: Record<string, unknown>[];
  element_types: Record<string, unknown>[];
}

interface FplLiveResponse {
  elements: Record<string, unknown>[];
}

interface JolpicaDriverStandingsResponse {
  MRData: { StandingsTable: { StandingsLists: { DriverStandings: Record<string, unknown>[] }[] } };
}

interface JolpicaConstructorStandingsResponse {
  MRData: { StandingsTable: { StandingsLists: { ConstructorStandings: Record<string, unknown>[] }[] } };
}

interface JolpicaRaceResponse {
  MRData: { RaceTable: { Races: Record<string, unknown>[] } };
}

export interface SyncResult {
  source: string;
  recordsWritten: number;
  fromCache: boolean;
  timestamp: string;
}

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  // API Clients
  private readonly footballDataClient: AxiosInstance;
  private readonly fplClient: AxiosInstance;
  private readonly openF1Client: AxiosInstance;
  private readonly jolpicaClient: AxiosInstance;

  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
    private readonly cache: CacheService,
  ) {
    this.footballDataClient = axios.create({
      baseURL: 'https://api.football-data.org/v4',
      headers: { 'X-Auth-Token': process.env['FOOTBALL_DATA_API_KEY'] ?? '' },
    });

    this.fplClient = axios.create({
      baseURL: 'https://fantasy.premierleague.com/api',
      headers: { 'User-Agent': 'sport-aggregator/1.0' },
    });

    this.openF1Client = axios.create({
      baseURL: 'https://api.openf1.org/v1',
    });

    this.jolpicaClient = axios.create({
      baseURL: 'https://api.jolpi.ca/ergast/f1',
    });
  }

  // ═══════════════════════════════════════════
  //  FOOTBALL — Teams & Players
  // ═══════════════════════════════════════════

  async syncTeams(competition = 'PL'): Promise<SyncResult> {
    this.logger.log(`Syncing teams for ${competition}`);

    const result = await this.cache.getOrFetch<FootballDataTeamsResponse>(
      `football_teams_${competition}`,
      async () => {
        const res = await this.footballDataClient.get<FootballDataTeamsResponse>(
          `/competitions/${competition}/teams`,
        );
        return res.data;
      },
      TWENTY_FOUR_HOURS,
    );

    if (!result.fromCache) {
      const { competition: comp, season, teams } = result.data;
      const batch = this.db.batch();

      // Write competition doc
      batch.set(
        this.db.collection('competitions').doc(competition),
        {
          id: comp.id, name: comp.name, code: comp.code, emblem: comp.emblem,
          country: comp.area?.name ?? 'Unknown',
          currentSeason: { id: season.id, startDate: season.startDate, endDate: season.endDate, currentMatchday: season.currentMatchday },
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      // Write team docs
      for (const t of teams) {
        batch.set(
          this.db.collection('teams').doc(String(t.id)),
          {
            id: t.id, name: t.name, shortName: t.shortName, tla: t.tla, crest: t.crest,
            address: t.address, website: t.website, founded: t.founded, clubColors: t.clubColors,
            venue: t.venue, competitionCode: competition,
            coach: t.coach ? {
              id: t.coach.id, firstName: t.coach.firstName, lastName: t.coach.lastName,
              name: t.coach.name, dateOfBirth: t.coach.dateOfBirth, nationality: t.coach.nationality,
              contract: t.coach.contract ?? null,
            } : null,
            squadCount: t.squad?.length ?? 0,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
      }

      await batch.commit();
      this.logger.log(`Wrote ${teams.length} teams to Firestore`);
    }

    return {
      source: 'football-data.org',
      recordsWritten: result.fromCache ? 0 : result.data.teams.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncPlayers(competition = 'PL'): Promise<SyncResult> {
    this.logger.log(`Syncing players for ${competition}`);

    const result = await this.cache.getOrFetch<FootballDataTeamsResponse>(
      `football_players_${competition}`,
      async () => {
        const res = await this.footballDataClient.get<FootballDataTeamsResponse>(
          `/competitions/${competition}/teams`,
        );
        return res.data;
      },
      TWENTY_FOUR_HOURS,
    );

    let totalPlayers = 0;

    if (!result.fromCache) {
      for (const team of result.data.teams) {
        const squad = team.squad ?? [];
        if (squad.length === 0) continue;

        const batch = this.db.batch();
        for (const p of squad) {
          batch.set(
            this.db.collection('players').doc(String(p.id)),
            {
              id: p.id, name: p.name, firstName: p.firstName ?? null, lastName: p.lastName ?? null,
              dateOfBirth: p.dateOfBirth, nationality: p.nationality, position: p.position,
              shirtNumber: p.shirtNumber ?? null,
              teamId: team.id, teamName: team.name, teamTla: team.tla, competitionCode: competition,
              lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true },
          );
        }
        await batch.commit();
        totalPlayers += squad.length;
      }
      this.logger.log(`Wrote ${totalPlayers} players to Firestore`);
    }

    return {
      source: 'football-data.org',
      recordsWritten: totalPlayers,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncFixtures(competition = 'PL'): Promise<SyncResult> {
    this.logger.log(`Syncing fixtures for ${competition}`);

    const result = await this.cache.getOrFetch<FootballDataFixturesResponse>(
      `football_fixtures_${competition}`,
      async () => {
        const res = await this.footballDataClient.get<FootballDataFixturesResponse>(
          `/competitions/${competition}/matches`,
        );
        return res.data;
      },
      ONE_HOUR,
    );

    if (!result.fromCache) {
      // Store as a cache doc for the service layer
      await this.db.collection('cache').doc('fixtures').set({
        fixtures: result.data.matches,
        competitionCode: competition,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Also write individual fixture docs for querying
      const matches = result.data.matches;
      // Batch in chunks of 500 (Firestore limit)
      for (let i = 0; i < matches.length; i += 500) {
        const batch = this.db.batch();
        const chunk = matches.slice(i, i + 500);
        for (const m of chunk) {
          batch.set(
            this.db.collection('fixtures').doc(String(m.id)),
            { ...m, competitionCode: competition, lastUpdated: admin.firestore.FieldValue.serverTimestamp() },
            { merge: true },
          );
        }
        await batch.commit();
      }
      this.logger.log(`Wrote ${matches.length} fixtures to Firestore`);
    }

    return {
      source: 'football-data.org',
      recordsWritten: result.fromCache ? 0 : result.data.matches.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncStandings(competition = 'PL'): Promise<SyncResult> {
    this.logger.log(`Syncing standings for ${competition}`);

    const result = await this.cache.getOrFetch<FootballDataStandingsResponse>(
      `football_standings_${competition}`,
      async () => {
        const res = await this.footballDataClient.get<FootballDataStandingsResponse>(
          `/competitions/${competition}/standings`,
        );
        return res.data;
      },
      ONE_HOUR,
    );

    if (!result.fromCache) {
      const data = result.data;
      await this.db.collection('competitions').doc(competition)
        .collection('standings').doc('current')
        .set({
          competitionId: data.competition.id,
          competitionName: data.competition.name,
          season: data.season,
          standings: data.standings,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });

      // Also write to cache collection for the service layer
      await this.db.collection('cache').doc(`standings_${competition}`).set({
        competitionId: data.competition.id,
        competitionName: data.competition.name,
        season: data.season,
        standings: data.standings,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(`Wrote standings for ${competition} to Firestore`);
    }

    return {
      source: 'football-data.org',
      recordsWritten: result.fromCache ? 0 : result.data.standings.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════
  //  FPL — Fantasy Premier League
  // ═══════════════════════════════════════════

  async syncFplBootstrap(): Promise<SyncResult> {
    this.logger.log('Syncing FPL bootstrap data');

    const result = await this.cache.getOrFetch<FplBootstrapResponse>(
      'fpl_bootstrap',
      async () => {
        const res = await this.fplClient.get<FplBootstrapResponse>('/bootstrap-static/');
        return res.data;
      },
      TWENTY_FOUR_HOURS,
    );

    if (!result.fromCache) {
      // Write to fpl/bootstrap for the service layer
      await this.db.doc('fpl/bootstrap').set({
        elements: result.data.elements,
        teams: result.data.teams,
        events: result.data.events,
        element_types: result.data.element_types,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(`Wrote FPL bootstrap: ${result.data.elements.length} players, ${result.data.teams.length} teams`);
    }

    return {
      source: 'fantasy.premierleague.com',
      recordsWritten: result.fromCache ? 0 : result.data.elements.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncFplLive(gameweek: number): Promise<SyncResult> {
    this.logger.log(`Syncing FPL live data for GW${gameweek}`);

    const result = await this.cache.getOrFetch<FplLiveResponse>(
      `fpl_live_${gameweek}`,
      async () => {
        const res = await this.fplClient.get<FplLiveResponse>(`/event/${gameweek}/live/`);
        return res.data;
      },
      TEN_SECONDS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`fpl_live_${gameweek}`).set({
        elements: result.data.elements,
        gameweek,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Also write to fpl/live_<gw>
      await this.db.collection('fpl').doc(`live_${gameweek}`).set({
        elements: result.data.elements,
        gameweek,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      source: 'fantasy.premierleague.com',
      recordsWritten: result.fromCache ? 0 : result.data.elements.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncFplPlayerHistory(playerId: number): Promise<SyncResult> {
    this.logger.log(`Syncing FPL player history for ${playerId}`);

    const result = await this.cache.getOrFetch<Record<string, unknown>>(
      `fpl_player_${playerId}`,
      async () => {
        const res = await this.fplClient.get<Record<string, unknown>>(`/element-summary/${playerId}/`);
        return res.data;
      },
      SIX_HOURS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`fpl_player_${playerId}`).set({
        ...result.data,
        playerId,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      source: 'fantasy.premierleague.com',
      recordsWritten: result.fromCache ? 0 : 1,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════
  //  F1 — Formula 1
  // ═══════════════════════════════════════════

  async syncF1Standings(): Promise<SyncResult> {
    this.logger.log('Syncing F1 standings');

    const result = await this.cache.getOrFetch<{ drivers: Record<string, unknown>[]; constructors: Record<string, unknown>[] }>(
      'f1_standings_all',
      async () => {
        const [driversRes, constructorsRes] = await Promise.all([
          this.jolpicaClient.get<JolpicaDriverStandingsResponse>('/current/driverStandings.json'),
          this.jolpicaClient.get<JolpicaConstructorStandingsResponse>('/current/constructorStandings.json'),
        ]);

        const drivers = driversRes.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings ?? [];
        const constructors = constructorsRes.data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings ?? [];

        return { drivers, constructors };
      },
      TWENTY_FOUR_HOURS,
    );

    if (!result.fromCache) {
      await Promise.all([
        this.db.collection('cache').doc('f1_standings_drivers').set({
          standings: result.data.drivers,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }),
        this.db.collection('cache').doc('f1_standings_constructors').set({
          standings: result.data.constructors,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        }),
      ]);

      this.logger.log(`Wrote F1 standings: ${result.data.drivers.length} drivers, ${result.data.constructors.length} constructors`);
    }

    return {
      source: 'jolpica (ergast)',
      recordsWritten: result.fromCache ? 0 : result.data.drivers.length + result.data.constructors.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncF1Races(season?: string): Promise<SyncResult> {
    const yr = season ?? new Date().getFullYear().toString();
    this.logger.log(`Syncing F1 races for ${yr}`);

    const result = await this.cache.getOrFetch<Record<string, unknown>[]>(
      `f1_races_${yr}`,
      async () => {
        const res = await this.jolpicaClient.get<JolpicaRaceResponse>(`/${yr}.json`);
        return res.data.MRData.RaceTable.Races;
      },
      TWENTY_FOUR_HOURS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`f1_races_${yr}`).set({
        races: result.data,
        season: yr,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      this.logger.log(`Wrote ${result.data.length} F1 races for ${yr}`);
    }

    return {
      source: 'jolpica (ergast)',
      recordsWritten: result.fromCache ? 0 : result.data.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncF1Positions(sessionKey: number): Promise<SyncResult> {
    this.logger.log(`Syncing F1 positions for session ${sessionKey}`);

    const result = await this.cache.getOrFetch<Record<string, unknown>[]>(
      `f1_positions_${sessionKey}`,
      async () => {
        const res = await this.openF1Client.get<Record<string, unknown>[]>(`/position?session_key=${sessionKey}`);
        return res.data;
      },
      FIVE_SECONDS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`f1_positions_${sessionKey}`).set({
        positions: result.data,
        sessionKey,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      source: 'openf1.org',
      recordsWritten: result.fromCache ? 0 : result.data.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncF1Laps(sessionKey: number): Promise<SyncResult> {
    this.logger.log(`Syncing F1 laps for session ${sessionKey}`);

    const result = await this.cache.getOrFetch<Record<string, unknown>[]>(
      `f1_laps_${sessionKey}`,
      async () => {
        const res = await this.openF1Client.get<Record<string, unknown>[]>(`/laps?session_key=${sessionKey}`);
        return res.data;
      },
      TEN_SECONDS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`f1_laps_${sessionKey}`).set({
        laps: result.data,
        sessionKey,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      source: 'openf1.org',
      recordsWritten: result.fromCache ? 0 : result.data.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  async syncF1PitStops(sessionKey: number): Promise<SyncResult> {
    this.logger.log(`Syncing F1 pit stops for session ${sessionKey}`);

    const result = await this.cache.getOrFetch<Record<string, unknown>[]>(
      `f1_pitstops_${sessionKey}`,
      async () => {
        const res = await this.openF1Client.get<Record<string, unknown>[]>(`/pit?session_key=${sessionKey}`);
        return res.data;
      },
      FIFTEEN_SECONDS,
    );

    if (!result.fromCache) {
      await this.db.collection('cache').doc(`f1_pitstops_${sessionKey}`).set({
        pitStops: result.data,
        sessionKey,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    return {
      source: 'openf1.org',
      recordsWritten: result.fromCache ? 0 : result.data.length,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
  }

  // ═══════════════════════════════════════════
  //  FULL SYNC — Run all ingestion jobs
  // ═══════════════════════════════════════════

  async syncAll(): Promise<{ results: SyncResult[]; totalRecords: number; duration: number }> {
    const start = Date.now();
    const results: SyncResult[] = [];

    // Football
    results.push(await this.syncTeams());
    results.push(await this.syncPlayers());
    results.push(await this.syncFixtures());
    results.push(await this.syncStandings());

    // FPL
    results.push(await this.syncFplBootstrap());

    // F1
    results.push(await this.syncF1Standings());
    results.push(await this.syncF1Races());

    const totalRecords = results.reduce((sum, r) => sum + r.recordsWritten, 0);
    const duration = Date.now() - start;

    this.logger.log(`Full sync complete: ${totalRecords} records in ${duration}ms`);

    return { results, totalRecords, duration };
  }
}
