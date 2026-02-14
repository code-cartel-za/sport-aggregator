export interface Competition {
  id: number;
  name: string;
  code: string;
  emblem: string;
  country: string;
  currentSeason: Season;
  lastUpdated?: FirebaseFirestore.Timestamp;
}

export interface Season {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number;
}
