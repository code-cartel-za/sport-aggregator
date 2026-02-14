import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  FantasyPlayer, FantasyProjection, PointsBreakdown, ProjectionFactors,
  CaptainPick, Differential, DreamTeam, DreamTeamPick, GameweekSummary,
  SimulationScenario, SimulationEvent, FplPosition,
  F1FantasyDriver, F1FantasyProjection, F1PointsBreakdown, F1FantasyTeam,
  PlayerComparison, ComparisonMetric,
} from '../models';

/* ═══════════════════════════════════════════════════════════
   FPL Scoring Constants
   ═══════════════════════════════════════════════════════════ */
const GOAL_POINTS: Record<FplPosition, number> = { GK: 6, DEF: 6, MID: 5, FWD: 4 };
const CS_POINTS: Record<FplPosition, number> = { GK: 4, DEF: 4, MID: 1, FWD: 0 };

/* ═══════════════════════════════════════════════════════════
   Mock FPL Players — Realistic 2025/26 data
   ═══════════════════════════════════════════════════════════ */
const MOCK_FPL_PLAYERS: FantasyPlayer[] = [
  { id: 1, name: 'Erling Haaland', shortName: 'Haaland', team: 'Manchester City', teamShort: 'MCI', position: 'FWD', price: 14.2, totalPoints: 142, form: 8.2, ownership: 67.3, minutesPlayed: 1350, goals: 16, assists: 4, cleanSheets: 0, yellowCards: 1, redCards: 0, saves: 0, bonus: 18, pointsPerGame: 7.9, ictIndex: 312, news: '', chanceOfPlaying: 100, last5: [12, 6, 8, 13, 2], last10: [12, 6, 8, 13, 2, 9, 5, 11, 7, 3] },
  { id: 2, name: 'Mohamed Salah', shortName: 'Salah', team: 'Liverpool', teamShort: 'LIV', position: 'MID', price: 13.1, totalPoints: 158, form: 9.1, ownership: 72.1, minutesPlayed: 1440, goals: 12, assists: 10, cleanSheets: 5, yellowCards: 0, redCards: 0, saves: 0, bonus: 22, pointsPerGame: 8.8, ictIndex: 345, news: '', chanceOfPlaying: 100, last5: [15, 8, 6, 12, 5], last10: [15, 8, 6, 12, 5, 10, 7, 9, 13, 4] },
  { id: 3, name: 'Bukayo Saka', shortName: 'Saka', team: 'Arsenal', teamShort: 'ARS', position: 'MID', price: 10.5, totalPoints: 126, form: 7.4, ownership: 48.6, minutesPlayed: 1380, goals: 8, assists: 9, cleanSheets: 6, yellowCards: 2, redCards: 0, saves: 0, bonus: 15, pointsPerGame: 7.0, ictIndex: 289, news: '', chanceOfPlaying: 100, last5: [9, 6, 11, 3, 8], last10: [9, 6, 11, 3, 8, 7, 5, 12, 2, 6] },
  { id: 4, name: 'Cole Palmer', shortName: 'Palmer', team: 'Chelsea', teamShort: 'CHE', position: 'MID', price: 11.0, totalPoints: 135, form: 8.0, ownership: 55.2, minutesPlayed: 1350, goals: 10, assists: 8, cleanSheets: 3, yellowCards: 1, redCards: 0, saves: 0, bonus: 16, pointsPerGame: 7.5, ictIndex: 298, news: '', chanceOfPlaying: 100, last5: [11, 7, 9, 5, 8], last10: [11, 7, 9, 5, 8, 6, 12, 3, 8, 10] },
  { id: 5, name: 'Alexander Isak', shortName: 'Isak', team: 'Newcastle', teamShort: 'NEW', position: 'FWD', price: 9.2, totalPoints: 110, form: 6.8, ownership: 32.5, minutesPlayed: 1260, goals: 12, assists: 3, cleanSheets: 0, yellowCards: 0, redCards: 0, saves: 0, bonus: 12, pointsPerGame: 6.5, ictIndex: 256, news: '', chanceOfPlaying: 100, last5: [8, 5, 2, 12, 7], last10: [8, 5, 2, 12, 7, 6, 9, 3, 5, 8] },
  { id: 6, name: 'Virgil van Dijk', shortName: 'Van Dijk', team: 'Liverpool', teamShort: 'LIV', position: 'DEF', price: 6.5, totalPoints: 108, form: 6.2, ownership: 38.1, minutesPlayed: 1440, goals: 3, assists: 2, cleanSheets: 9, yellowCards: 3, redCards: 0, saves: 0, bonus: 14, pointsPerGame: 6.0, ictIndex: 145, news: '', chanceOfPlaying: 100, last5: [6, 8, 2, 7, 8], last10: [6, 8, 2, 7, 8, 1, 9, 6, 2, 7] },
  { id: 7, name: 'William Saliba', shortName: 'Saliba', team: 'Arsenal', teamShort: 'ARS', position: 'DEF', price: 6.0, totalPoints: 102, form: 5.8, ownership: 35.4, minutesPlayed: 1440, goals: 2, assists: 1, cleanSheets: 10, yellowCards: 2, redCards: 0, saves: 0, bonus: 12, pointsPerGame: 5.7, ictIndex: 112, news: '', chanceOfPlaying: 100, last5: [6, 7, 1, 8, 7], last10: [6, 7, 1, 8, 7, 2, 6, 9, 1, 6] },
  { id: 8, name: 'Trent Alexander-Arnold', shortName: 'TAA', team: 'Liverpool', teamShort: 'LIV', position: 'DEF', price: 7.2, totalPoints: 115, form: 6.8, ownership: 41.2, minutesPlayed: 1350, goals: 2, assists: 8, cleanSheets: 8, yellowCards: 3, redCards: 0, saves: 0, bonus: 10, pointsPerGame: 6.4, ictIndex: 198, news: '', chanceOfPlaying: 100, last5: [9, 3, 8, 7, 7], last10: [9, 3, 8, 7, 7, 2, 11, 5, 6, 3] },
  { id: 9, name: 'Alisson', shortName: 'Alisson', team: 'Liverpool', teamShort: 'LIV', position: 'GK', price: 5.5, totalPoints: 95, form: 5.6, ownership: 28.3, minutesPlayed: 1440, goals: 0, assists: 0, cleanSheets: 9, yellowCards: 1, redCards: 0, saves: 45, bonus: 8, pointsPerGame: 5.3, ictIndex: 52, news: '', chanceOfPlaying: 100, last5: [6, 3, 7, 5, 7], last10: [6, 3, 7, 5, 7, 2, 8, 3, 6, 2] },
  { id: 10, name: 'David Raya', shortName: 'Raya', team: 'Arsenal', teamShort: 'ARS', position: 'GK', price: 5.5, totalPoints: 98, form: 5.8, ownership: 30.1, minutesPlayed: 1440, goals: 0, assists: 1, cleanSheets: 10, yellowCards: 0, redCards: 0, saves: 42, bonus: 9, pointsPerGame: 5.4, ictIndex: 48, news: '', chanceOfPlaying: 100, last5: [7, 2, 8, 6, 6], last10: [7, 2, 8, 6, 6, 1, 9, 5, 7, 3] },
  { id: 11, name: 'Bruno Fernandes', shortName: 'Fernandes', team: 'Manchester United', teamShort: 'MUN', position: 'MID', price: 8.8, totalPoints: 95, form: 5.4, ownership: 22.5, minutesPlayed: 1350, goals: 6, assists: 7, cleanSheets: 2, yellowCards: 5, redCards: 0, saves: 0, bonus: 8, pointsPerGame: 5.3, ictIndex: 234, news: '', chanceOfPlaying: 100, last5: [3, 8, 5, 2, 9], last10: [3, 8, 5, 2, 9, 6, 4, 7, 1, 5] },
  { id: 12, name: 'Phil Foden', shortName: 'Foden', team: 'Manchester City', teamShort: 'MCI', position: 'MID', price: 9.3, totalPoints: 88, form: 5.0, ownership: 18.7, minutesPlayed: 1170, goals: 6, assists: 5, cleanSheets: 4, yellowCards: 1, redCards: 0, saves: 0, bonus: 10, pointsPerGame: 5.2, ictIndex: 245, news: 'Minor knock - 75% chance', chanceOfPlaying: 75, last5: [2, 8, 5, 6, 4], last10: [2, 8, 5, 6, 4, 7, 3, 9, 2, 5] },
  { id: 13, name: 'Ollie Watkins', shortName: 'Watkins', team: 'Aston Villa', teamShort: 'AVL', position: 'FWD', price: 8.5, totalPoints: 92, form: 5.6, ownership: 19.8, minutesPlayed: 1350, goals: 9, assists: 5, cleanSheets: 0, yellowCards: 2, redCards: 0, saves: 0, bonus: 9, pointsPerGame: 5.1, ictIndex: 223, news: '', chanceOfPlaying: 100, last5: [5, 7, 2, 9, 5], last10: [5, 7, 2, 9, 5, 3, 8, 6, 4, 7] },
  { id: 14, name: 'Son Heung-min', shortName: 'Son', team: 'Tottenham', teamShort: 'TOT', position: 'MID', price: 9.8, totalPoints: 100, form: 6.0, ownership: 25.3, minutesPlayed: 1350, goals: 8, assists: 6, cleanSheets: 2, yellowCards: 1, redCards: 0, saves: 0, bonus: 11, pointsPerGame: 5.6, ictIndex: 267, news: '', chanceOfPlaying: 100, last5: [7, 4, 8, 5, 6], last10: [7, 4, 8, 5, 6, 9, 2, 7, 3, 8] },
  { id: 15, name: 'Pedro Porro', shortName: 'Porro', team: 'Tottenham', teamShort: 'TOT', position: 'DEF', price: 5.8, totalPoints: 85, form: 5.0, ownership: 15.2, minutesPlayed: 1350, goals: 2, assists: 6, cleanSheets: 5, yellowCards: 4, redCards: 0, saves: 0, bonus: 7, pointsPerGame: 4.7, ictIndex: 156, news: '', chanceOfPlaying: 100, last5: [5, 3, 7, 4, 6], last10: [5, 3, 7, 4, 6, 2, 8, 5, 3, 7] },
  { id: 16, name: 'Josko Gvardiol', shortName: 'Gvardiol', team: 'Manchester City', teamShort: 'MCI', position: 'DEF', price: 5.5, totalPoints: 78, form: 4.6, ownership: 12.1, minutesPlayed: 1350, goals: 3, assists: 2, cleanSheets: 6, yellowCards: 2, redCards: 0, saves: 0, bonus: 6, pointsPerGame: 4.3, ictIndex: 132, news: '', chanceOfPlaying: 100, last5: [4, 6, 2, 7, 4], last10: [4, 6, 2, 7, 4, 5, 3, 8, 1, 5] },
  { id: 17, name: 'Nicolas Jackson', shortName: 'Jackson', team: 'Chelsea', teamShort: 'CHE', position: 'FWD', price: 7.8, totalPoints: 82, form: 5.2, ownership: 14.5, minutesPlayed: 1260, goals: 8, assists: 4, cleanSheets: 0, yellowCards: 3, redCards: 0, saves: 0, bonus: 7, pointsPerGame: 4.6, ictIndex: 198, news: '', chanceOfPlaying: 100, last5: [6, 2, 8, 5, 5], last10: [6, 2, 8, 5, 5, 7, 3, 4, 9, 2] },
  { id: 18, name: 'James Maddison', shortName: 'Maddison', team: 'Tottenham', teamShort: 'TOT', position: 'MID', price: 7.5, totalPoints: 80, form: 4.8, ownership: 11.3, minutesPlayed: 1260, goals: 5, assists: 7, cleanSheets: 2, yellowCards: 2, redCards: 0, saves: 0, bonus: 6, pointsPerGame: 4.4, ictIndex: 212, news: '', chanceOfPlaying: 100, last5: [4, 6, 3, 8, 3], last10: [4, 6, 3, 8, 3, 5, 7, 2, 6, 4] },
  { id: 19, name: 'Robert Sanchez', shortName: 'Sanchez', team: 'Chelsea', teamShort: 'CHE', position: 'GK', price: 4.8, totalPoints: 72, form: 4.2, ownership: 8.5, minutesPlayed: 1350, goals: 0, assists: 0, cleanSheets: 6, yellowCards: 0, redCards: 0, saves: 38, bonus: 5, pointsPerGame: 4.0, ictIndex: 35, news: '', chanceOfPlaying: 100, last5: [5, 2, 6, 4, 4], last10: [5, 2, 6, 4, 4, 3, 7, 2, 5, 3] },
  { id: 20, name: 'Bryan Mbeumo', shortName: 'Mbeumo', team: 'Brentford', teamShort: 'BRE', position: 'MID', price: 7.8, totalPoints: 105, form: 6.6, ownership: 21.8, minutesPlayed: 1350, goals: 9, assists: 5, cleanSheets: 1, yellowCards: 1, redCards: 0, saves: 0, bonus: 13, pointsPerGame: 5.8, ictIndex: 256, news: '', chanceOfPlaying: 100, last5: [8, 5, 7, 6, 7], last10: [8, 5, 7, 6, 7, 4, 9, 3, 6, 5] },
];

