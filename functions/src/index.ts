import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

// Football Data
export {fetchEplTeams, fetchEplPlayers} from "./handlers/football-data.handlers";

// FPL
export {
  syncFplBootstrap,
  getFplLivePoints,
  getFplPriceChanges,
  getFplPlayerSummary,
} from "./handlers/fpl.handlers";

// API-Football
export {
  getLiveScores,
  getMatchEvents,
  getMatchLineups,
  getMatchStats,
  getMatchPredictions,
} from "./handlers/api-football.handlers";

// F1
export {
  getF1Positions,
  getF1Laps,
  getF1PitStops,
  getF1RaceControl,
  getF1Intervals,
  syncF1Standings,
} from "./handlers/f1.handlers";

// Cache Management
export {getCacheStatus, clearCache} from "./handlers/cache.handlers";
