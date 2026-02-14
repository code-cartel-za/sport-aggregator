import { NotFoundException } from '@nestjs/common';
import { F1Service } from './f1.service';
import { createMockFirestore } from '../../test/helpers/mock-firestore';

const driverStandings = [
  { position: '1', positionText: '1', points: '300', wins: '10', Driver: { driverId: 'verstappen', permanentNumber: '1', code: 'VER', url: '', givenName: 'Max', familyName: 'Verstappen', dateOfBirth: '1997-09-30', nationality: 'Dutch' }, Constructors: [{ constructorId: 'red_bull', url: '', name: 'Red Bull', nationality: 'Austrian' }] },
];

const constructorStandings = [
  { position: '1', positionText: '1', points: '500', wins: '15', Constructor: { constructorId: 'red_bull', url: '', name: 'Red Bull', nationality: 'Austrian' } },
];

const races = [
  { season: '2026', round: '1', url: '', raceName: 'Bahrain GP', Circuit: { circuitId: 'bahrain', url: '', circuitName: 'Bahrain', Location: { lat: '26.0', long: '50.5', locality: 'Sakhir', country: 'Bahrain' } }, date: '2026-03-01', time: '15:00:00Z' },
];

const positions = [
  { driver_number: 1, position: 1, date: '2026-03-01T15:30:00Z', session_key: 9999, meeting_key: 1234 },
  { driver_number: 44, position: 2, date: '2026-03-01T15:30:00Z', session_key: 9999, meeting_key: 1234 },
];

describe('F1Service', () => {
  it('should return driver standings', async () => {
    const db = createMockFirestore({
      cache: { f1_standings_drivers: { standings: driverStandings } as unknown as Record<string, unknown> },
    });
    const service = new F1Service(db as never);
    const result = await service.getStandings('drivers');
    expect(result).toHaveLength(1);
  });

  it('should return constructor standings', async () => {
    const db = createMockFirestore({
      cache: { f1_standings_constructors: { standings: constructorStandings } as unknown as Record<string, unknown> },
    });
    const service = new F1Service(db as never);
    const result = await service.getStandings('constructors');
    expect(result).toHaveLength(1);
  });

  it('should return race calendar', async () => {
    const db = createMockFirestore({
      cache: { f1_races_2026: { races } as unknown as Record<string, unknown> },
    });
    const service = new F1Service(db as never);
    const result = await service.getRaces('2026');
    expect(result).toHaveLength(1);
    expect(result[0].raceName).toBe('Bahrain GP');
  });

  it('should return live positions for session', async () => {
    const db = createMockFirestore({
      cache: { f1_positions_9999: { positions } as unknown as Record<string, unknown> },
    });
    const service = new F1Service(db as never);
    const result = await service.getLivePositions('9999');
    expect(result).toHaveLength(2);
  });

  it('should throw NotFoundException when standings not found', async () => {
    const db = createMockFirestore();
    const service = new F1Service(db as never);
    await expect(service.getStandings('drivers')).rejects.toThrow(NotFoundException);
  });
});
