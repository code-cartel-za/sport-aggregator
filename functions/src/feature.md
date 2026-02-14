# Sport Aggregator — Data Pipeline

## Architecture
All functions are Firebase Cloud Functions using `onRequest` (HTTP-triggered).
Firestore is used for caching with configurable TTL per endpoint.

## Functions

### Football Data (football-data.org)
- `fetchEplTeams` — Fetches and stores all EPL teams with coach data
- `fetchEplPlayers` — Fetches and stores all EPL players from squad data

### FPL (fantasy.premierleague.com)
- `syncFplBootstrap` — Syncs full bootstrap data (elements, teams, events), cache 24h
- `getFplLivePoints` — Live GW points, cache 60s. Param: `gw` (1-38)
- `getFplPriceChanges` — Detects price changes vs cached bootstrap
- `getFplPlayerSummary` — Player fixture/history data, cache 6h. Param: `playerId`

### API-Football (api-sports.io)
- `getLiveScores` — All live fixtures, cache 30s
- `getMatchEvents` — Match events, cache 30s. Param: `fixtureId`
- `getMatchLineups` — Match lineups, cache 2h. Param: `fixtureId`
- `getMatchStats` — Match statistics, cache 30s. Param: `fixtureId`
- `getMatchPredictions` — Match predictions, cache 12h. Param: `fixtureId`

### OpenF1 / Jolpica
- `getF1Positions` — Position data, cache 5s. Param: `sessionKey`
- `getF1Laps` — Lap data, cache 10s. Params: `sessionKey`, `driverNumber` (optional)
- `getF1PitStops` — Pit stop data, cache 15s. Param: `sessionKey`
- `getF1RaceControl` — Race control messages, cache 10s. Param: `sessionKey`
- `getF1Intervals` — Interval data, cache 10s. Param: `sessionKey`
- `syncF1Standings` — Driver & constructor standings from Jolpica, cache 24h

### Cache Management
- `getCacheStatus` — Lists all cache entries with staleness info
- `clearCache` — Clears specific key or all. Param: `key` (optional)

## Type System
All types in `@types/` with barrel exports:
- `common/` — ApiResponse<T>, ApiError, CacheDoc<T>, CacheStatusEntry
- `football/` — Competition, Team, Player, Fixture, Standing types
- `fpl/` — FplElement, FplTeam, FplGameweek, FplLive, FplFixture types
- `f1/` — F1Driver, F1Position, F1Lap, F1PitStop, F1Interval, F1RaceControl, F1Session types

## Utils
- `cache.ts` — Firestore-backed cache with TTL (getCached, setCache, getOrFetch)
- `validation.ts` — Input validation with ValidationError
- `error-handler.ts` — AppError, ValidationError, ExternalApiError, handleError
- `api-clients.ts` — Configured axios instances for all external APIs

## Environment Variables
- `FOOTBALL_DATA_API_KEY` — football-data.org API key
- `API_FOOTBALL_KEY` — api-sports.io API key
