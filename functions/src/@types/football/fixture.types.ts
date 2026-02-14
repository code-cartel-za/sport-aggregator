export interface Fixture {
  id: number;
  competition: { id: number; name: string };
  season: { id: number; startDate: string; endDate: string };
  utcDate: string;
  status: string;
  matchday: number;
  homeTeam: FixtureTeam;
  awayTeam: FixtureTeam;
  score: FixtureScore;
}

export interface FixtureTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FixtureScore {
  winner: string | null;
  fullTime: { home: number | null; away: number | null };
  halfTime: { home: number | null; away: number | null };
}

export interface FixtureEvent {
  time: { elapsed: number; extra: number | null };
  team: { id: number; name: string };
  player: { id: number; name: string };
  assist: { id: number | null; name: string | null };
  type: string;
  detail: string;
  comments: string | null;
}

export interface Lineup {
  team: { id: number; name: string; logo: string };
  formation: string;
  startXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach: { id: number; name: string; photo: string };
}

export interface LineupPlayer {
  player: { id: number; name: string; number: number; pos: string };
}

export interface MatchStats {
  team: { id: number; name: string; logo: string };
  statistics: MatchStatistic[];
}

export interface MatchStatistic {
  type: string;
  value: number | string | null;
}