/* ═══════════════════════════════════════════════════════════
   Mock F1 Fantasy Drivers
   ═══════════════════════════════════════════════════════════ */
const MOCK_F1_DRIVERS: F1FantasyDriver[] = [
  { id: 'max_verstappen', name: 'Max Verstappen', code: 'VER', team: 'Red Bull Racing', teamColor: '#3671C6', price: 30.5, totalPoints: 285, ownership: 78.2, last5: [45, 38, 42, 25, 40], last10: [45, 38, 42, 25, 40, 35, 48, 30, 42, 38], avgQualifying: 2.1, avgRacePosition: 1.8, dnfs: 0, fastestLaps: 3, positionsGainedAvg: 0.5 },
  { id: 'lando_norris', name: 'Lando Norris', code: 'NOR', team: 'McLaren', teamColor: '#FF8000', price: 25.2, totalPoints: 248, ownership: 62.5, last5: [38, 42, 30, 35, 40], last10: [38, 42, 30, 35, 40, 28, 45, 32, 35, 38], avgQualifying: 2.8, avgRacePosition: 2.5, dnfs: 1, fastestLaps: 2, positionsGainedAvg: 0.8 },
  { id: 'charles_leclerc', name: 'Charles Leclerc', code: 'LEC', team: 'Ferrari', teamColor: '#E8002D', price: 23.8, totalPoints: 225, ownership: 55.3, last5: [35, 28, 40, 32, 30], last10: [35, 28, 40, 32, 30, 38, 25, 35, 28, 40], avgQualifying: 3.2, avgRacePosition: 3.0, dnfs: 1, fastestLaps: 1, positionsGainedAvg: 0.3 },
  { id: 'lewis_hamilton', name: 'Lewis Hamilton', code: 'HAM', team: 'Ferrari', teamColor: '#E8002D', price: 22.0, totalPoints: 198, ownership: 45.8, last5: [30, 25, 35, 28, 32], last10: [30, 25, 35, 28, 32, 22, 38, 25, 30, 28], avgQualifying: 4.0, avgRacePosition: 3.8, dnfs: 0, fastestLaps: 1, positionsGainedAvg: 0.6 },
  { id: 'oscar_piastri', name: 'Oscar Piastri', code: 'PIA', team: 'McLaren', teamColor: '#FF8000', price: 21.5, totalPoints: 210, ownership: 42.1, last5: [32, 35, 28, 30, 35], last10: [32, 35, 28, 30, 35, 25, 38, 28, 32, 30], avgQualifying: 3.5, avgRacePosition: 3.2, dnfs: 0, fastestLaps: 1, positionsGainedAvg: 0.5 },
  { id: 'george_russell', name: 'George Russell', code: 'RUS', team: 'Mercedes', teamColor: '#27F4D2', price: 19.0, totalPoints: 175, ownership: 35.2, last5: [28, 22, 30, 25, 28], last10: [28, 22, 30, 25, 28, 20, 32, 22, 28, 25], avgQualifying: 4.5, avgRacePosition: 4.2, dnfs: 1, fastestLaps: 0, positionsGainedAvg: 0.4 },
  { id: 'carlos_sainz', name: 'Carlos Sainz', code: 'SAI', team: 'Williams', teamColor: '#1868DB', price: 15.5, totalPoints: 145, ownership: 22.8, last5: [22, 18, 25, 20, 22], last10: [22, 18, 25, 20, 22, 15, 28, 18, 22, 20], avgQualifying: 5.8, avgRacePosition: 5.5, dnfs: 1, fastestLaps: 0, positionsGainedAvg: 0.8 },
  { id: 'fernando_alonso', name: 'Fernando Alonso', code: 'ALO', team: 'Aston Martin', teamColor: '#229971', price: 14.0, totalPoints: 120, ownership: 18.5, last5: [18, 15, 20, 12, 18], last10: [18, 15, 20, 12, 18, 10, 22, 15, 18, 12], avgQualifying: 6.5, avgRacePosition: 6.2, dnfs: 0, fastestLaps: 0, positionsGainedAvg: 0.5 },
];

