export interface FplElement {
  id: number;
  first_name: string;
  second_name: string;
  web_name: string;
  team: number;
  element_type: number;
  now_cost: number;
  selected_by_percent: string;
  form: string;
  points_per_game: string;
  total_points: number;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  goals_conceded: number;
  own_goals: number;
  penalties_saved: number;
  penalties_missed: number;
  yellow_cards: number;
  red_cards: number;
  saves: number;
  bonus: number;
  bps: number;
  influence: string;
  creativity: string;
  threat: string;
  ict_index: string;
  expected_goals: string;
  expected_assists: string;
  expected_goal_involvements: string;
  expected_goals_conceded: string;
  chance_of_playing_next_round: number | null;
  chance_of_playing_this_round: number | null;
  news: string;
  news_added: string | null;
  transfers_in_event: number;
  transfers_out_event: number;
  cost_change_event: number;
  cost_change_start: number;
  ep_this: string | null;
  ep_next: string | null;
  status: string;
  photo: string;
}

export interface FplTeam {
  id: number;
  name: string;
  short_name: string;
  code: number;
  strength: number;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

export interface FplGameweek {
  id: number;
  name: string;
  deadline_time: string;
  average_entry_score: number;
  finished: boolean;
  data_checked: boolean;
  highest_scoring_entry: number | null;
  highest_score: number | null;
  most_selected: number | null;
  most_transferred_in: number | null;
  most_captained: number | null;
  most_vice_captained: number | null;
  top_element: number | null;
  chip_plays: FplChip[];
}

export interface FplChip {
  chip_name: string;
  num_played: number;
}

export interface FplElementType {
  id: number;
  plural_name: string;
  plural_name_short: string;
  singular_name: string;
  singular_name_short: string;
  squad_select: number;
  squad_min_select: number;
  squad_max_select: number;
  squad_min_play: number;
  squad_max_play: number;
}

export interface FplBootstrapResponse {
  elements: FplElement[];
  teams: FplTeam[];
  events: FplGameweek[];
  element_types: FplElementType[];
}

export interface FplPriceChange {
  playerId: number;
  webName: string;
  team: number;
  oldPrice: number;
  newPrice: number;
  change: number;
}
