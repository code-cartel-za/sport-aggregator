# Feature: EPL Data Ingestion

## Goal
Pull English Premier League team and player data from football-data.org and store in Firestore.

## Cloud Functions (onRequest)

### `fetchEplTeams`
- Fetches all 20 EPL teams from `/competitions/PL/teams`
- Stores competition metadata in `competitions/PL`
- Stores each team in `teams/{teamId}` with coach info, venue, crest, etc.

### `fetchEplPlayers`
- Fetches all squads (comes bundled with the teams endpoint)
- Stores each player in `players/{playerId}` with team reference, position, nationality, etc.

## Firestore Collections

### `competitions`
- Doc ID: competition code (e.g. `PL`)
- Fields: name, emblem, country, currentSeason

### `teams`
- Doc ID: team ID from API (numeric string)
- Fields: name, shortName, tla, crest, venue, founded, clubColors, coach, squadCount

### `players`
- Doc ID: player ID from API (numeric string)
- Fields: name, firstName, lastName, dateOfBirth, nationality, position, shirtNumber, teamId, teamName, teamTla

## API
- Source: football-data.org (free tier, 10 req/min)
- Auth: `FOOTBALL_DATA_API_KEY` env var → `X-Auth-Token` header
- EPL competition code: `PL`

## Progress
- [x] Created `fetchEplTeams` cloud function
- [x] Created `fetchEplPlayers` cloud function
- [x] TypeScript compiles clean
- [ ] Deploy & test
- [ ] Review data structure with team