@Injectable({ providedIn: 'root' })
export class FantasyProjectionService {

  /* ── FPL Players ── */

  getPlayers(): Observable<FantasyPlayer[]> {
    return of(MOCK_FPL_PLAYERS);
  }

  getPlayersByPosition(position: FplPosition): Observable<FantasyPlayer[]> {
    return of(MOCK_FPL_PLAYERS.filter(p => p.position === position));
  }

  /* ── FPL Projections ── */

  getProjections(): Observable<FantasyProjection[]> {
    return of(MOCK_FPL_PLAYERS.map(p => this.projectPlayer(p)));
  }

  getProjection(playerId: number): Observable<FantasyProjection | undefined> {
    const player = MOCK_FPL_PLAYERS.find(p => p.id === playerId);
    return of(player ? this.projectPlayer(player) : undefined);
  }

  private projectPlayer(p: FantasyPlayer): FantasyProjection {
    const fdr = 2 + Math.random() * 2; // 2-4 range
    const formScore = p.form;
    const homeAdv = Math.random() > 0.5 ? 1.1 : 0.95;
    const histBonus = Math.random() * 1.5;

    const gamesPlayed = p.minutesPlayed / 90;
    const goalsPerGame = p.goals / Math.max(gamesPlayed, 1);
    const assistsPerGame = p.assists / Math.max(gamesPlayed, 1);

    const fdrMultiplier = 1 + (3 - fdr) * 0.1;

    const projGoals = goalsPerGame * fdrMultiplier * homeAdv;
    const projAssists = assistsPerGame * fdrMultiplier * homeAdv;
    const projCS = p.position === 'FWD' ? 0 : (p.cleanSheets / Math.max(gamesPlayed, 1)) * fdrMultiplier;

    const breakdown: PointsBreakdown = {
      minutes: 2,
      goals: Math.round(projGoals * GOAL_POINTS[p.position] * 10) / 10,
      assists: Math.round(projAssists * 3 * 10) / 10,
      cleanSheet: Math.round(projCS * CS_POINTS[p.position] * 10) / 10,
      saves: p.position === 'GK' ? Math.round((p.saves / Math.max(gamesPlayed, 1)) / 3 * 10) / 10 : 0,
      bonus: Math.round((p.bonus / Math.max(gamesPlayed, 1)) * 10) / 10,
      yellowCards: Math.round(-(p.yellowCards / Math.max(gamesPlayed, 1)) * 10) / 10,
      redCards: 0,
      goalsConceded: (p.position === 'DEF' || p.position === 'GK') ? -0.3 : 0,
      penaltiesMissed: 0,
      ownGoals: 0,
      total: 0,
    };
    breakdown.total = Math.round((breakdown.minutes + breakdown.goals + breakdown.assists + breakdown.cleanSheet + breakdown.saves + breakdown.bonus + breakdown.yellowCards + breakdown.goalsConceded) * 10) / 10;

    return {
      playerId: p.id,
      playerName: p.name,
      team: p.team,
      position: p.position,
      projectedPoints: breakdown.total,
      confidence: Math.round(60 + formScore * 3 + (5 - fdr) * 4),
      breakdown,
      factors: { formScore, fixtureDifficulty: Math.round(fdr * 10) / 10, homeAdvantage: homeAdv, historicalVsOpponent: Math.round(histBonus * 10) / 10 },
    };
  }

