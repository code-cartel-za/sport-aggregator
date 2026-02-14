import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import {openF1Client, jolpicaClient} from "../utils/api-clients";
import {getOrFetch} from "../utils/cache";
import {validateNumberParam, validateOptionalNumberParam} from "../utils/validation";
import {handleError} from "../utils/error-handler";
import {
  ApiResponse,
  F1Position,
  F1Lap,
  F1PitStop,
  F1RaceControl,
  F1Interval,
  F1DriverStanding,
  F1ConstructorStanding,
} from "../@types";

const FIVE_SECONDS: number = 5 * 1000;
const TEN_SECONDS: number = 10 * 1000;
const FIFTEEN_SECONDS: number = 15 * 1000;
const TWENTY_FOUR_HOURS: number = 24 * 60 * 60 * 1000;

export const getF1Positions = onRequest(async (req, res) => {
  try {
    const sessionKey: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "sessionKey",
      1
    );

    logger.info(`Fetching F1 positions for session ${sessionKey}`);

    const result = await getOrFetch<F1Position[]>(
      `f1-positions-${sessionKey}`,
      async (): Promise<F1Position[]> => {
        const response = await openF1Client.get<F1Position[]>(
          `/position?session_key=${sessionKey}`
        );
        return response.data;
      },
      {ttlMs: FIVE_SECONDS}
    );

    const apiResponse: ApiResponse<F1Position[]> = {
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

export const getF1Laps = onRequest(async (req, res) => {
  try {
    const sessionKey: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "sessionKey",
      1
    );
    const driverNumber: number | undefined = validateOptionalNumberParam(
      req.query as Record<string, unknown>,
      "driverNumber",
      1
    );

    let url: string = `/laps?session_key=${sessionKey}`;
    if (driverNumber !== undefined) {
      url += `&driver_number=${driverNumber}`;
    }

    logger.info(`Fetching F1 laps for session ${sessionKey}`);

    const cacheKey: string = driverNumber !== undefined
      ? `f1-laps-${sessionKey}-${driverNumber}`
      : `f1-laps-${sessionKey}`;

    const result = await getOrFetch<F1Lap[]>(
      cacheKey,
      async (): Promise<F1Lap[]> => {
        const response = await openF1Client.get<F1Lap[]>(url);
        return response.data;
      },
      {ttlMs: TEN_SECONDS}
    );

    const apiResponse: ApiResponse<F1Lap[]> = {
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

export const getF1PitStops = onRequest(async (req, res) => {
  try {
    const sessionKey: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "sessionKey",
      1
    );

    logger.info(`Fetching F1 pit stops for session ${sessionKey}`);

    const result = await getOrFetch<F1PitStop[]>(
      `f1-pits-${sessionKey}`,
      async (): Promise<F1PitStop[]> => {
        const response = await openF1Client.get<F1PitStop[]>(
          `/pit?session_key=${sessionKey}`
        );
        return response.data;
      },
      {ttlMs: FIFTEEN_SECONDS}
    );

    const apiResponse: ApiResponse<F1PitStop[]> = {
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

export const getF1RaceControl = onRequest(async (req, res) => {
  try {
    const sessionKey: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "sessionKey",
      1
    );

    logger.info(`Fetching F1 race control for session ${sessionKey}`);

    const result = await getOrFetch<F1RaceControl[]>(
      `f1-race-control-${sessionKey}`,
      async (): Promise<F1RaceControl[]> => {
        const response = await openF1Client.get<F1RaceControl[]>(
          `/race_control?session_key=${sessionKey}`
        );
        return response.data;
      },
      {ttlMs: TEN_SECONDS}
    );

    const apiResponse: ApiResponse<F1RaceControl[]> = {
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

export const getF1Intervals = onRequest(async (req, res) => {
  try {
    const sessionKey: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "sessionKey",
      1
    );

    logger.info(`Fetching F1 intervals for session ${sessionKey}`);

    const result = await getOrFetch<F1Interval[]>(
      `f1-intervals-${sessionKey}`,
      async (): Promise<F1Interval[]> => {
        const response = await openF1Client.get<F1Interval[]>(
          `/intervals?session_key=${sessionKey}`
        );
        return response.data;
      },
      {ttlMs: TEN_SECONDS}
    );

    const apiResponse: ApiResponse<F1Interval[]> = {
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

interface JolpicaDriverStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        DriverStandings: F1DriverStanding[];
      }>;
    };
  };
}

interface JolpicaConstructorStandingsResponse {
  MRData: {
    StandingsTable: {
      StandingsLists: Array<{
        ConstructorStandings: F1ConstructorStanding[];
      }>;
    };
  };
}

interface F1StandingsData {
  driverStandings: F1DriverStanding[];
  constructorStandings: F1ConstructorStanding[];
}

export const syncF1Standings = onRequest(async (_req, res) => {
  try {
    logger.info("Syncing F1 standings from Jolpica");

    const result = await getOrFetch<F1StandingsData>(
      "f1-standings",
      async (): Promise<F1StandingsData> => {
        const [driversRes, constructorsRes] = await Promise.all([
          jolpicaClient.get<JolpicaDriverStandingsResponse>(
            "/current/driverStandings.json"
          ),
          jolpicaClient.get<JolpicaConstructorStandingsResponse>(
            "/current/constructorStandings.json"
          ),
        ]);

        const driverStandings: F1DriverStanding[] =
          driversRes.data.MRData.StandingsTable.StandingsLists[0]
            ?.DriverStandings || [];
        const constructorStandings: F1ConstructorStanding[] =
          constructorsRes.data.MRData.StandingsTable.StandingsLists[0]
            ?.ConstructorStandings || [];

        return {driverStandings, constructorStandings};
      },
      {ttlMs: TWENTY_FOUR_HOURS}
    );

    const apiResponse: ApiResponse<F1StandingsData> = {
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
