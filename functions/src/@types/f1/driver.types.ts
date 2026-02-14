export interface F1Driver {
  driverId: string;
  permanentNumber: string;
  code: string;
  url: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
}

export interface F1DriverStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Driver: F1Driver;
  Constructors: F1Constructor[];
}

export interface F1Constructor {
  constructorId: string;
  url: string;
  name: string;
  nationality: string;
}

export interface F1ConstructorStanding {
  position: string;
  positionText: string;
  points: string;
  wins: string;
  Constructor: F1Constructor;
}
