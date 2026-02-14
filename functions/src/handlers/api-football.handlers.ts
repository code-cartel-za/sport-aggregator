import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {apiFootballClient} from "../utils/api-clients";
import {getOrFetch} from "../utils/cache";
import {validateNumberParam} from "../utils/validation";
import {handleError} from "../utils/error-handler";
import {
  ApiResponse,
  Fixture,
  FixtureEvent,
  Lineup,
  MatchStats,
} from "../@types";

interface ApiFootballResponse<T> {
  response: T;
}

interface ApiFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { long: string; short: string; elapsed: number | null };
  };
  league: { id: number; name: string; country: string; logo: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

interface ApiFootballPrediction {
  predictions: {
    winner: { id: number; name: string; comment: string } | null;
    win_or_draw: boolean;
    under_over: string | null;
    goals: { home: string; away: string };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };
  league: { id: number; name: string };
  teams: {
    home: { id: number; name: string; logo: string };
    away: { id: number; name: string; logo: string };
  };
}

const THIRTY_SECONDS: number = 30 * 1000;
const TWELVE_HOURS: number = 12 * 60 * 60 * 1000;
const TWO_HOURS: number = 2 * 60 * 60 * 1000;

function mapFixture(f: ApiFootballFixture): Fixture {
  return {
    id: f.fixture.id,
    competition: {id: f.league.id, name: f.league.name},
    season: {id: 0, startDate: "", endDate: ""},
    utcDate: f.fixture.date,
    status: f.fixture.status.short,
    matchday: 0,
    homeTeam: {
      id: f.teams.home.id,
      name: f.teams.home.name,
      shortName: f.teams.home.name,
      tla: "",
      crest: f.teams.home.logo,
    },
    awayTeam: {
      id: f.teams.away.id,
      name: f.teams.away.name,
      shortName: f.teams.away.name,
      tla: "",
      crest: f.teams.away.logo,
    },
    score: {
      winner: null,
      fullTime: {home: f.goals.home, away: f.goals.away},
      halfTime: {
        home: f.score.halftime.home,
        away: f.score.halftime.away,
      },
    },
  };
}

export const getLiveScores = onRequest(async (_req, res) => {
  try {
    logger.info("Fetching live scores from API-Football");

    const result = await getOrFetch<Fixture[]>(
      "api-football-live",
      async (): Promise<Fixture[]> => {
        const response = await apiFootballClient.get<
          ApiFootballResponse<ApiFootballFixture[]>
        >("/fixtures?live=all");
        return response.data.response.map(mapFixture);
      },
      {ttlMs: THIRTY_SECONDS}
    );

    const apiResponse: ApiResponse<Fixture[]> = {
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getMatchEvents = onRequest(async (req, res) => {
  try {
    const fixtureId: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "fixtureId",
      1
    );

    logger.info(`Fetching events for fixture ${fixtureId}`);

    const result = await getOrFetch<FixtureEvent[]>(
      `api-football-events-${fixtureId}`,
      async (): Promise<FixtureEvent[]> => {
        const response = await apiFootballClient.get<
          ApiFootballResponse<FixtureEvent[]>
        >(`/fixtures/events?fixture=${fixtureId}`);
        return response.data.response;
      },
      {ttlMs: THIRTY_SECONDS}
    );

    const apiResponse: ApiResponse<FixtureEvent[]> = {
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getMatchLineups = onRequest(async (req, res) => {
  try {
    const fixtureId: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "fixtureId",
      1
    );

    logger.info(`Fetching lineups for fixture ${fixtureId}`);

    const result = await getOrFetch<Lineup[]>(
      `api-football-lineups-${fixtureId}`,
      async (): Promise<Lineup[]> => {
        const response = await apiFootballClient.get<
          ApiFootballResponse<Lineup[]>
        >(`/fixtures/lineups?fixture=${fixtureId}`);
        return response.data.response;
      },
      {ttlMs: TWO_HOURS}
    );

    const apiResponse: ApiResponse<Lineup[]> = {
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getMatchStats = onRequest(async (req, res) => {
  try {
    const fixtureId: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "fixtureId",
      1
    );

    logger.info(`Fetching statistics for fixture ${fixtureId}`);

    const result = await getOrFetch<MatchStats[]>(
      `api-football-stats-${fixtureId}`,
      async (): Promise<MatchStats[]> => {
        const response = await apiFootballClient.get<
          ApiFootballResponse<MatchStats[]>
        >(`/fixtures/statistics?fixture=${fixtureId}`);
        return response.data.response;
      },
      {ttlMs: THIRTY_SECONDS}
    );

    const apiResponse: ApiResponse<MatchStats[]> = {
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getMatchPredictions = onRequest(async (req, res) => {
  try {
    const fixtureId: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "fixtureId",
      1
    );

    logger.info(`Fetching predictions for fixture ${fixtureId}`);

    const result = await getOrFetch<ApiFootballPrediction[]>(
      `api-football-predictions-${fixtureId}`,
      async (): Promise<ApiFootballPrediction[]> => {
        const response = await apiFootballClient.get<
          ApiFootballResponse<ApiFootballPrediction[]>
        >(`/predictions?fixture=${fixtureId}`);
        return response.data.response;
      },
      {ttlMs: TWELVE_HOURS}
    );

    const apiResponse: ApiResponse<ApiFootballPrediction[]> = {
      success: true,
      data: result.data,
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});
