import { Injectable, inject } from '@angular/core';
import { Observable, from, of, map } from 'rxjs';
import {
  Firestore, doc, getDoc,
} from '@angular/fire/firestore';
import {
  Race, DriverStanding, ConstructorStanding, RaceResult,
  Driver, Constructor, OpenF1Session,
} from '../models';

const TEAM_COLORS: Record<string, string> = {
  'Red Bull': '#3671C6', 'red_bull': '#3671C6',
  'Ferrari': '#E8002D', 'ferrari': '#E8002D',
  'McLaren': '#FF8000', 'mclaren': '#FF8000',
  'Mercedes': '#27F4D2', 'mercedes': '#27F4D2',
  'Aston Martin': '#229971', 'aston_martin': '#229971',
  'Alpine F1 Team': '#FF87BC', 'alpine': '#FF87BC',
  'Williams': '#64C4FF', 'williams': '#64C4FF',
  'RB F1 Team': '#6692FF', 'rb_f1_team': '#6692FF',
  'Kick Sauber': '#52E252', 'sauber': '#52E252',
  'Haas F1 Team': '#B6BABD', 'haas': '#B6BABD',
};

function getTeamColor(name: string): string {
  return TEAM_COLORS[name] || TEAM_COLORS[name.toLowerCase().replace(/\s+/g, '_')] || '#999999';
}

@Injectable({ providedIn: 'root' })
export class F1ApiService {
  private firestore = inject(Firestore);

  getRaceCalendar(season: string = 'current'): Observable<Race[]> {
    const year = season === 'current' ? new Date().getFullYear().toString() : season;
    return from(getDoc(doc(this.firestore, 'cache', `f1_races_${year}`))).pipe(
      map(snap => {
        const data = snap.data();
        return (data?.['races'] || []) as Race[];
      }),
    );
  }

  getDriverStandings(season: string = 'current'): Observable<DriverStanding[]> {
    return from(getDoc(doc(this.firestore, 'cache', 'f1_standings_drivers'))).pipe(
      map(snap => {
        const data = snap.data();
        const standings: any[] = data?.['standings'] || [];
        return standings.map(s => {
          // Enrich with team colors
          if (s.driver && s.constructors?.[0]) {
            s.driver.teamName = s.constructors[0].name;
            s.driver.teamColor = getTeamColor(s.constructors[0].name || s.constructors[0].constructorId);
            if (!s.constructors[0].color) {
              s.constructors[0].color = s.driver.teamColor;
            }
          }
          return s as DriverStanding;
        });
      }),
    );
  }

  getConstructorStandings(season: string = 'current'): Observable<ConstructorStanding[]> {
    return from(getDoc(doc(this.firestore, 'cache', 'f1_standings_constructors'))).pipe(
      map(snap => {
        const data = snap.data();
        const standings: any[] = data?.['standings'] || [];
        return standings.map(s => {
          if (s.constructor && !s.constructor.color) {
            s.constructor.color = getTeamColor(s.constructor.name || s.constructor.constructorId);
          }
          return s as ConstructorStanding;
        });
      }),
    );
  }

  getRaceResults(season: string, round: string): Observable<RaceResult[]> {
    // Not stored in Firestore yet
    return of([]);
  }

  getSessions(countryName?: string): Observable<OpenF1Session[]> {
    // Not stored in Firestore yet
    return of([]);
  }

  getDrivers(): Observable<Driver[]> {
    // Derive from driver standings
    return this.getDriverStandings().pipe(
      map(standings => standings.map(s => s.driver)),
    );
  }

  getConstructors(): Observable<Constructor[]> {
    return this.getConstructorStandings().pipe(
      map(standings => standings.map(s => s.constructor)),
    );
  }
}
