import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FplElementResponseDto {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'Bukayo' }) first_name!: string;
  @ApiProperty({ example: 'Saka' }) second_name!: string;
  @ApiProperty({ example: 'Saka' }) web_name!: string;
  @ApiProperty({ example: 1 }) team!: number;
  @ApiProperty({ example: 3 }) element_type!: number;
  @ApiProperty({ example: 100 }) now_cost!: number;
  @ApiProperty({ example: '25.5' }) selected_by_percent!: string;
  @ApiProperty({ example: '7.2' }) form!: string;
  @ApiProperty({ example: '5.8' }) points_per_game!: string;
  @ApiProperty({ example: 145 }) total_points!: number;
  @ApiProperty({ example: 2100 }) minutes!: number;
  @ApiProperty({ example: 12 }) goals_scored!: number;
  @ApiProperty({ example: 8 }) assists!: number;
  @ApiProperty({ example: 5 }) clean_sheets!: number;
  @ApiProperty({ example: 20 }) goals_conceded!: number;
  @ApiProperty({ example: 0 }) own_goals!: number;
  @ApiProperty({ example: 0 }) penalties_saved!: number;
  @ApiProperty({ example: 0 }) penalties_missed!: number;
  @ApiProperty({ example: 3 }) yellow_cards!: number;
  @ApiProperty({ example: 0 }) red_cards!: number;
  @ApiProperty({ example: 0 }) saves!: number;
  @ApiProperty({ example: 15 }) bonus!: number;
  @ApiProperty({ example: 450 }) bps!: number;
  @ApiProperty({ example: '350.2' }) influence!: string;
  @ApiProperty({ example: '280.5' }) creativity!: string;
  @ApiProperty({ example: '310.8' }) threat!: string;
  @ApiProperty({ example: '94.2' }) ict_index!: string;
  @ApiProperty({ example: '10.5' }) expected_goals!: string;
  @ApiProperty({ example: '7.2' }) expected_assists!: string;
  @ApiProperty({ example: '17.7' }) expected_goal_involvements!: string;
  @ApiProperty({ example: '15.3' }) expected_goals_conceded!: string;
  @ApiProperty({ example: 75, nullable: true }) chance_of_playing_next_round!: number | null;
  @ApiProperty({ example: 100, nullable: true }) chance_of_playing_this_round!: number | null;
  @ApiProperty({ example: '' }) news!: string;
  @ApiProperty({ example: null, nullable: true }) news_added!: string | null;
  @ApiProperty({ example: 50000 }) transfers_in_event!: number;
  @ApiProperty({ example: 10000 }) transfers_out_event!: number;
  @ApiProperty({ example: 1 }) cost_change_event!: number;
  @ApiProperty({ example: 5 }) cost_change_start!: number;
  @ApiProperty({ example: '5.5', nullable: true }) ep_this!: string | null;
  @ApiProperty({ example: '6.0', nullable: true }) ep_next!: string | null;
  @ApiProperty({ example: 'a' }) status!: string;
  @ApiProperty({ example: '12345.jpg' }) photo!: string;
}

export class FplLiveStatsResponseDto {
  @ApiProperty({ example: 90 }) minutes!: number;
  @ApiProperty({ example: 1 }) goals_scored!: number;
  @ApiProperty({ example: 0 }) assists!: number;
  @ApiProperty({ example: 1 }) clean_sheets!: number;
  @ApiProperty({ example: 0 }) goals_conceded!: number;
  @ApiProperty({ example: 0 }) own_goals!: number;
  @ApiProperty({ example: 0 }) penalties_saved!: number;
  @ApiProperty({ example: 0 }) penalties_missed!: number;
  @ApiProperty({ example: 0 }) yellow_cards!: number;
  @ApiProperty({ example: 0 }) red_cards!: number;
  @ApiProperty({ example: 0 }) saves!: number;
  @ApiProperty({ example: 3 }) bonus!: number;
  @ApiProperty({ example: 32 }) bps!: number;
  @ApiProperty({ example: '45.2' }) influence!: string;
  @ApiProperty({ example: '30.1' }) creativity!: string;
  @ApiProperty({ example: '25.0' }) threat!: string;
  @ApiProperty({ example: '10.0' }) ict_index!: string;
  @ApiProperty({ example: 10 }) total_points!: number;
  @ApiProperty({ example: true }) in_dreamteam!: boolean;
}

export class FplLiveExplainStatDto {
  @ApiProperty({ example: 'minutes' }) identifier!: string;
  @ApiProperty({ example: 2 }) points!: number;
  @ApiProperty({ example: 90 }) value!: number;
}

