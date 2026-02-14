import { ApiProperty } from '@nestjs/swagger';

export class F1DriverResponseDto {
  @ApiProperty({ example: 'max_verstappen' }) driverId!: string;
  @ApiProperty({ example: '33' }) permanentNumber!: string;
  @ApiProperty({ example: 'VER' }) code!: string;
  @ApiProperty({ example: 'http://en.wikipedia.org/wiki/Max_Verstappen' }) url!: string;
  @ApiProperty({ example: 'Max' }) givenName!: string;
  @ApiProperty({ example: 'Verstappen' }) familyName!: string;
  @ApiProperty({ example: '1997-09-30' }) dateOfBirth!: string;
  @ApiProperty({ example: 'Dutch' }) nationality!: string;
}

export class F1ConstructorResponseDto {
  @ApiProperty({ example: 'red_bull' }) constructorId!: string;
  @ApiProperty({ example: 'http://en.wikipedia.org/wiki/Red_Bull_Racing' }) url!: string;
  @ApiProperty({ example: 'Red Bull' }) name!: string;
  @ApiProperty({ example: 'Austrian' }) nationality!: string;
}

export class F1DriverStandingResponseDto {
  @ApiProperty({ example: '1' }) position!: string;
  @ApiProperty({ example: '1' }) positionText!: string;
  @ApiProperty({ example: '400' }) points!: string;
  @ApiProperty({ example: '15' }) wins!: string;
  @ApiProperty({ type: F1DriverResponseDto }) Driver!: F1DriverResponseDto;
  @ApiProperty({ type: [F1ConstructorResponseDto] }) Constructors!: F1ConstructorResponseDto[];
}

export class F1ConstructorStandingResponseDto {
  @ApiProperty({ example: '1' }) position!: string;
  @ApiProperty({ example: '1' }) positionText!: string;
  @ApiProperty({ example: '700' }) points!: string;
  @ApiProperty({ example: '20' }) wins!: string;
  @ApiProperty({ type: F1ConstructorResponseDto }) Constructor!: F1ConstructorResponseDto;
}

export class F1CircuitLocationDto {
  @ApiProperty({ example: '51.3569' }) lat!: string;
  @ApiProperty({ example: '-1.1718' }) long!: string;
  @ApiProperty({ example: 'Silverstone' }) locality!: string;
  @ApiProperty({ example: 'UK' }) country!: string;
}

export class F1CircuitResponseDto {
  @ApiProperty({ example: 'silverstone' }) circuitId!: string;
  @ApiProperty({ example: 'http://en.wikipedia.org/wiki/Silverstone_Circuit' }) url!: string;
  @ApiProperty({ example: 'Silverstone Circuit' }) circuitName!: string;
  @ApiProperty({ type: F1CircuitLocationDto }) Location!: F1CircuitLocationDto;
}

export class F1RaceResponseDto {
  @ApiProperty({ example: '2026' }) season!: string;
  @ApiProperty({ example: '1' }) round!: string;
  @ApiProperty({ example: 'http://en.wikipedia.org/wiki/2026_British_Grand_Prix' }) url!: string;
  @ApiProperty({ example: 'British Grand Prix' }) raceName!: string;
  @ApiProperty({ type: F1CircuitResponseDto }) Circuit!: F1CircuitResponseDto;
  @ApiProperty({ example: '2026-07-05' }) date!: string;
  @ApiProperty({ example: '14:00:00Z' }) time!: string;
}

export class F1PositionResponseDto {
  @ApiProperty({ example: 1 }) driver_number!: number;
  @ApiProperty({ example: 1 }) position!: number;
  @ApiProperty({ example: '2026-03-15T14:30:00Z' }) date!: string;
  @ApiProperty({ example: 9001 }) session_key!: number;
  @ApiProperty({ example: 1200 }) meeting_key!: number;
}

export class F1LapResponseDto {
  @ApiProperty({ example: 1 }) driver_number!: number;
  @ApiProperty({ example: 15 }) lap_number!: number;
  @ApiProperty({ example: 87.5, nullable: true }) lap_duration!: number | null;
  @ApiProperty({ example: 28.1, nullable: true }) duration_sector_1!: number | null;
  @ApiProperty({ example: 30.2, nullable: true }) duration_sector_2!: number | null;
  @ApiProperty({ example: 29.2, nullable: true }) duration_sector_3!: number | null;
  @ApiProperty({ example: 305, nullable: true }) i1_speed!: number | null;
  @ApiProperty({ example: 280, nullable: true }) i2_speed!: number | null;
  @ApiProperty({ example: 320, nullable: true }) st_speed!: number | null;
  @ApiProperty({ example: false }) is_pit_out_lap!: boolean;
  @ApiProperty({ example: 9001 }) session_key!: number;
}

export class F1PitStopResponseDto {
  @ApiProperty({ example: 1 }) driver_number!: number;
  @ApiProperty({ example: 22.5, nullable: true }) pit_duration!: number | null;
  @ApiProperty({ example: 15 }) lap_number!: number;
  @ApiProperty({ example: 9001 }) session_key!: number;
  @ApiProperty({ example: '2026-03-15T14:45:00Z' }) date!: string;
}
