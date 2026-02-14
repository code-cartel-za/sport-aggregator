export interface Player {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber: number | null;
  teamId: number;
  teamName: string;
  teamTla: string;
  competitionCode: string;
  lastUpdated?: FirebaseFirestore.Timestamp;
}

export interface PlayerStats {
  playerId: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}
