import {onRequest} from "firebase-functions/https";
import * as admin from "firebase-admin";
import {Response} from "express";
import {
  withB2bAuth,
  B2bAuthenticatedRequest,
} from "../middleware/b2b-auth.middleware";
import {getOrFetch} from "../utils/cache";
import {footballDataClient, fplClient} from "../utils/api-clients";
import {
  B2bApiResponse,
  Team,
  Player,
  Fixture,
  Standing,
  StandingGroup,
  FplElement,
  FplBootstrapResponse,
  FplLiveElement,
  FplLiveResponse,
  FplPriceChange,
  FplElementSummary,
  FplGameweek,
  F1DriverStanding,
  F1ConstructorStanding,
  F1Race,
  F1Position,
  F1Lap,
  F1PitStop,
} from "../@types";
import axios from "axios";

const db = admin.firestore();

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
const SIX_HOURS = 6 * 60 * 60 * 1000;
const SIXTY_SECONDS = 60 * 1000;

function b2bSuccess<T>(
  req: B2bAuthenticatedRequest,
  res: Response,
  data: T,
  cached: boolean
): void {
  const remaining = parseInt(res.getHeader("X-RateLimit-Remaining") as string || "0", 10);
  const limit = parseInt(res.getHeader("X-RateLimit-Limit") as string || "0", 10);
  const resetAt = (res.getHeader("X-RateLimit-Reset") as string) || "";
  const response: B2bApiResponse<T> = {
    success: true,
    data,
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      cached,
      rateLimit: {remaining, limit, resetAt},
    },
  };
  res.json(response);
}

function b2bError(
  req: B2bAuthenticatedRequest,
  res: Response,
  statusCode: number,
  code: string,
  message: string
): void {
  const response: B2bApiResponse<never> = {
    success: false,
    error: {code, message},
    meta: {
      requestId: req.requestId,
      timestamp: new Date().toISOString(),
      cached: false,
      rateLimit: {remaining: 0, limit: 0, resetAt: ""},
    },
  };
  res.status(statusCode).json(response);
}

// ─── Football ────────────────────────────────────────

