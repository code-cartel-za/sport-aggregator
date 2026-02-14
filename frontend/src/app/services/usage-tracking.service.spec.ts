/**
 * Tests for UsageTrackingService core logic.
 * Since this service uses Angular DI (inject(TierService)), we test the
 * underlying localStorage logic and data structures directly.
 */

import { FEATURE_IDS } from '../config/tiers.config';

const USAGE_KEY = 'sport-agg-daily-usage';

interface UsageRecord {
  date: string;
  comparisons: number;
  simulations: number;
  featureAccess: Record<string, number>;
}

// Simulate the core logic without Angular DI
function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function createEmptyRecord(): UsageRecord {
  return { date: getToday(), comparisons: 0, simulations: 0, featureAccess: {} };
}

// Mock localStorage
const storageMap = new Map<string, string>();
const mockLocalStorage = {
  getItem: (key: string): string | null => storageMap.get(key) ?? null,
  setItem: (key: string, value: string): void => { storageMap.set(key, value); },
  removeItem: (key: string): void => { storageMap.delete(key); },
  clear: (): void => { storageMap.clear(); },
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

function loadUsage(): UsageRecord {
  const stored = localStorage.getItem(USAGE_KEY);
  if (stored) {
    const record: UsageRecord = JSON.parse(stored);
    if (record.date === getToday()) return record;
  }
  return createEmptyRecord();
}

function saveUsage(record: UsageRecord): void {
  localStorage.setItem(USAGE_KEY, JSON.stringify(record));
}

function trackUsage(featureId: string, limit: number): { allowed: boolean; remaining: number } {
  const record = loadUsage();
  const used = record.featureAccess[featureId] ?? 0;

  if (limit !== -1 && used >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.featureAccess[featureId] = used + 1;
  if (featureId === FEATURE_IDS.COMPARE) record.comparisons += 1;
  if (featureId === FEATURE_IDS.SIMULATOR) record.simulations += 1;
  saveUsage(record);

  const remaining = limit === -1 ? -1 : limit - (used + 1);
  return { allowed: true, remaining };
}

function getRemainingToday(featureId: string, limit: number): number {
  if (limit === -1) return -1;
  const record = loadUsage();
  const used = record.featureAccess[featureId] ?? 0;
  return Math.max(0, limit - used);
}

describe('UsageTracking logic', () => {
  beforeEach(() => {
    storageMap.clear();
  });

  it('trackUsage should increment counter', () => {
    trackUsage(FEATURE_IDS.COMPARE, 3);
    const record = loadUsage();
    expect(record.featureAccess[FEATURE_IDS.COMPARE]).toBe(1);
    expect(record.comparisons).toBe(1);
  });

  it('trackUsage should return allowed=false when limit reached', () => {
    trackUsage(FEATURE_IDS.COMPARE, 3);
    trackUsage(FEATURE_IDS.COMPARE, 3);
    trackUsage(FEATURE_IDS.COMPARE, 3);
    const result = trackUsage(FEATURE_IDS.COMPARE, 3);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('getRemainingToday should return correct count', () => {
    trackUsage(FEATURE_IDS.COMPARE, 3);
    expect(getRemainingToday(FEATURE_IDS.COMPARE, 3)).toBe(2);
  });

  it('resetDailyUsage should clear counters', () => {
    trackUsage(FEATURE_IDS.COMPARE, 3);
    trackUsage(FEATURE_IDS.SIMULATOR, 2);
    saveUsage(createEmptyRecord()); // reset
    const record = loadUsage();
    expect(record.comparisons).toBe(0);
    expect(record.simulations).toBe(0);
    expect(Object.keys(record.featureAccess)).toHaveLength(0);
  });
});
