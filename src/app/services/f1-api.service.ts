import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import {
  Race, DriverStanding, ConstructorStanding, RaceResult,
  Driver, Constructor, Circuit, OpenF1Session,
} from '../models';

const ERGAST = 'https://ergast.com/api/f1';
const OPENF1 = 'https://api.openf1.org/v1';

const MOCK_DRIVERS: Driver[] = [
  { driverId: 'max_verstappen', permanentNumber: '1', code: 'VER', givenName: 'Max', familyName: 'Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch', teamName: 'Red Bull Racing', teamColor: '#3671C6' },
  { driverId: 'hamilton', permanentNumber: '44', code: 'HAM', givenName: 'Lewis', familyName: 'Hamilton', dateOfBirth: '1985-01-07', nationality: 'British', teamName: 'Ferrari', teamColor: '#E8002D' },
  { driverId: 'leclerc', permanentNumber: '16', code: 'LEC', givenName: 'Charles', familyName: 'Leclerc', dateOfBirth: '1997-10-16', nationality: 'Monegasque', teamName: 'Ferrari', teamColor: '#E8002D' },
  { driverId: 'norris', permanentNumber: '4', code: 'NOR', givenName: 'Lando', familyName: 'Norris', dateOfBirth: '1999-11-13', nationality: 'British', teamName: 'McLaren', teamColor: '#FF8000' },
  { driverId: 'russell', permanentNumber: '63', code: 'RUS', givenName: 'George', familyName: 'Russell', dateOfBirth: '1998-02-15', nationality: 'British', teamName: 'Mercedes', teamColor: '#27F4D2' },
  { driverId: 'piastri', permanentNumber: '81', code: 'PIA', givenName: 'Oscar', familyName: 'Piastri', dateOfBirth: '2001-04-06', nationality: 'Australian', teamName: 'McLaren', teamColor: '#FF8000' },
];

const MOCK_CONSTRUCTORS: Constructor[] = [
  { constructorId: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', color: '#3671C6' },
  { constructorId: 'ferrari', name: 'Ferrari', nationality: 'Italian', color: '#E8002D' },
  { constructorId: 'mclaren', name: 'McLaren', nationality: 'British', color: '#FF8000' },
  { constructorId: 'mercedes', name: 'Mercedes', nationality: 'German', color: '#27F4D2' },
];

@Injectable({ providedIn: 'root' })
export class F1ApiService {
  constructor(private http: HttpClient) {}

  /** Ergast: current season race calendar */
  getRaceCalendar(season: string = 'current'): Observable<Race[]> {
    return this.http.get<any>(`${ERGAST}/${season}.json`).pipe(
      map(res => res?.['MRData']?.['RaceTable']?.['Races'] ?? []),
      catchError(() => of(this.mockRaces())),
    );
  }

  /** Ergast: driver standings */
  getDriverStandings(season: string = 'current'): Observable<DriverStanding[]> {
    return this.http.get<any>(`${ERGAST}/${season}/driverStandings.json`).pipe(
      map(res => res?.['MRData']?.['StandingsTable']?.['StandingsLists']?.[0]?.['DriverStandings'] ?? []),
      catchError(() => of(this.mockDriverStandings())),
    );
  }

  /** Ergast: constructor standings */
  getConstructorStandings(season: string = 'current'): Observable<ConstructorStanding[]> {
    return this.http.get<any>(`${ERGAST}/${season}/constructorStandings.json`).pipe(
      map(res => res?.['MRData']?.['StandingsTable']?.['StandingsLists']?.[0]?.['ConstructorStandings'] ?? []),
      catchError(() => of(this.mockConstructorStandings())),
    );
  }

  /** Ergast: race results */
  getRaceResults(season: string, round: string): Observable<RaceResult[]> {
    return this.http.get<any>(`${ERGAST}/${season}/${round}/results.json`).pipe(
      map(res => res?.['MRData']?.['RaceTable']?.['Races']?.[0]?.['Results'] ?? []),
      catchError(() => of([])),
    );
  }

  /** OpenF1: recent sessions */
  getSessions(countryName?: string): Observable<OpenF1Session[]> {
    const params = countryName ? `?country_name=${encodeURIComponent(countryName)}` : '?session_type=Race&year=2025';
    return this.http.get<OpenF1Session[]>(`${OPENF1}/sessions${params}`).pipe(
      catchError(() => of([])),
    );
  }

  /** Get mock drivers list */
  getDrivers(): Observable<Driver[]> {
    return of(MOCK_DRIVERS);
  }

  getConstructors(): Observable<Constructor[]> {
    return of(MOCK_CONSTRUCTORS);
  }

  // ── Mock fallbacks ──

  private mockRaces(): Race[] {
    return [
      { season: '2025', round: '1', raceName: 'Australian Grand Prix', circuit: { circuitId: 'albert_park', circuitName: 'Albert Park', location: { lat: '-37.8497', long: '144.968', locality: 'Melbourne', country: 'Australia' } }, date: '2025-03-16', time: '05:00:00Z' },
      { season: '2025', round: '2', raceName: 'Chinese Grand Prix', circuit: { circuitId: 'shanghai', circuitName: 'Shanghai International Circuit', location: { lat: '31.3389', long: '121.22', locality: 'Shanghai', country: 'China' } }, date: '2025-03-23', time: '07:00:00Z' },
      { season: '2025', round: '3', raceName: 'Japanese Grand Prix', circuit: { circuitId: 'suzuka', circuitName: 'Suzuka Circuit', location: { lat: '34.8431', long: '136.541', locality: 'Suzuka', country: 'Japan' } }, date: '2025-04-06', time: '05:00:00Z' },
      { season: '2025', round: '4', raceName: 'Bahrain Grand Prix', circuit: { circuitId: 'bahrain', circuitName: 'Bahrain International Circuit', location: { lat: '26.0325', long: '50.5106', locality: 'Sakhir', country: 'Bahrain' } }, date: '2025-04-13', time: '15:00:00Z' },
      { season: '2025', round: '5', raceName: 'Saudi Arabian Grand Prix', circuit: { circuitId: 'jeddah', circuitName: 'Jeddah Corniche Circuit', location: { lat: '21.6319', long: '39.1044', locality: 'Jeddah', country: 'Saudi Arabia' } }, date: '2025-04-20', time: '17:00:00Z' },
    ];
  }

  private mockDriverStandings(): DriverStanding[] {
    return MOCK_DRIVERS.map((d, i) => ({
      position: String(i + 1),
      positionText: String(i + 1),
      points: String(200 - i * 30),
      wins: String(Math.max(0, 8 - i * 2)),
      driver: d,
      constructors: [MOCK_CONSTRUCTORS[Math.floor(i / 2)] ?? MOCK_CONSTRUCTORS[0]],
    }));
  }

  private mockConstructorStandings(): ConstructorStanding[] {
    return MOCK_CONSTRUCTORS.map((c, i) => ({
      position: String(i + 1),
      positionText: String(i + 1),
      points: String(400 - i * 80),
      wins: String(Math.max(0, 10 - i * 3)),
      constructor: c,
    }));
  }
}