export const b2bGetTeams = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const competition = (req.query["competition"] as string) || "PL";
      const result = await getOrFetch<Team[]>(
        `b2b-teams-${competition}`,
        async (): Promise<Team[]> => {
          const snap = await db.collection("teams")
            .where("competitionCode", "==", competition).get();
          return snap.docs.map((d) => d.data() as Team);
        },
        {ttlMs: SIX_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetTeams")
);

export const b2bGetPlayers = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      let query: FirebaseFirestore.Query = db.collection("players");
      const teamId = req.query["teamId"] as string | undefined;
      const position = req.query["position"] as string | undefined;
      if (teamId) query = query.where("teamId", "==", parseInt(teamId, 10));
      if (position) query = query.where("position", "==", position);
      const snap = await query.get();
      const players: Player[] = snap.docs.map((d) => d.data() as Player);
      b2bSuccess(req, res, players, false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetPlayers")
);

export const b2bGetFixtures = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const status = req.query["status"] as string | undefined;
      const date = req.query["date"] as string | undefined;
      const competition = (req.query["competition"] as string) || "PL";
      const result = await getOrFetch<Fixture[]>(
        `b2b-fixtures-${competition}-${status || "all"}-${date || "all"}`,
        async (): Promise<Fixture[]> => {
          const response = await footballDataClient.get<{matches: Fixture[]}>(
            `/competitions/${competition}/matches`,
            {params: {status, dateFrom: date, dateTo: date}}
          );
          return response.data.matches;
        },
        {ttlMs: SIXTY_SECONDS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFixtures")
);

export const b2bGetStandings = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const competition = (req.query["competition"] as string) || "PL";
      const result = await getOrFetch<Standing>(
        `b2b-standings-${competition}`,
        async (): Promise<Standing> => {
          const response = await footballDataClient.get<{
            competition: {id: number; name: string};
            season: {id: number; startDate: string; endDate: string};
            standings: StandingGroup[];
          }>(`/competitions/${competition}/standings`);
          return {
            competitionId: response.data.competition.id,
            competitionName: response.data.competition.name,
            season: response.data.season,
            standings: response.data.standings,
          };
        },
        {ttlMs: SIX_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetStandings")
);

export const b2bGetPredictions = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const fixtureId = req.query["fixtureId"] as string | undefined;
      if (!fixtureId) {
        b2bError(req, res, 400, "MISSING_PARAM", "fixtureId is required");
        return;
      }
      const snap = await db.collection("predictions").doc(fixtureId).get();
      if (!snap.exists) {
        b2bError(req, res, 404, "NOT_FOUND", "Prediction not found");
        return;
      }
      b2bSuccess(req, res, snap.data(), false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetPredictions")
);

// ─── FPL ─────────────────────────────────────────────

export const b2bGetFplPlayers = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const position = req.query["position"] as string | undefined;
      const team = req.query["team"] as string | undefined;
      const minPrice = req.query["minPrice"] as string | undefined;
      const maxPrice = req.query["maxPrice"] as string | undefined;
      const sortBy = (req.query["sortBy"] as string) || "total_points";

      const result = await getOrFetch<FplElement[]>(
        "b2b-fpl-players",
        async (): Promise<FplElement[]> => {
          const snap = await db.doc("fpl/bootstrap").get();
          const data = snap.data() as FplBootstrapResponse | undefined;
          return data?.elements || [];
        },
        {ttlMs: SIX_HOURS}
      );

      let players = result.data;
      if (position) {
        const posMap: Record<string, number> = {GKP: 1, DEF: 2, MID: 3, FWD: 4};
        const posId = posMap[position.toUpperCase()];
        if (posId) players = players.filter((p) => p.element_type === posId);
      }
      if (team) players = players.filter((p) => p.team === parseInt(team, 10));
      if (minPrice) players = players.filter((p) => p.now_cost >= parseInt(minPrice, 10));
      if (maxPrice) players = players.filter((p) => p.now_cost <= parseInt(maxPrice, 10));

      const sortKey = sortBy as keyof FplElement;
      players = [...players].sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (typeof aVal === "number" && typeof bVal === "number") return bVal - aVal;
        return String(bVal).localeCompare(String(aVal));
      });

      b2bSuccess(req, res, players, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFplPlayers")
);

export const b2bGetFplPlayer = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const playerId = req.query["playerId"] as string | undefined;
      if (!playerId) {
        b2bError(req, res, 400, "MISSING_PARAM", "playerId is required");
        return;
      }
      const result = await getOrFetch<FplElementSummary>(
        `b2b-fpl-player-${playerId}`,
        async (): Promise<FplElementSummary> => {
          const response = await fplClient.get<FplElementSummary>(
            `/element-summary/${playerId}/`
          );
          return response.data;
        },
        {ttlMs: SIX_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFplPlayer")
);

export const b2bGetFplLive = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const gw = req.query["gw"] as string | undefined;
      if (!gw) {
        b2bError(req, res, 400, "MISSING_PARAM", "gw is required");
        return;
      }
      const gwNum = parseInt(gw, 10);
      if (isNaN(gwNum) || gwNum < 1 || gwNum > 38) {
        b2bError(req, res, 400, "INVALID_PARAM", "gw must be between 1 and 38");
        return;
      }
      const result = await getOrFetch<FplLiveElement[]>(
        `b2b-fpl-live-${gwNum}`,
        async (): Promise<FplLiveElement[]> => {
          const response = await fplClient.get<FplLiveResponse>(`/event/${gwNum}/live/`);
          return response.data.elements;
        },
        {ttlMs: SIXTY_SECONDS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFplLive")
);

export const b2bGetFplPrices = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await getOrFetch<FplPriceChange[]>(
        "b2b-fpl-prices",
        async (): Promise<FplPriceChange[]> => {
          const snap = await db.collection("fpl-price-changes")
            .orderBy("change", "desc").limit(50).get();
          return snap.docs.map((d) => d.data() as FplPriceChange);
        },
        {ttlMs: SIX_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFplPrices")
);

export const b2bGetFplGameweeks = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const result = await getOrFetch<FplGameweek[]>(
        "b2b-fpl-gameweeks",
        async (): Promise<FplGameweek[]> => {
          const snap = await db.doc("fpl/bootstrap").get();
          const data = snap.data() as FplBootstrapResponse | undefined;
          return data?.events || [];
        },
        {ttlMs: TWENTY_FOUR_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetFplGameweeks")
);

// ─── F1 ──────────────────────────────────────────────

const openF1Client = axios.create({baseURL: "https://api.openf1.org/v1"});
const ergastClient = axios.create({baseURL: "https://ergast.com/api/f1"});

interface ErgastDriverStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{DriverStandings: F1DriverStanding[]}>;
    };
  };
}

interface ErgastConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{ConstructorStandings: F1ConstructorStanding[]}>;
    };
  };
}

