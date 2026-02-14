import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FDRRating, FDRFixture } from '../models';

const TEAMS: { id: number; name: string; short: string }[] = [
  { id: 1, name: 'Arsenal', short: 'ARS' },
  { id: 2, name: 'Aston Villa', short: 'AVL' },
  { id: 3, name: 'Bournemouth', short: 'BOU' },
  { id: 4, name: 'Brentford', short: 'BRE' },
  { id: 5, name: 'Brighton', short: 'BHA' },
  { id: 6, name: 'Chelsea', short: 'CHE' },
  { id: 7, name: 'Crystal Palace', short: 'CRY' },
  { id: 8, name: 'Everton', short: 'EVE' },
  { id: 9, name: 'Fulham', short: 'FUL' },
  { id: 10, name: 'Liverpool', short: 'LIV' },
  { id: 11, name: 'Manchester City', short: 'MCI' },
  { id: 12, name: 'Manchester United', short: 'MUN' },
  { id: 13, name: 'Newcastle', short: 'NEW' },
  { id: 14, name: 'Nottm Forest', short: 'NFO' },
  { id: 15, name: 'Tottenham', short: 'TOT' },
  { id: 16, name: 'West Ham', short: 'WHU' },
  { id: 17, name: 'Wolves', short: 'WOL' },
  { id: 18, name: 'Ipswich', short: 'IPS' },
  { id: 19, name: 'Leicester', short: 'LEI' },
  { id: 20, name: 'Southampton', short: 'SOU' },
];

// Top 6 strength
const STRONG = [1, 6, 10, 11, 13, 15]; // ARS, CHE, LIV, MCI, NEW, TOT
const MID_TIER = [2, 4, 5, 9, 12, 14]; // AVL, BRE, BHA, FUL, MUN, NFO

function getDifficulty(opponentId: number, isHome: boolean): 1 | 2 | 3 | 4 | 5 {
  const isStrong = STRONG.includes(opponentId);
  const isMid = MID_TIER.includes(opponentId);
  if (isStrong) return isHome ? (4 as 4) : (5 as 5);
  if (isMid) return isHome ? (3 as 3) : (3 as 3);
  return isHome ? (1 as 1) : (2 as 2);
}

@Injectable({ providedIn: 'root' })
export class FDRService {

  getFDRRatings(startGW: number = 22): Observable<FDRRating[]> {
    const ratings: FDRRating[] = TEAMS.map(team => {
      const fixtures: FDRFixture[] = [];
      for (let gw = 0; gw < 6; gw++) {
        const opponents = TEAMS.filter(t => t.id !== team.id);
        const opp = opponents[(team.id + gw * 3) % opponents.length];
        const isHome = (team.id + gw) % 2 === 0;
        fixtures.push({
          opponent: opp.name,
          opponentShort: opp.short,
          isHome,
          difficulty: getDifficulty(opp.id, isHome),
          gameweek: startGW + gw,
        });
      }
      return { teamId: team.id, teamName: team.name, teamShort: team.short, fixtures };
    });
    return of(ratings);
  }

  getTeams() {
    return TEAMS;
  }
}
