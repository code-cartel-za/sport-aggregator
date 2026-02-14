export interface F1Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface F1Lap {
  driver_number: number;
  lap_number: number;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  st_speed: number | null;
  is_pit_out_lap: boolean;
  session_key: number;
}

export interface F1PitStop {
  driver_number: number;
  pit_duration: number | null;
  lap_number: number;
  session_key: number;
  date: string;
}

export interface F1Interval {
  driver_number: number;
  gap_to_leader: number | null;
  interval: number | null;
  session_key: number;
  date: string;
}

export interface F1RaceControl {
  category: string;
  flag: string | null;
  message: string;
  scope: string | null;
  sector: number | null;
  date: string;
  session_key: number;
  driver_number: number | null;
}

export interface F1CarData {
  driver_number: number;
  speed: number;
  throttle: number;
  brake: number;
  n_gear: number;
  rpm: number;
  drs: number;
  date: string;
  session_key: number;
}