interface ErgastRaceResponse {
  MRData: {RaceTable: {Races: F1Race[]}};
}

export const b2bGetF1Standings = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const type = (req.query["type"] as string) || "drivers";
      if (type === "drivers") {
        const result = await getOrFetch<F1DriverStanding[]>(
          "b2b-f1-driver-standings",
          async (): Promise<F1DriverStanding[]> => {
            const response = await ergastClient.get<ErgastDriverStandingsResponse>(
              "/current/driverStandings.json"
            );
            return response.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
          },
          {ttlMs: SIX_HOURS}
        );
        b2bSuccess(req, res, result.data, result.fromCache);
      } else {
        const result = await getOrFetch<F1ConstructorStanding[]>(
          "b2b-f1-constructor-standings",
          async (): Promise<F1ConstructorStanding[]> => {
            const response = await ergastClient.get<ErgastConstructorStandingsResponse>(
              "/current/constructorStandings.json"
            );
            return response.data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];
          },
          {ttlMs: SIX_HOURS}
        );
        b2bSuccess(req, res, result.data, result.fromCache);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetF1Standings")
);

export const b2bGetF1Races = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const season = (req.query["season"] as string) || "current";
      const result = await getOrFetch<F1Race[]>(
        `b2b-f1-races-${season}`,
        async (): Promise<F1Race[]> => {
          const response = await ergastClient.get<ErgastRaceResponse>(`/${season}.json`);
          return response.data.MRData.RaceTable.Races;
        },
        {ttlMs: TWENTY_FOUR_HOURS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetF1Races")
);

export const b2bGetF1LivePositions = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessionKey = req.query["sessionKey"] as string | undefined;
      if (!sessionKey) {
        b2bError(req, res, 400, "MISSING_PARAM", "sessionKey is required");
        return;
      }
      const result = await getOrFetch<F1Position[]>(
        `b2b-f1-positions-${sessionKey}`,
        async (): Promise<F1Position[]> => {
          const response = await openF1Client.get<F1Position[]>(
            "/position", {params: {session_key: sessionKey}}
          );
          return response.data;
        },
        {ttlMs: SIXTY_SECONDS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetF1LivePositions")
);

export const b2bGetF1LiveLaps = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessionKey = req.query["sessionKey"] as string | undefined;
      if (!sessionKey) {
        b2bError(req, res, 400, "MISSING_PARAM", "sessionKey is required");
        return;
      }
      const driverNumber = req.query["driverNumber"] as string | undefined;
      const params: Record<string, string> = {session_key: sessionKey};
      if (driverNumber) params["driver_number"] = driverNumber;
      const result = await getOrFetch<F1Lap[]>(
        `b2b-f1-laps-${sessionKey}-${driverNumber || "all"}`,
        async (): Promise<F1Lap[]> => {
          const response = await openF1Client.get<F1Lap[]>("/laps", {params});
          return response.data;
        },
        {ttlMs: SIXTY_SECONDS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetF1LiveLaps")
);

export const b2bGetF1LivePitstops = onRequest(
  withB2bAuth(async (req: B2bAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const sessionKey = req.query["sessionKey"] as string | undefined;
      if (!sessionKey) {
        b2bError(req, res, 400, "MISSING_PARAM", "sessionKey is required");
        return;
      }
      const result = await getOrFetch<F1PitStop[]>(
        `b2b-f1-pitstops-${sessionKey}`,
        async (): Promise<F1PitStop[]> => {
          const response = await openF1Client.get<F1PitStop[]>(
            "/pit", {params: {session_key: sessionKey}}
          );
          return response.data;
        },
        {ttlMs: SIXTY_SECONDS}
      );
      b2bSuccess(req, res, result.data, result.fromCache);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      b2bError(req, res, 500, "INTERNAL_ERROR", msg);
    }
  }, "b2bGetF1LivePitstops")
);