  /* ── Captain Picks ── */

  getCaptainPicks(): Observable<CaptainPick[]> {
    const projections = MOCK_FPL_PLAYERS.map(p => ({ player: p, proj: this.projectPlayer(p) }));
    const picks: CaptainPick[] = projections
      .sort((a, b) => b.proj.projectedPoints - a.proj.projectedPoints)
      .slice(0, 10)
      .map(({ player, proj }) => ({
        player,
        projectedPoints: proj.projectedPoints,
        captainPoints: Math.round(proj.projectedPoints * 2 * 10) / 10,
        fixtureDifficulty: proj.factors.fixtureDifficulty,
        confidence: proj.confidence,
        reason: proj.projectedPoints > 7 ? 'Elite form + easy fixture' : proj.projectedPoints > 5 ? 'Strong form, favorable matchup' : 'Consistent returns expected',
      }));
    return of(picks);
  }

  /* ── Differentials ── */

  getDifferentials(): Observable<Differential[]> {
    return of(
      MOCK_FPL_PLAYERS
        .filter(p => p.ownership < 25)
        .map(p => {
          const proj = this.projectPlayer(p);
          return {
            player: p,
            projectedPoints: proj.projectedPoints,
            valueScore: Math.round((proj.projectedPoints / p.price) * 100) / 100,
            ownershipDelta: Math.round((Math.random() * 4 - 2) * 10) / 10,
            trend: (Math.random() > 0.6 ? 'rising' : Math.random() > 0.3 ? 'stable' : 'falling') as 'rising' | 'falling' | 'stable',
          };
        })
        .sort((a, b) => b.valueScore - a.valueScore)
    );
  }

