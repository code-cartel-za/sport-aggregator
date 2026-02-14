import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import {fplClient} from "../utils/api-clients";
import {getOrFetch, getCached, setCache} from "../utils/cache";
import {validateNumberParam} from "../utils/validation";
import {handleError} from "../utils/error-handler";
import {
  ApiResponse,
  FplBootstrapResponse,
  FplElement,
  FplLiveResponse,
  FplLiveElement,
  FplElementSummary,
  FplPriceChange,
} from "../@types";

const db = admin.firestore();

const TWENTY_FOUR_HOURS: number = 24 * 60 * 60 * 1000;
const SIX_HOURS: number = 6 * 60 * 60 * 1000;
const SIXTY_SECONDS: number = 60 * 1000;

export const syncFplBootstrap = onRequest(async (_req, res) => {
  try {
    logger.info("Syncing FPL bootstrap data");

    const response = await fplClient.get<FplBootstrapResponse>(
      "/bootstrap-static/"
    );
    const bootstrap: FplBootstrapResponse = response.data;

    await db.doc("fpl/bootstrap").set({
      elements: bootstrap.elements,
      teams: bootstrap.teams,
      events: bootstrap.events,
      element_types: bootstrap.element_types,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    await setCache<FplBootstrapResponse>("fpl-bootstrap", bootstrap, {
      ttlMs: TWENTY_FOUR_HOURS,
    });

    const apiResponse: ApiResponse<{
      elementsCount: number;
      teamsCount: number;
      gameweeksCount: number;
    }> = {
      success: true,
      data: {
        elementsCount: bootstrap.elements.length,
        teamsCount: bootstrap.teams.length,
        gameweeksCount: bootstrap.events.length,
      },
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getFplLivePoints = onRequest(async (req, res) => {
  try {
    const gw: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "gw",
      1,
      38
    );

    logger.info(`Fetching FPL live points for GW${gw}`);

    const result = await getOrFetch<FplLiveElement[]>(
      `fpl-live-gw-${gw}`,
      async (): Promise<FplLiveElement[]> => {
        const response = await fplClient.get<FplLiveResponse>(
          `/event/${gw}/live/`
        );
        return response.data.elements;
      },
      {ttlMs: SIXTY_SECONDS}
    );

    const apiResponse: ApiResponse<{
      gameweek: number;
      elements: FplLiveElement[];
    }> = {
      success: true,
      data: {gameweek: gw, elements: result.data},
      fromCache: result.fromCache,
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getFplPriceChanges = onRequest(async (_req, res) => {
  try {
    logger.info("Checking FPL price changes");

    const cachedBootstrap = await getCached<FplBootstrapResponse>(
      "fpl-bootstrap",
      {ttlMs: TWENTY_FOUR_HOURS}
    );

    const response = await fplClient.get<FplBootstrapResponse>(
      "/bootstrap-static/"
    );
    const current: FplBootstrapResponse = response.data;

    const changes: FplPriceChange[] = [];

    if (cachedBootstrap) {
      const oldMap = new Map<number, FplElement>();
      for (const el of cachedBootstrap.elements) {
        oldMap.set(el.id, el);
      }

      for (const el of current.elements) {
        const old: FplElement | undefined = oldMap.get(el.id);
        if (old && old.now_cost !== el.now_cost) {
          changes.push({
            playerId: el.id,
            webName: el.web_name,
            team: el.team,
            oldPrice: old.now_cost,
            newPrice: el.now_cost,
            change: el.now_cost - old.now_cost,
          });
        }
      }
    }

    await setCache<FplBootstrapResponse>("fpl-bootstrap", current, {
      ttlMs: TWENTY_FOUR_HOURS,
    });

    const apiResponse: ApiResponse<{
      changes: FplPriceChange[];
      totalChanges: number;
    }> = {
      success: true,
      data: {changes, totalChanges: changes.length},
      timestamp: new Date().toISOString(),
    };
    res.json(apiResponse);
  } catch (error: unknown) {
    handleError(error, res);
  }
});

export const getFplPlayerSummary = onRequest(async (req, res) => {
  try {
    const playerId: number = validateNumberParam(
      req.query as Record<string, unknown>,
      "playerId",
      1
    );

    logger.info(`Fetching FPL player summary for ID ${playerId}`);

    const result = await getOrFetch<FplElementSummary>(
      `fpl-player-${playerId}`,
      async (): Promise<FplElementSummary> => {
        const response = await fplClient.get<FplElementSummary>(
          `/element-summary/${playerId}/`
        );
        return response.data;
      },
      {ttlMs: SIX_HOURS}
    );

    const apiResponse: ApiResponse<FplElementSummary> = {
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
