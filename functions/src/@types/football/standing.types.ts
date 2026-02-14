export interface Standing {
  competitionId: number;
  competitionName: string;
  season: { id: number; startDate: string; endDate: string };
  standings: StandingGroup[];
}

export interface StandingGroup {
  stage: string;
  type: string;
  group: string | null;
  table: StandingRow[];
}

export interface StandingRow {
  position: number;
  team: { id: number; name: string; shortName: string; tla: string; crest: string };
  playedGames: number;
  form: string | null;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}