  /* ── Dream Team ── */

  getDreamTeam(): Observable<DreamTeam> {
    const sorted = [...MOCK_FPL_PLAYERS].sort((a, b) => this.projectPlayer(b).projectedPoints - this.projectPlayer(a).projectedPoints);
    const gks = sorted.filter(p => p.position === 'GK');
    const defs = sorted.filter(p => p.position === 'DEF');
    const mids = sorted.filter(p => p.position === 'MID');
    const fwds = sorted.filter(p => p.position === 'FWD');

    const picks: FantasyPlayer[] = [gks[0], ...defs.slice(0, 3), ...mids.slice(0, 4), ...fwds.slice(0, 3)];
    const bench: FantasyPlayer[] = [gks[1] ?? gks[0], defs[3] ?? defs[0], mids[4] ?? mids[0], fwds[3] ?? fwds[0]];

    const makePick = (p: FantasyPlayer, i: number, isCap: boolean, isVice: boolean): DreamTeamPick => ({
      player: p,
      projectedPoints: this.projectPlayer(p).projectedPoints,
      isCaptain: isCap,
      isViceCaptain: isVice,
      position: i,
    });

    const starters = picks.map((p, i) => makePick(p, i, i === (picks.indexOf(sorted[0]) >= 0 ? picks.indexOf(sorted[0]) : 0), i === 1));
    const benchPicks = bench.map((p, i) => makePick(p, 11 + i, false, false));

    const totalProjected = starters.reduce((s, p) => s + p.projectedPoints * (p.isCaptain ? 2 : 1), 0);

    return of({
      formation: '3-4-3',
      starters,
      bench: benchPicks,
      captainId: starters.find(s => s.isCaptain)?.player.id ?? 1,
      viceCaptainId: starters[1]?.player.id ?? 2,
      totalProjected: Math.round(totalProjected * 10) / 10,
      totalCost: [...picks, ...bench].reduce((s, p) => s + p.price, 0),
      budget: 100,
    });
  }

