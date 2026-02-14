import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface F1DriverStanding {
  position: string; positionText: string; points: string; wins: string;
  Driver: { driverId: string; permanentNumber: string; code: string; url: string; givenName: string; familyName: string; dateOfBirth: string; nationality: string };
  Constructors: { constructorId: string; url: string; name: string; nationality: string }[];
}

export interface F1ConstructorStanding {
  position: string; positionText: string; points: string; wins: string;
  Constructor: { constructorId: string; url: string; name: string; nationality: string };
}

export interface F1Race {
  season: string; round: string; url: string; raceName: string;
  Circuit: { circuitId: string; url: string; circuitName: string; Location: { lat: string; long: string; locality: string; country: string } };
  date: string; time: string;
}

export interface F1Position {
  driver_number: number; position: number; date: string; session_key: number; meeting_key: number;
}

export interface F1Lap {
  driver_number: number; lap_number: number; lap_duration: number | null;
  duration_sector_1: number | null; duration_sector_2: number | null; duration_sector_3: number | null;
  i1_speed: number | null; i2_speed: number | null; st_speed: number | null;
  is_pit_out_lap: boolean; session_key: number;
}

export interface F1PitStop {
  driver_number: number; pit_duration: number | null; lap_number: number; session_key: number; date: string;
}

@Injectable()
export class F1Service {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async getStandings(type?: string): Promise<F1DriverStanding[] | F1ConstructorStanding[]> {
    const standingType = type ?? 'drivers';
    const doc = await this.db.collection('cache').doc(`f1_standings_${standingType}`).get();
    if (!doc.exists) throw new NotFoundException(`F1 ${standingType} standings not found`);
    return (doc.data()?.['standings'] as F1DriverStanding[] | F1ConstructorStanding[]) ?? [];
  }

  async getRaces(season?: string): Promise<F1Race[]> {
    const yr = season ?? new Date().getFullYear().toString();
    const doc = await this.db.collection('cache').doc(`f1_races_${yr}`).get();
    if (!doc.exists) throw new NotFoundException(`F1 races for ${yr} not found`);
    return (doc.data()?.['races'] as F1Race[]) ?? [];
  }

  async getLivePositions(sessionKey?: string): Promise<F1Position[]> {
    const key = sessionKey ?? 'latest';
    const doc = await this.db.collection('cache').doc(`f1_positions_${key}`).get();
    if (!doc.exists) throw new NotFoundException(`F1 positions for session ${key} not found`);
    return (doc.data()?.['positions'] as F1Position[]) ?? [];
  }

  async getLiveLaps(sessionKey?: string, driverNumber?: string): Promise<F1Lap[]> {
    const key = sessionKey ?? 'latest';
    const doc = await this.db.collection('cache').doc(`f1_laps_${key}`).get();
    if (!doc.exists) throw new NotFoundException(`F1 laps for session ${key} not found`);
    let laps = (doc.data()?.['laps'] as F1Lap[]) ?? [];
    if (driverNumber) {
      laps = laps.filter((l) => l.driver_number === parseInt(driverNumber, 10));
    }
    return laps;
  }

  async getPitStops(sessionKey?: string): Promise<F1PitStop[]> {
    const key = sessionKey ?? 'latest';
    const doc = await this.db.collection('cache').doc(`f1_pitstops_${key}`).get();
    if (!doc.exists) throw new NotFoundException(`F1 pit stops for session ${key} not found`);
    return (doc.data()?.['pitStops'] as F1PitStop[]) ?? [];
  }
}
