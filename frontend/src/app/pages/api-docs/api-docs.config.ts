export interface ApiEndpoint {
  id: string;
  category: 'football' | 'fpl' | 'f1' | 'management';
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  functionName: string;
  summary: string;
  description: string;
  auth: boolean;
  parameters: ApiParameter[];
  responseType: string;
  responseExample: string;
  tags: string[];
}

export interface ApiParameter {
  name: string;
  in: 'query' | 'header' | 'path';
  type: 'string' | 'number' | 'boolean';
  required: boolean;
  description: string;
  example: string;
  enum?: string[];
  min?: number;
  max?: number;
}

export const API_BASE_URL = 'https://us-central1-sport-aggregator.cloudfunctions.net';
export const API_VERSION = 'v1.0';

export const API_ENDPOINTS: ApiEndpoint[] = [
  // ─── Football ────────────────────────────────────
  {
    id: 'football-teams', category: 'football', method: 'GET',
    path: '/b2b/football/teams', functionName: 'b2bGetTeams',
    summary: 'Get Teams',
    description: 'Returns all teams for a competition with squad count, coach info, and club details.',
    auth: true,
    parameters: [
      { name: 'competition', in: 'query', type: 'string', required: false,
        description: 'Competition code (default: PL)', example: 'PL',
        enum: ['PL', 'BL1', 'SA', 'PD', 'FL1', 'CL'] },
    ],
    responseType: `interface Team {\n  id: number;\n  name: string;\n  shortName: string;\n  tla: string;\n  crest: string;\n  address: string;\n  website: string;\n  founded: number;\n  clubColors: string;\n  venue: string;\n  competitionCode: string;\n  coach: Coach | null;\n  squadCount: number;\n}\n\ninterface Coach {\n  id: number;\n  firstName: string;\n  lastName: string;\n  name: string;\n  dateOfBirth: string;\n  nationality: string;\n  contract: { start: string; until: string } | null;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 57, "name": "Arsenal FC", "shortName": "Arsenal", "tla": "ARS",\n    "crest": "https://crests.football-data.org/57.png",\n    "address": "75 Drayton Park London N5 1BU",\n    "website": "https://www.arsenal.com", "founded": 1886,\n    "clubColors": "Red / White", "venue": "Emirates Stadium",\n    "competitionCode": "PL",\n    "coach": { "id": 11, "firstName": "Mikel", "lastName": "Arteta", "name": "Mikel Arteta",\n      "dateOfBirth": "1982-03-26", "nationality": "Spain",\n      "contract": { "start": "2019-12", "until": "2027-06" } },\n    "squadCount": 27\n  }],\n  "meta": { "requestId": "abc-123", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 29, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['football', 'teams'],
  },
  {
    id: 'football-players', category: 'football', method: 'GET',
    path: '/b2b/football/players', functionName: 'b2bGetPlayers',
    summary: 'Get Players',
    description: 'Returns players filterable by team and position.',
    auth: true,
    parameters: [
      { name: 'teamId', in: 'query', type: 'number', required: false, description: 'Filter by team ID', example: '57' },
      { name: 'position', in: 'query', type: 'string', required: false, description: 'Filter by position', example: 'Midfield', enum: ['Goalkeeper', 'Defence', 'Midfield', 'Offence'] },
    ],
    responseType: `interface Player {\n  id: number;\n  name: string;\n  firstName: string | null;\n  lastName: string | null;\n  dateOfBirth: string;\n  nationality: string;\n  position: string;\n  shirtNumber: number | null;\n  teamId: number;\n  teamName: string;\n  teamTla: string;\n  competitionCode: string;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 7784, "name": "Bukayo Saka", "firstName": "Bukayo", "lastName": "Saka",\n    "dateOfBirth": "2001-09-05", "nationality": "England", "position": "Offence",\n    "shirtNumber": 7, "teamId": 57, "teamName": "Arsenal FC", "teamTla": "ARS",\n    "competitionCode": "PL"\n  }],\n  "meta": { "requestId": "def-456", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 28, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['football', 'players'],
  },
  {
    id: 'football-fixtures', category: 'football', method: 'GET',
    path: '/b2b/football/fixtures', functionName: 'b2bGetFixtures',
    summary: 'Get Fixtures',
    description: 'Returns fixtures with optional status and date filters.',
    auth: true,
    parameters: [
      { name: 'status', in: 'query', type: 'string', required: false, description: 'Filter by match status', example: 'SCHEDULED', enum: ['SCHEDULED', 'LIVE', 'IN_PLAY', 'FINISHED', 'POSTPONED'] },
      { name: 'date', in: 'query', type: 'string', required: false, description: 'Filter by date (YYYY-MM-DD)', example: '2026-02-15' },
      { name: 'competition', in: 'query', type: 'string', required: false, description: 'Competition code', example: 'PL' },
    ],
    responseType: `interface Fixture {\n  id: number;\n  competition: { id: number; name: string };\n  season: { id: number; startDate: string; endDate: string };\n  utcDate: string;\n  status: string;\n  matchday: number;\n  homeTeam: FixtureTeam;\n  awayTeam: FixtureTeam;\n  score: FixtureScore;\n}\n\ninterface FixtureTeam {\n  id: number;\n  name: string;\n  shortName: string;\n  tla: string;\n  crest: string;\n}\n\ninterface FixtureScore {\n  winner: string | null;\n  fullTime: { home: number | null; away: number | null };\n  halfTime: { home: number | null; away: number | null };\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 436245, "competition": { "id": 2021, "name": "Premier League" },\n    "season": { "id": 2024, "startDate": "2025-08-16", "endDate": "2026-05-25" },\n    "utcDate": "2026-02-15T15:00:00Z", "status": "SCHEDULED", "matchday": 26,\n    "homeTeam": { "id": 57, "name": "Arsenal FC", "shortName": "Arsenal", "tla": "ARS", "crest": "https://crests.football-data.org/57.png" },\n    "awayTeam": { "id": 65, "name": "Manchester City FC", "shortName": "Man City", "tla": "MCI", "crest": "https://crests.football-data.org/65.png" },\n    "score": { "winner": null, "fullTime": { "home": null, "away": null }, "halfTime": { "home": null, "away": null } }\n  }],\n  "meta": { "requestId": "ghi-789", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 27, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['football', 'fixtures', 'live'],
  },
  {
    id: 'football-standings', category: 'football', method: 'GET',
    path: '/b2b/football/standings', functionName: 'b2bGetStandings',
    summary: 'Get Standings',
    description: 'Returns the league table for a competition.',
    auth: true,
    parameters: [
      { name: 'competition', in: 'query', type: 'string', required: false, description: 'Competition code (default: PL)', example: 'PL' },
    ],
    responseType: `interface Standing {\n  competitionId: number;\n  competitionName: string;\n  season: { id: number; startDate: string; endDate: string };\n  standings: StandingGroup[];\n}\n\ninterface StandingGroup {\n  stage: string;\n  type: string;\n  group: string | null;\n  table: StandingRow[];\n}\n\ninterface StandingRow {\n  position: number;\n  team: { id: number; name: string; shortName: string; tla: string; crest: string };\n  playedGames: number;\n  form: string | null;\n  won: number;\n  draw: number;\n  lost: number;\n  points: number;\n  goalsFor: number;\n  goalsAgainst: number;\n  goalDifference: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": {\n    "competitionId": 2021, "competitionName": "Premier League",\n    "season": { "id": 2024, "startDate": "2025-08-16", "endDate": "2026-05-25" },\n    "standings": [{ "stage": "REGULAR_SEASON", "type": "TOTAL", "group": null, "table": [\n      { "position": 1, "team": { "id": 57, "name": "Arsenal FC", "shortName": "Arsenal", "tla": "ARS", "crest": "https://crests.football-data.org/57.png" },\n        "playedGames": 25, "form": "W,W,D,W,W", "won": 19, "draw": 3, "lost": 3, "points": 60, "goalsFor": 55, "goalsAgainst": 18, "goalDifference": 37 }\n    ] }]\n  },\n  "meta": { "requestId": "jkl-012", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 26, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['football', 'standings'],
  },
  {
    id: 'football-predictions', category: 'football', method: 'GET',
    path: '/b2b/football/predictions', functionName: 'b2bGetPredictions',
    summary: 'Get Match Predictions',
    description: 'Returns AI-generated match predictions for a specific fixture.',
    auth: true,
    parameters: [
      { name: 'fixtureId', in: 'query', type: 'string', required: true, description: 'Fixture ID', example: '436245' },
    ],
    responseType: `interface Prediction {\n  fixtureId: number;\n  homeWinProbability: number;\n  drawProbability: number;\n  awayWinProbability: number;\n  predictedScore: { home: number; away: number };\n  confidence: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": {\n    "fixtureId": 436245, "homeWinProbability": 0.45, "drawProbability": 0.28,\n    "awayWinProbability": 0.27, "predictedScore": { "home": 2, "away": 1 }, "confidence": 0.72\n  },\n  "meta": { "requestId": "mno-345", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 25, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['football', 'predictions'],
  },

  // ─── FPL ─────────────────────────────────────────
  {
    id: 'fpl-players', category: 'fpl', method: 'GET',
    path: '/b2b/fpl/players', functionName: 'b2bGetFplPlayers',
    summary: 'Get FPL Players',
    description: 'Returns all FPL players with stats, prices, and form. Supports filtering and sorting.',
    auth: true,
    parameters: [
      { name: 'position', in: 'query', type: 'string', required: false, description: 'Filter by position', example: 'MID', enum: ['GKP', 'DEF', 'MID', 'FWD'] },
      { name: 'team', in: 'query', type: 'number', required: false, description: 'Filter by team ID (1-20)', example: '1', min: 1, max: 20 },
      { name: 'minPrice', in: 'query', type: 'number', required: false, description: 'Minimum price (in tenths, e.g. 50 = £5.0)', example: '50' },
      { name: 'maxPrice', in: 'query', type: 'number', required: false, description: 'Maximum price (in tenths)', example: '130' },
      { name: 'sortBy', in: 'query', type: 'string', required: false, description: 'Sort field', example: 'total_points', enum: ['total_points', 'now_cost', 'form', 'selected_by_percent', 'ict_index'] },
    ],
    responseType: `interface FplElement {\n  id: number;\n  first_name: string;\n  second_name: string;\n  web_name: string;\n  team: number;\n  element_type: number;\n  now_cost: number;\n  selected_by_percent: string;\n  form: string;\n  points_per_game: string;\n  total_points: number;\n  minutes: number;\n  goals_scored: number;\n  assists: number;\n  clean_sheets: number;\n  yellow_cards: number;\n  red_cards: number;\n  saves: number;\n  bonus: number;\n  bps: number;\n  influence: string;\n  creativity: string;\n  threat: string;\n  ict_index: string;\n  expected_goals: string;\n  expected_assists: string;\n  chance_of_playing_next_round: number | null;\n  news: string;\n  status: string;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 328, "first_name": "Mohamed", "second_name": "Salah", "web_name": "Salah",\n    "team": 11, "element_type": 3, "now_cost": 132, "selected_by_percent": "62.3",\n    "form": "8.2", "points_per_game": "7.1", "total_points": 178, "minutes": 2210,\n    "goals_scored": 17, "assists": 13, "clean_sheets": 8,\n    "yellow_cards": 1, "red_cards": 0, "saves": 0, "bonus": 28, "bps": 582,\n    "influence": "892.4", "creativity": "1045.2", "threat": "1123.0", "ict_index": "305.8",\n    "expected_goals": "14.2", "expected_assists": "9.8",\n    "chance_of_playing_next_round": 100, "news": "", "status": "a"\n  }],\n  "meta": { "requestId": "pqr-678", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 24, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['fpl', 'players'],
  },
  {
    id: 'fpl-player', category: 'fpl', method: 'GET',
    path: '/b2b/fpl/player/{id}', functionName: 'b2bGetFplPlayer',
    summary: 'Get FPL Player Detail',
    description: 'Returns full player detail including fixture history and upcoming fixtures.',
    auth: true,
    parameters: [
      { name: 'playerId', in: 'query', type: 'number', required: true, description: 'FPL player element ID', example: '328' },
    ],
    responseType: `interface FplElementSummary {\n  fixtures: FplFixture[];\n  history: FplPlayerHistory[];\n  history_past: FplPlayerHistoryPast[];\n}\n\ninterface FplFixture {\n  id: number;\n  team_h: number;\n  team_a: number;\n  event: number | null;\n  finished: boolean;\n  kickoff_time: string | null;\n  difficulty: number;\n  is_home: boolean;\n}\n\ninterface FplPlayerHistory {\n  element: number;\n  fixture: number;\n  total_points: number;\n  was_home: boolean;\n  round: number;\n  minutes: number;\n  goals_scored: number;\n  assists: number;\n  bonus: number;\n  expected_goals: string;\n  value: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": {\n    "fixtures": [{ "id": 312, "team_h": 11, "team_a": 3, "event": 27, "finished": false,\n      "kickoff_time": "2026-02-22T15:00:00Z", "difficulty": 3, "is_home": true }],\n    "history": [{ "element": 328, "fixture": 290, "total_points": 12,\n      "was_home": true, "round": 25, "minutes": 90, "goals_scored": 1, "assists": 1,\n      "bonus": 3, "expected_goals": "0.82", "value": 132 }],\n    "history_past": []\n  },\n  "meta": { "requestId": "stu-901", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 23, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['fpl', 'player'],
  },
  {
    id: 'fpl-live', category: 'fpl', method: 'GET',
    path: '/b2b/fpl/live', functionName: 'b2bGetFplLive',
    summary: 'Get FPL Live Points',
    description: 'Returns live gameweek points for all players.',
    auth: true,
    parameters: [
      { name: 'gw', in: 'query', type: 'number', required: true, description: 'Gameweek number (1-38)', example: '25', min: 1, max: 38 },
    ],
    responseType: `interface FplLiveElement {\n  id: number;\n  stats: FplLiveStats;\n  explain: FplLiveExplain[];\n}\n\ninterface FplLiveStats {\n  minutes: number;\n  goals_scored: number;\n  assists: number;\n  clean_sheets: number;\n  saves: number;\n  bonus: number;\n  total_points: number;\n  in_dreamteam: boolean;\n}\n\ninterface FplLiveExplain {\n  fixture: number;\n  stats: { identifier: string; points: number; value: number }[];\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 328, "stats": { "minutes": 90, "goals_scored": 2, "assists": 0, "clean_sheets": 1,\n      "saves": 0, "bonus": 3, "total_points": 17, "in_dreamteam": true },\n    "explain": [{ "fixture": 290, "stats": [\n      { "identifier": "minutes", "points": 2, "value": 90 },\n      { "identifier": "goals_scored", "points": 10, "value": 2 },\n      { "identifier": "bonus", "points": 3, "value": 3 } ] }]\n  }],\n  "meta": { "requestId": "vwx-234", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 22, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['fpl', 'live'],
  },
  {
    id: 'fpl-prices', category: 'fpl', method: 'GET',
    path: '/b2b/fpl/prices', functionName: 'b2bGetFplPrices',
    summary: 'Get FPL Price Changes',
    description: 'Returns recent FPL player price changes.',
    auth: true, parameters: [],
    responseType: `interface FplPriceChange {\n  playerId: number;\n  webName: string;\n  team: number;\n  oldPrice: number;\n  newPrice: number;\n  change: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [\n    { "playerId": 328, "webName": "Salah", "team": 11, "oldPrice": 131, "newPrice": 132, "change": 1 },\n    { "playerId": 401, "webName": "Haaland", "team": 13, "oldPrice": 148, "newPrice": 147, "change": -1 }\n  ],\n  "meta": { "requestId": "yza-567", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 21, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['fpl', 'prices'],
  },
  {
    id: 'fpl-gameweeks', category: 'fpl', method: 'GET',
    path: '/b2b/fpl/gameweeks', functionName: 'b2bGetFplGameweeks',
    summary: 'Get FPL Gameweeks',
    description: 'Returns all gameweek data including deadlines, averages, and chip usage.',
    auth: true, parameters: [],
    responseType: `interface FplGameweek {\n  id: number;\n  name: string;\n  deadline_time: string;\n  average_entry_score: number;\n  finished: boolean;\n  highest_score: number | null;\n  most_captained: number | null;\n  top_element: number | null;\n  chip_plays: { chip_name: string; num_played: number }[];\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "id": 25, "name": "Gameweek 25", "deadline_time": "2026-02-07T11:30:00Z",\n    "average_entry_score": 52, "finished": true, "highest_score": 142,\n    "most_captained": 328, "top_element": 328,\n    "chip_plays": [{ "chip_name": "bboost", "num_played": 45230 }]\n  }],\n  "meta": { "requestId": "bcd-890", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 20, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['fpl', 'gameweeks'],
  },

  // ─── F1 ──────────────────────────────────────────
  {
    id: 'f1-standings', category: 'f1', method: 'GET',
    path: '/b2b/f1/standings', functionName: 'b2bGetF1Standings',
    summary: 'Get F1 Standings',
    description: 'Returns current driver or constructor championship standings.',
    auth: true,
    parameters: [
      { name: 'type', in: 'query', type: 'string', required: false, description: 'Standings type', example: 'drivers', enum: ['drivers', 'constructors'] },
    ],
    responseType: `// When type=drivers\ninterface F1DriverStanding {\n  position: string;\n  points: string;\n  wins: string;\n  Driver: {\n    driverId: string;\n    code: string;\n    givenName: string;\n    familyName: string;\n    nationality: string;\n  };\n  Constructors: {\n    constructorId: string;\n    name: string;\n    nationality: string;\n  }[];\n}\n\n// When type=constructors\ninterface F1ConstructorStanding {\n  position: string;\n  points: string;\n  wins: string;\n  Constructor: {\n    constructorId: string;\n    name: string;\n    nationality: string;\n  };\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "position": "1", "points": "437", "wins": "8",\n    "Driver": { "driverId": "max_verstappen", "code": "VER",\n      "givenName": "Max", "familyName": "Verstappen", "nationality": "Dutch" },\n    "Constructors": [{ "constructorId": "red_bull", "name": "Red Bull", "nationality": "Austrian" }]\n  }],\n  "meta": { "requestId": "efg-123", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 19, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['f1', 'standings'],
  },
  {
    id: 'f1-races', category: 'f1', method: 'GET',
    path: '/b2b/f1/races', functionName: 'b2bGetF1Races',
    summary: 'Get F1 Race Calendar',
    description: 'Returns the race calendar for a season.',
    auth: true,
    parameters: [
      { name: 'season', in: 'query', type: 'string', required: false, description: 'Season year or "current"', example: '2026' },
    ],
    responseType: `interface F1Race {\n  season: string;\n  round: string;\n  raceName: string;\n  Circuit: {\n    circuitId: string;\n    circuitName: string;\n    Location: {\n      lat: string;\n      long: string;\n      locality: string;\n      country: string;\n    };\n  };\n  date: string;\n  time: string;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "season": "2026", "round": "1", "raceName": "Bahrain Grand Prix",\n    "Circuit": { "circuitId": "bahrain", "circuitName": "Bahrain International Circuit",\n      "Location": { "lat": "26.0325", "long": "50.5106", "locality": "Sakhir", "country": "Bahrain" } },\n    "date": "2026-03-08", "time": "15:00:00Z"\n  }],\n  "meta": { "requestId": "hij-456", "timestamp": "2026-02-14T10:00:00Z", "cached": true,\n    "rateLimit": { "remaining": 18, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['f1', 'races'],
  },
  {
    id: 'f1-live-positions', category: 'f1', method: 'GET',
    path: '/b2b/f1/live/positions', functionName: 'b2bGetF1LivePositions',
    summary: 'Get F1 Live Positions',
    description: 'Returns live race positions for a session.',
    auth: true,
    parameters: [
      { name: 'sessionKey', in: 'query', type: 'number', required: true, description: 'OpenF1 session key', example: '9158' },
    ],
    responseType: `interface F1Position {\n  driver_number: number;\n  position: number;\n  date: string;\n  session_key: number;\n  meeting_key: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [\n    { "driver_number": 1, "position": 1, "date": "2026-03-08T16:42:00Z", "session_key": 9158, "meeting_key": 1230 },\n    { "driver_number": 44, "position": 2, "date": "2026-03-08T16:42:00Z", "session_key": 9158, "meeting_key": 1230 }\n  ],\n  "meta": { "requestId": "klm-789", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 17, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['f1', 'live'],
  },
  {
    id: 'f1-live-laps', category: 'f1', method: 'GET',
    path: '/b2b/f1/live/laps', functionName: 'b2bGetF1LiveLaps',
    summary: 'Get F1 Live Laps',
    description: 'Returns live lap timing data. Optionally filter by driver.',
    auth: true,
    parameters: [
      { name: 'sessionKey', in: 'query', type: 'number', required: true, description: 'OpenF1 session key', example: '9158' },
      { name: 'driverNumber', in: 'query', type: 'number', required: false, description: 'Filter by driver number', example: '1' },
    ],
    responseType: `interface F1Lap {\n  driver_number: number;\n  lap_number: number;\n  lap_duration: number | null;\n  duration_sector_1: number | null;\n  duration_sector_2: number | null;\n  duration_sector_3: number | null;\n  i1_speed: number | null;\n  i2_speed: number | null;\n  st_speed: number | null;\n  is_pit_out_lap: boolean;\n  session_key: number;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [{\n    "driver_number": 1, "lap_number": 42, "lap_duration": 91.234,\n    "duration_sector_1": 28.456, "duration_sector_2": 33.891, "duration_sector_3": 28.887,\n    "i1_speed": 312, "i2_speed": 298, "st_speed": 324, "is_pit_out_lap": false, "session_key": 9158\n  }],\n  "meta": { "requestId": "nop-012", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 16, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['f1', 'live', 'laps'],
  },
  {
    id: 'f1-live-pitstops', category: 'f1', method: 'GET',
    path: '/b2b/f1/live/pitstops', functionName: 'b2bGetF1LivePitstops',
    summary: 'Get F1 Pit Stops',
    description: 'Returns pit stop data for a session.',
    auth: true,
    parameters: [
      { name: 'sessionKey', in: 'query', type: 'number', required: true, description: 'OpenF1 session key', example: '9158' },
    ],
    responseType: `interface F1PitStop {\n  driver_number: number;\n  pit_duration: number | null;\n  lap_number: number;\n  session_key: number;\n  date: string;\n}`,
    responseExample: '{\n  "success": true,\n  "data": [\n    { "driver_number": 1, "pit_duration": 22.4, "lap_number": 18, "session_key": 9158, "date": "2026-03-08T16:12:00Z" },\n    { "driver_number": 44, "pit_duration": 23.1, "lap_number": 19, "session_key": 9158, "date": "2026-03-08T16:14:00Z" }\n  ],\n  "meta": { "requestId": "qrs-345", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 15, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['f1', 'live', 'pitstops'],
  },

  // ─── Management ──────────────────────────────────
  {
    id: 'create-api-key', category: 'management', method: 'POST',
    path: '/b2b/admin/create-key', functionName: 'b2bCreateApiKey',
    summary: 'Create API Key',
    description: 'Creates a new B2B API key. Requires admin secret in x-admin-secret header.',
    auth: false,
    parameters: [
      { name: 'x-admin-secret', in: 'header', type: 'string', required: true, description: 'Admin secret token', example: 'your-admin-secret' },
      { name: 'name', in: 'query', type: 'string', required: true, description: 'Organization name', example: 'Acme Corp' },
      { name: 'email', in: 'query', type: 'string', required: true, description: 'Contact email', example: 'dev@acme.com' },
      { name: 'tier', in: 'query', type: 'string', required: true, description: 'Pricing tier', example: 'starter', enum: ['starter', 'growth', 'enterprise'] },
    ],
    responseType: `interface B2bApiKey {\n  key: string;\n  name: string;\n  email: string;\n  tier: "starter" | "growth" | "enterprise";\n  status: "active";\n  rateLimits: { requestsPerMinute: number; requestsPerDay: number };\n  usage: { today: number; thisMinute: number; lastRequestAt: string | null };\n  permissions: string[];\n  createdAt: string;\n  expiresAt: string | null;\n}`,
    responseExample: '{\n  "success": true,\n  "data": {\n    "key": "sk_starter_a1b2c3d4e5f6g7h8i9j0", "name": "Acme Corp",\n    "email": "dev@acme.com", "tier": "starter", "status": "active",\n    "rateLimits": { "requestsPerMinute": 30, "requestsPerDay": 1000 },\n    "usage": { "today": 0, "thisMinute": 0, "lastRequestAt": null },\n    "permissions": ["*"], "createdAt": "2026-02-14T10:00:00Z", "expiresAt": null\n  },\n  "meta": { "requestId": "tuv-678", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 0, "limit": 0, "resetAt": "" } }\n}',
    tags: ['management', 'admin'],
  },
  {
    id: 'revoke-api-key', category: 'management', method: 'POST',
    path: '/b2b/admin/revoke-key', functionName: 'b2bRevokeApiKey',
    summary: 'Revoke API Key',
    description: 'Revokes an existing API key. Requires admin secret.',
    auth: false,
    parameters: [
      { name: 'x-admin-secret', in: 'header', type: 'string', required: true, description: 'Admin secret token', example: 'your-admin-secret' },
      { name: 'key', in: 'query', type: 'string', required: true, description: 'API key to revoke', example: 'sk_starter_a1b2c3d4e5f6g7h8i9j0' },
    ],
    responseType: `interface RevokeResponse {\n  key: string;\n  status: "revoked";\n}`,
    responseExample: '{\n  "success": true,\n  "data": { "key": "sk_starter_a1b2c3d4e5f6g7h8i9j0", "status": "revoked" },\n  "meta": { "requestId": "wxy-901", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 0, "limit": 0, "resetAt": "" } }\n}',
    tags: ['management', 'admin'],
  },
  {
    id: 'api-key-usage', category: 'management', method: 'GET',
    path: '/b2b/usage', functionName: 'b2bGetApiKeyUsage',
    summary: 'Get API Key Usage',
    description: 'Returns usage stats for the authenticated API key.',
    auth: true, parameters: [],
    responseType: `interface UsageResponse {\n  key: string;\n  name: string;\n  tier: "starter" | "growth" | "enterprise";\n  usage: { today: number; thisMinute: number; lastRequestAt: string | null };\n  rateLimits: { requestsPerMinute: number; requestsPerDay: number };\n  status: "active" | "suspended" | "revoked";\n}`,
    responseExample: '{\n  "success": true,\n  "data": {\n    "key": "sk_starter_a1b2c3d4e5f6g7h8i9j0", "name": "Acme Corp",\n    "tier": "starter", "usage": { "today": 142, "thisMinute": 3, "lastRequestAt": "2026-02-14T09:58:32Z" },\n    "rateLimits": { "requestsPerMinute": 30, "requestsPerDay": 1000 }, "status": "active"\n  },\n  "meta": { "requestId": "zab-234", "timestamp": "2026-02-14T10:00:00Z", "cached": false,\n    "rateLimit": { "remaining": 27, "limit": 30, "resetAt": "2026-02-14T10:01:00Z" } }\n}',
    tags: ['management', 'usage'],
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  football: '⚽ Football',
  fpl: '🏆 Fantasy Premier League',
  f1: '🏎️ Formula 1',
  management: '🔧 Management',
};

export const CATEGORY_ORDER: string[] = ['football', 'fpl', 'f1', 'management'];
