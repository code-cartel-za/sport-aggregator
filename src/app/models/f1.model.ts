export interface Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
  teamName?: string;
  teamColor?: string;
  headshotUrl?: string;
  driverNumber?: number;
}

export interface Constructor {
  constructorId: string;
  name: string;
  nationality: string;
  color?: string;
}

export interface Circuit {
  circuitId: string;
  circuitName: string;
  location: { lat: string; long: string; locality: string; country: string };
}

export interface Race {
  season: string;
  round: string;
  raceName: string;
  circuit: Circuit;
  date: string;
  time?: string;
  firstPractice?: { date: string; time: string };
  qualifying?: { date: string; time: string };
  sprint?: { date: string; time: string };
}

export interface RaceResult {
  position: string;
  positionText: string;
  points: string;
  driver: Driver;
  constructor: Constructor;
  grid: string;
  laps: string;
  status: string;
  time?: { millis?: string; time?: string };
  fastestLap?: { rank: string; lap: string; time: { time: string } };
}

export interface QualifyingResult {
  position: string;
  driver: Driver;
  constructor: Constructor;
  q1?: string;
  q2?: string;
  q3?: string;
}

export interface DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  driver: Driver;
  constructors: Constructor[];
}

export interface ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  constructor: Constructor;
}

export interface OpenF1Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  session_type: string;
  meeting_key: number;
  country_name: string;
  circuit_short_name: string;
}

export interface OpenF1Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
}