  /* ── Gameweek Summary ── */

  getGameweekSummary(): Observable<GameweekSummary> {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setDate(deadline.getDate() + 2);
    deadline.setHours(11, 30, 0, 0);

    return of({
      gameweek: 22,
      deadline: deadline.toISOString(),
      topPicks: [
        { name: 'Mohamed Salah', team: 'LIV', projected: 9.2 },
        { name: 'Erling Haaland', team: 'MCI', projected: 8.5 },
        { name: 'Cole Palmer', team: 'CHE', projected: 7.8 },
        { name: 'Bukayo Saka', team: 'ARS', projected: 7.2 },
        { name: 'Alexander Isak', team: 'NEW', projected: 6.8 },
      ],
      risers: [
        { name: 'Bryan Mbeumo', team: 'BRE', change: 0.2 },
        { name: 'Alexander Isak', team: 'NEW', change: 0.1 },
        { name: 'Cole Palmer', team: 'CHE', change: 0.1 },
      ],
      fallers: [
        { name: 'Phil Foden', team: 'MCI', change: -0.2 },
        { name: 'Bruno Fernandes', team: 'MUN', change: -0.1 },
      ],
      injuries: [
        { name: 'Phil Foden', team: 'MCI', status: 'Minor knock', chance: 75 },
        { name: 'Diogo Jota', team: 'LIV', status: 'Hamstring', chance: 25 },
        { name: 'Sandro Tonali', team: 'NEW', status: 'Match fit', chance: 100 },
      ],
      keyFixtures: [
        { home: 'Liverpool', away: 'Bournemouth', fdr: 2 },
        { home: 'Arsenal', away: 'Wolves', fdr: 2 },
        { home: 'Man City', away: 'Brentford', fdr: 2 },
        { home: 'Chelsea', away: 'Fulham', fdr: 3 },
        { home: 'Newcastle', away: 'Everton', fdr: 2 },
      ],
    });
  }

