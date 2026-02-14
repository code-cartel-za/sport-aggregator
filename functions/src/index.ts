import {setGlobalOptions} from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

// Football Data
export {fetchEplTeams, fetchEplPlayers, syncFixtures, syncStandings} from "./handlers/football-data.handlers";

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
  syncF1Races,
} from "./handlers/f1.handlers";

// Cache Management
export {getCacheStatus, clearCache} from "./handlers/cache.handlers";

// B2B API
export {
  b2bGetTeams, b2bGetPlayers, b2bGetFixtures, b2bGetStandings, b2bGetPredictions,
  b2bGetFplPlayers, b2bGetFplPlayer, b2bGetFplLive, b2bGetFplPrices, b2bGetFplGameweeks,
  b2bGetF1Standings, b2bGetF1Races, b2bGetF1LivePositions, b2bGetF1LiveLaps, b2bGetF1LivePitstops,
} from "./handlers/b2b.handlers";

export {
  b2bCreateApiKey, b2bRevokeApiKey, b2bGetApiKeyUsage,
} from "./handlers/b2b-admin.handlers";
