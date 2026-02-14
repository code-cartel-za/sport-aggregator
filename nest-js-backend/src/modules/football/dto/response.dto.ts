import { ApiProperty } from '@nestjs/swagger';

export class CoachContractResponseDto {
  @ApiProperty({ example: '2023-07-01' }) start!: string;
  @ApiProperty({ example: '2026-06-30' }) until!: string;
}

export class CoachResponseDto {
  @ApiProperty({ example: 1 }) id!: number;
  @ApiProperty({ example: 'Mikel' }) firstName!: string;
  @ApiProperty({ example: 'Arteta' }) lastName!: string;
  @ApiProperty({ example: 'Mikel Arteta' }) name!: string;
  @ApiProperty({ example: '1982-03-26' }) dateOfBirth!: string;
  @ApiProperty({ example: 'Spain' }) nationality!: string;
  @ApiProperty({ type: CoachContractResponseDto, nullable: true }) contract!: CoachContractResponseDto | null;
}

export class TeamResponseDto {
  @ApiProperty({ example: 57 }) id!: number;
  @ApiProperty({ example: 'Arsenal FC' }) name!: string;
  @ApiProperty({ example: 'Arsenal' }) shortName!: string;
  @ApiProperty({ example: 'ARS' }) tla!: string;
  @ApiProperty({ example: 'https://crests.football-data.org/57.png' }) crest!: string;
  @ApiProperty({ example: '75 Drayton Park London N5 1BU' }) address!: string;
  @ApiProperty({ example: 'http://www.arsenal.com' }) website!: string;
  @ApiProperty({ example: 1886 }) founded!: number;
  @ApiProperty({ example: 'Red / White' }) clubColors!: string;
  @ApiProperty({ example: 'Emirates Stadium' }) venue!: string;
  @ApiProperty({ example: 'PL' }) competitionCode!: string;
  @ApiProperty({ type: CoachResponseDto, nullable: true }) coach!: CoachResponseDto | null;
  @ApiProperty({ example: 25 }) squadCount!: number;
}

export class PlayerResponseDto {
  @ApiProperty({ example: 101 }) id!: number;
  @ApiProperty({ example: 'Bukayo Saka' }) name!: string;
  @ApiProperty({ example: 'Bukayo', nullable: true }) firstName!: string | null;
  @ApiProperty({ example: 'Saka', nullable: true }) lastName!: string | null;
  @ApiProperty({ example: '2001-09-05' }) dateOfBirth!: string;
  @ApiProperty({ example: 'England' }) nationality!: string;
  @ApiProperty({ example: 'Midfielder' }) position!: string;
  @ApiProperty({ example: 7, nullable: true }) shirtNumber!: number | null;
  @ApiProperty({ example: 57 }) teamId!: number;
  @ApiProperty({ example: 'Arsenal FC' }) teamName!: string;
  @ApiProperty({ example: 'ARS' }) teamTla!: string;
  @ApiProperty({ example: 'PL' }) competitionCode!: string;
}

export class FixtureTeamResponseDto {
  @ApiProperty({ example: 57 }) id!: number;
  @ApiProperty({ example: 'Arsenal FC' }) name!: string;
  @ApiProperty({ example: 'Arsenal' }) shortName!: string;
  @ApiProperty({ example: 'ARS' }) tla!: string;
  @ApiProperty({ example: 'https://crests.football-data.org/57.png' }) crest!: string;
}

export class ScoreDetailDto {
  @ApiProperty({ example: 2, nullable: true }) home!: number | null;
  @ApiProperty({ example: 1, nullable: true }) away!: number | null;
}

export class FixtureScoreResponseDto {
  @ApiProperty({ example: 'HOME_TEAM', nullable: true }) winner!: string | null;
  @ApiProperty({ type: ScoreDetailDto }) fullTime!: ScoreDetailDto;
  @ApiProperty({ type: ScoreDetailDto }) halfTime!: ScoreDetailDto;
}

export class FixtureCompetitionDto {
  @ApiProperty({ example: 2021 }) id!: number;
  @ApiProperty({ example: 'Premier League' }) name!: string;
}

export class FixtureSeasonDto {
  @ApiProperty({ example: 1564 }) id!: number;
  @ApiProperty({ example: '2025-08-16' }) startDate!: string;
  @ApiProperty({ example: '2026-05-25' }) endDate!: string;
}

export class FixtureResponseDto {
  @ApiProperty({ example: 400001 }) id!: number;
  @ApiProperty({ type: FixtureCompetitionDto }) competition!: FixtureCompetitionDto;
  @ApiProperty({ type: FixtureSeasonDto }) season!: FixtureSeasonDto;
  @ApiProperty({ example: '2026-02-15T15:00:00Z' }) utcDate!: string;
  @ApiProperty({ example: 'FINISHED', enum: ['SCHEDULED', 'LIVE', 'IN_PLAY', 'PAUSED', 'FINISHED', 'POSTPONED', 'CANCELLED'] }) status!: string;
  @ApiProperty({ example: 25 }) matchday!: number;
  @ApiProperty({ type: FixtureTeamResponseDto }) homeTeam!: FixtureTeamResponseDto;
  @ApiProperty({ type: FixtureTeamResponseDto }) awayTeam!: FixtureTeamResponseDto;
  @ApiProperty({ type: FixtureScoreResponseDto }) score!: FixtureScoreResponseDto;
}

export class StandingTeamDto {
  @ApiProperty({ example: 57 }) id!: number;
  @ApiProperty({ example: 'Arsenal FC' }) name!: string;
  @ApiProperty({ example: 'Arsenal' }) shortName!: string;
  @ApiProperty({ example: 'ARS' }) tla!: string;
  @ApiProperty({ example: 'https://crests.football-data.org/57.png' }) crest!: string;
}

export class StandingRowResponseDto {
  @ApiProperty({ example: 1 }) position!: number;
  @ApiProperty({ type: StandingTeamDto }) team!: StandingTeamDto;
  @ApiProperty({ example: 25 }) playedGames!: number;
  @ApiProperty({ example: 'W,W,W,D,W', nullable: true }) form!: string | null;
  @ApiProperty({ example: 19 }) won!: number;
  @ApiProperty({ example: 4 }) draw!: number;
  @ApiProperty({ example: 2 }) lost!: number;
  @ApiProperty({ example: 61 }) points!: number;
  @ApiProperty({ example: 55 }) goalsFor!: number;
  @ApiProperty({ example: 18 }) goalsAgainst!: number;
  @ApiProperty({ example: 37 }) goalDifference!: number;
}

export class StandingGroupResponseDto {
  @ApiProperty({ example: 'REGULAR_SEASON' }) stage!: string;
  @ApiProperty({ example: 'TOTAL' }) type!: string;
  @ApiProperty({ example: null, nullable: true }) group!: string | null;
  @ApiProperty({ type: [StandingRowResponseDto] }) table!: StandingRowResponseDto[];
}

export class StandingResponseDto {
  @ApiProperty({ example: 2021 }) competitionId!: number;
  @ApiProperty({ example: 'Premier League' }) competitionName!: string;
  @ApiProperty({ type: FixtureSeasonDto }) season!: FixtureSeasonDto;
  @ApiProperty({ type: [StandingGroupResponseDto] }) standings!: StandingGroupResponseDto[];
}