export class FplLiveExplainDto {
  @ApiProperty({ example: 1 }) fixture!: number;
  @ApiProperty({ type: [FplLiveExplainStatDto] }) stats!: FplLiveExplainStatDto[];
}

export class FplLiveElementResponseDto {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ type: FplLiveStatsResponseDto }) stats!: FplLiveStatsResponseDto;
  @ApiProperty({ type: [FplLiveExplainDto] }) explain!: FplLiveExplainDto[];
}

export class FplPriceChangeResponseDto {
  @ApiProperty({ example: 1 }) playerId!: number;
  @ApiProperty({ example: 'Saka' }) webName!: string;
  @ApiProperty({ example: 1 }) team!: number;
  @ApiProperty({ example: 99 }) oldPrice!: number;
  @ApiProperty({ example: 100 }) newPrice!: number;
  @ApiProperty({ example: 1 }) change!: number;
}

export class FplChipDto {
  @ApiProperty({ example: 'wildcard' }) chip_name!: string;
  @ApiProperty({ example: 150000 }) num_played!: number;
}

export class FplGameweekResponseDto {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'Gameweek 1' }) name!: string;
  @ApiProperty({ example: '2025-08-16T10:00:00Z' }) deadline_time!: string;
  @ApiProperty({ example: 55 }) average_entry_score!: number;
  @ApiProperty({ example: true }) finished!: boolean;
  @ApiProperty({ example: true }) data_checked!: boolean;
  @ApiProperty({ example: 12345, nullable: true }) highest_scoring_entry!: number | null;
  @ApiProperty({ example: 120, nullable: true }) highest_score!: number | null;
  @ApiProperty({ example: 1, nullable: true }) most_selected!: number | null;
  @ApiProperty({ example: 5, nullable: true }) most_transferred_in!: number | null;
  @ApiProperty({ example: 1, nullable: true }) most_captained!: number | null;
  @ApiProperty({ example: 2, nullable: true }) most_vice_captained!: number | null;
  @ApiProperty({ example: 1, nullable: true }) top_element!: number | null;
  @ApiProperty({ type: [FplChipDto] }) chip_plays!: FplChipDto[];
}

export class FplPlayerHistoryResponseDto {
  @ApiProperty({ example: 1 }) element!: number;
  @ApiProperty({ example: 1 }) fixture!: number;
  @ApiProperty({ example: 2 }) opponent_team!: number;
  @ApiProperty({ example: 8 }) total_points!: number;
  @ApiProperty({ example: true }) was_home!: boolean;
  @ApiProperty({ example: '2025-08-16T15:00:00Z' }) kickoff_time!: string;
  @ApiProperty({ example: 2 }) team_h_score!: number;
  @ApiProperty({ example: 1 }) team_a_score!: number;
  @ApiProperty({ example: 1 }) round!: number;
  @ApiProperty({ example: 90 }) minutes!: number;
  @ApiProperty({ example: 1 }) goals_scored!: number;
  @ApiProperty({ example: 0 }) assists!: number;
  @ApiProperty({ example: 1 }) clean_sheets!: number;
  @ApiProperty({ example: 0 }) goals_conceded!: number;
  @ApiProperty({ example: 0 }) own_goals!: number;
  @ApiProperty({ example: 0 }) penalties_saved!: number;
  @ApiProperty({ example: 0 }) penalties_missed!: number;
  @ApiProperty({ example: 0 }) yellow_cards!: number;
  @ApiProperty({ example: 0 }) red_cards!: number;
  @ApiProperty({ example: 0 }) saves!: number;
  @ApiProperty({ example: 2 }) bonus!: number;
  @ApiProperty({ example: 28 }) bps!: number;
  @ApiProperty({ example: '40.0' }) influence!: string;
  @ApiProperty({ example: '25.0' }) creativity!: string;
  @ApiProperty({ example: '30.0' }) threat!: string;
  @ApiProperty({ example: '9.5' }) ict_index!: string;
  @ApiProperty({ example: '0.8' }) expected_goals!: string;
  @ApiProperty({ example: '0.3' }) expected_assists!: string;
  @ApiProperty({ example: '1.1' }) expected_goal_involvements!: string;
  @ApiProperty({ example: '0.5' }) expected_goals_conceded!: string;
  @ApiProperty({ example: 100 }) value!: number;
  @ApiProperty({ example: 5000 }) transfers_balance!: number;
  @ApiProperty({ example: 1500000 }) selected!: number;
  @ApiProperty({ example: 10000 }) transfers_in!: number;
  @ApiProperty({ example: 5000 }) transfers_out!: number;
}

export class FplPlayerDetailResponseDto extends FplElementResponseDto {
  @ApiProperty({ type: [FplPlayerHistoryResponseDto] }) history!: FplPlayerHistoryResponseDto[];
}
