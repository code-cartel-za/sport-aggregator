export interface Subscription {
  id: string;
  sportId: string;
  type: 'league' | 'team' | 'driver' | 'constructor';
  entityId: string | number;
  entityName: string;
  entityLogo?: string;
}

export interface UserPreferences {
  darkMode: boolean;
  defaultSport: 'football' | 'f1';
  notificationsEnabled: boolean;
  favouriteLeagues: number[];
  favouriteTeams: number[];
  favouriteDrivers: string[];
}