  /* ── Simulation ── */

  simulateScenario(playerId: number, events: SimulationEvent[]): Observable<SimulationScenario> {
    const player = MOCK_FPL_PLAYERS.find(p => p.id === playerId) ?? MOCK_FPL_PLAYERS[0];
    const baseProj = this.projectPlayer(player);
    let simPts = 2; // base minutes

    for (const evt of events) {
      switch (evt.type) {
        case 'goal': simPts += evt.count * GOAL_POINTS[player.position]; break;
        case 'assist': simPts += evt.count * 3; break;
        case 'cleanSheet': simPts += evt.count * CS_POINTS[player.position]; break;
        case 'yellowCard': simPts -= evt.count; break;
        case 'redCard': simPts -= evt.count * 3; break;
        case 'bonus': simPts += evt.count; break;
        case 'penaltyMissed': simPts -= evt.count * 2; break;
        case 'ownGoal': simPts -= evt.count * 2; break;
        case 'saves': simPts += Math.floor(evt.count / 3); break;
      }
    }

    return of({
      playerId: player.id,
      playerName: player.name,
      events,
      basePoints: baseProj.projectedPoints,
      simulatedPoints: simPts,
      delta: Math.round((simPts - baseProj.projectedPoints) * 10) / 10,
    });
  }

  /* ── F1 Fantasy ── */

  getF1Drivers(): Observable<F1FantasyDriver[]> {
    return of(MOCK_F1_DRIVERS);
  }

  getF1Projections(): Observable<F1FantasyProjection[]> {
    return of(MOCK_F1_DRIVERS.map(d => this.projectF1Driver(d)));
  }

  private projectF1Driver(d: F1FantasyDriver): F1FantasyProjection {
    const racePoints = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
    const projPos = Math.round(d.avgRacePosition);
    const racePos = racePoints[Math.min(projPos - 1, 9)] ?? 0;

    const qualiBonus = d.avgQualifying <= 3 ? 3 : d.avgQualifying <= 5 ? 1 : 0;
    const flap = d.fastestLaps > 1 ? 0.5 : 0;
    const posGained = Math.round(d.positionsGainedAvg * 2 * 10) / 10;
    const beatTm = 5 * 0.6; // 60% chance of beating teammate
    const dnf = d.dnfs > 0 ? -15 * (d.dnfs / 10) : 0;

    const breakdown: F1PointsBreakdown = {
      racePosition: racePos,
      qualifyingBonus: qualiBonus,
      fastestLap: flap,
      positionsGained: posGained,
      beatTeammate: Math.round(beatTm * 10) / 10,
      dnfPenalty: Math.round(dnf * 10) / 10,
      sprint: 0,
      total: 0,
    };
    breakdown.total = Math.round((racePos + qualiBonus + flap + posGained + beatTm + dnf) * 10) / 10;

    return {
      driverId: d.id,
      driverName: d.name,
      team: d.team,
      projectedPoints: breakdown.total,
      confidence: Math.round(55 + (10 - d.avgRacePosition) * 5),
      breakdown,
    };
  }

