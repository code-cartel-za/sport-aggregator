export interface Sport {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag?: string;
  season: number;
}

export interface Team {
  id: number;
  name: string;
  logo: string;
  code?: string;
  country?: string;
  founded?: number;
  venue?: string;
}

export interface Player {
  id: number;
  name: string;
  photo?: string;
  position?: string;
  nationality?: string;
  age?: number;
}

export interface Fixture {
  id: number;
  referee?: string;
  date: string;
  timestamp: number;
  venue: { id: number; name: string; city: string };
  status: { long: string; short: string; elapsed?: number };
  league: League;
  teams: { home: Team & { winner?: boolean | null }; away: Team & { winner?: boolean | null } };
  goals: { home: number | null; away: number | null };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
  };
}

export interface Standing {
  rank: number;
  team: Team;
  points: number;
  goalsDiff: number;
  played: number;
  win: number;
  draw: number;
  lose: number;
  goalsFor: number;
  goalsAgainst: number;
  form?: string;
}

export interface MatchStats {
  team: Team;
  shots: { total: number; on: number; off: number };
  possession: string;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
}

export interface HeadToHead {
  fixture: Fixture;
  teams: { home: Team; away: Team };
  goals: { home: number | null; away: number | null };
}
