export interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
  address: string;
  website: string;
  founded: number;
  clubColors: string;
  venue: string;
  competitionCode: string;
  coach: Coach | null;
  squadCount: number;
  lastUpdated?: FirebaseFirestore.Timestamp;
}

export interface Coach {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  dateOfBirth: string;
  nationality: string;
  contract: CoachContract | null;
}

export interface CoachContract {
  start: string;
  until: string;
}

export interface Squad {
  teamId: number;
  teamName: string;
  players: SquadPlayer[];
}

export interface SquadPlayer {
  id: number;
  name: string;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string;
  nationality: string;
  position: string;
  shirtNumber: number | null;
}