  getF1DreamTeam(): Observable<F1FantasyTeam> {
    const sorted = [...MOCK_F1_DRIVERS].sort((a, b) => this.projectF1Driver(b).projectedPoints - this.projectF1Driver(a).projectedPoints);
    return of({
      drivers: sorted.slice(0, 5),
      constructors: [
        { id: 'mclaren', name: 'McLaren', price: 25.0, points: 180 },
        { id: 'red_bull', name: 'Red Bull Racing', price: 28.0, points: 165 },
      ],
      totalProjected: sorted.slice(0, 5).reduce((s, d) => s + this.projectF1Driver(d).projectedPoints, 0),
      totalCost: sorted.slice(0, 5).reduce((s, d) => s + d.price, 0) + 53,
      budget: 100,
    });
  }

  /* ── Comparison ── */

  comparePlayers(id1: number, id2: number): Observable<PlayerComparison> {
    const p1 = MOCK_FPL_PLAYERS.find(p => p.id === id1) ?? MOCK_FPL_PLAYERS[0];
    const p2 = MOCK_FPL_PLAYERS.find(p => p.id === id2) ?? MOCK_FPL_PLAYERS[1];

    const metrics: ComparisonMetric[] = [
      { label: 'Total Points', value1: p1.totalPoints, value2: p2.totalPoints, maxValue: 200 },
      { label: 'Form', value1: p1.form, value2: p2.form, maxValue: 12 },
      { label: 'Goals', value1: p1.goals, value2: p2.goals, maxValue: 20 },
      { label: 'Assists', value1: p1.assists, value2: p2.assists, maxValue: 15 },
      { label: 'Points/Game', value1: p1.pointsPerGame, value2: p2.pointsPerGame, maxValue: 12 },
      { label: 'ICT Index', value1: p1.ictIndex, value2: p2.ictIndex, maxValue: 400 },
      { label: 'Ownership', value1: p1.ownership, value2: p2.ownership, maxValue: 100, unit: '%' },
      { label: 'Price', value1: p1.price, value2: p2.price, maxValue: 15, unit: '£m' },
    ];

    return of({ player1: p1, player2: p2, metrics });
  }

  compareF1Drivers(id1: string, id2: string): Observable<PlayerComparison> {
    const d1 = MOCK_F1_DRIVERS.find(d => d.id === id1) ?? MOCK_F1_DRIVERS[0];
    const d2 = MOCK_F1_DRIVERS.find(d => d.id === id2) ?? MOCK_F1_DRIVERS[1];

    const metrics: ComparisonMetric[] = [
      { label: 'Total Points', value1: d1.totalPoints, value2: d2.totalPoints, maxValue: 350 },
      { label: 'Avg Race Pos', value1: 10 - d1.avgRacePosition, value2: 10 - d2.avgRacePosition, maxValue: 10 },
      { label: 'Avg Quali Pos', value1: 10 - d1.avgQualifying, value2: 10 - d2.avgQualifying, maxValue: 10 },
      { label: 'Fastest Laps', value1: d1.fastestLaps, value2: d2.fastestLaps, maxValue: 5 },
      { label: 'Pos Gained/Race', value1: d1.positionsGainedAvg, value2: d2.positionsGainedAvg, maxValue: 5 },
      { label: 'Ownership', value1: d1.ownership, value2: d2.ownership, maxValue: 100, unit: '%' },
      { label: 'Price', value1: d1.price, value2: d2.price, maxValue: 35, unit: '£m' },
    ];

    return of({ player1: d1, player2: d2, metrics });
  }
}
