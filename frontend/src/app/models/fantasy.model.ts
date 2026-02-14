/* ═══════════════════════════════════════════════════════════
   Fantasy Models — FPL & F1 Fantasy
   ═══════════════════════════════════════════════════════════ */

export type FplPosition = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface FantasyPlayer {
  id: number;
  name: string;
  shortName: string;
  team: string;
  teamShort: string;
  position: FplPosition;
  price: number;          // in millions (e.g. 12.5)
  totalPoints: number;
  form: number;           // avg pts last 5
  ownership: number;      // selection % (e.g. 45.2)
  minutesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  bonus: number;
  pointsPerGame: number;
  ictIndex: number;       // influence-creativity-threat
  news: string;           // injury/suspension info
  chanceOfPlaying: number; // 0-100
  photo?: string;
  last5: number[];        // points in last 5 GWs
  last10: number[];       // points in last 10 GWs
}

export interface FantasyProjection {
  playerId: number;
  playerName: string;
  team: string;
  position: FplPosition;
  projectedPoints: number;
  confidence: number;     // 0-100
  breakdown: PointsBreakdown;
  factors: ProjectionFactors;
}

export interface PointsBreakdown {
  minutes: number;
  goals: number;
  assists: number;
  cleanSheet: number;
  saves: number;
  bonus: number;
  yellowCards: number;
  redCards: number;
  goalsConceded: number;
  penaltiesMissed: number;
  ownGoals: number;
  total: number;
}

export interface ProjectionFactors {
  formScore: number;         // 0-10
  fixtureDifficulty: number; // 1-5 (1=easiest)
  homeAdvantage: number;     // multiplier
  historicalVsOpponent: number; // bonus pts
}

export interface FDRRating {
  teamId: number;
  teamName: string;
  teamShort: string;
  fixtures: FDRFixture[];
}

export interface FDRFixture {
  opponent: string;
  opponentShort: string;
  isHome: boolean;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=very easy, 5=very hard
  gameweek: number;
}

export interface DreamTeam {
  formation: string;       // e.g. '3-4-3'
  starters: DreamTeamPick[];
  bench: DreamTeamPick[];
  captainId: number;
  viceCaptainId: number;
  totalProjected: number;
  totalCost: number;
  budget: number;
}

export interface DreamTeamPick {
  player: FantasyPlayer;
  projectedPoints: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
  position: number;        // pitch position order
}

export interface CaptainPick {
  player: FantasyPlayer;
  projectedPoints: number;
  captainPoints: number;   // x2
  fixtureDifficulty: number;
  confidence: number;
  reason: string;
}

export interface Differential {
  player: FantasyPlayer;
  projectedPoints: number;
  valueScore: number;      // points per million
  ownershipDelta: number;  // projected - current ownership
  trend: 'rising' | 'falling' | 'stable';
}

export interface WatchlistItem {
  playerId: number;
  playerName: string;
  team: string;
  position: FplPosition;
  addedDate: string;
  priceAtAdd: number;
  currentPrice: number;
  priceChange: number;
  notes?: string;
}

export interface GameweekSummary {
  gameweek: number;
  deadline: string;
  topPicks: { name: string; team: string; projected: number }[];
  risers: { name: string; team: string; change: number }[];
  fallers: { name: string; team: string; change: number }[];
  injuries: { name: string; team: string; status: string; chance: number }[];
  keyFixtures: { home: string; away: string; fdr: number }[];
}

export interface SimulationScenario {
  playerId: number;
  playerName: string;
  events: SimulationEvent[];
  basePoints: number;
  simulatedPoints: number;
  delta: number;
}

export interface SimulationEvent {
  type: 'goal' | 'assist' | 'cleanSheet' | 'yellowCard' | 'redCard' | 'bonus' | 'penaltyMissed' | 'ownGoal' | 'saves';
  count: number;
}

/* ── F1 Fantasy ── */

export interface F1FantasyDriver {
  id: string;
  name: string;
  code: string;
  team: string;
  teamColor: string;
  price: number;
  totalPoints: number;
  ownership: number;
  last5: number[];
  last10: number[];
  avgQualifying: number;
  avgRacePosition: number;
  dnfs: number;
  fastestLaps: number;
  positionsGainedAvg: number;
}

export interface F1FantasyProjection {
  driverId: string;
  driverName: string;
  team: string;
  projectedPoints: number;
  confidence: number;
  breakdown: F1PointsBreakdown;
}

export interface F1PointsBreakdown {
  racePosition: number;
  qualifyingBonus: number;
  fastestLap: number;
  positionsGained: number;
  beatTeammate: number;
  dnfPenalty: number;
  sprint: number;
  total: number;
}

export interface F1FantasyTeam {
  drivers: F1FantasyDriver[];
  constructors: { id: string; name: string; price: number; points: number }[];
  totalProjected: number;
  totalCost: number;
  budget: number;
}

export interface PlayerComparison {
  player1: FantasyPlayer | F1FantasyDriver;
  player2: FantasyPlayer | F1FantasyDriver;
  metrics: ComparisonMetric[];
}

export interface ComparisonMetric {
  label: string;
  value1: number;
  value2: number;
  maxValue: number;
  unit?: string;
}
