import { TIER_CONFIGS, FEATURE_IDS } from './tiers.config';

describe('Tier Configurations', () => {
  describe('Free tier', () => {
    const free = TIER_CONFIGS['free'];

    it('should have correct limits (3 comparisons, 2 simulations, 5 watchlist)', () => {
      expect(free.limits.comparisonsPerDay).toBe(3);
      expect(free.limits.simulationsPerDay).toBe(2);
      expect(free.limits.watchlistSize).toBe(5);
    });

    it('should have required feature access entries', () => {
      const featureIds = free.features.map((f) => f.featureId);
      expect(featureIds).toContain(FEATURE_IDS.COMPARE);
      expect(featureIds).toContain(FEATURE_IDS.SIMULATOR);
      expect(featureIds).toContain(FEATURE_IDS.WATCHLIST);
      expect(featureIds).toContain(FEATURE_IDS.PROJECTIONS);
    });
  });

  describe('Pro tier', () => {
    const pro = TIER_CONFIGS['pro'];

    it('should have correct limits', () => {
      expect(pro.limits.comparisonsPerDay).toBe(-1); // unlimited
      expect(pro.limits.simulationsPerDay).toBe(-1);
      expect(pro.limits.watchlistSize).toBe(50);
    });

    it('should have required feature access entries', () => {
      const fullFeatures = pro.features.filter((f) => f.access === 'full');
      expect(fullFeatures.length).toBeGreaterThan(20);
    });
  });

  describe('Elite tier', () => {
    const elite = TIER_CONFIGS['elite'];

    it('should have correct limits', () => {
      expect(elite.limits.comparisonsPerDay).toBe(-1);
      expect(elite.limits.simulationsPerDay).toBe(-1);
      expect(elite.limits.watchlistSize).toBe(-1); // unlimited
    });

    it('should have all features with full access', () => {
      const allFull = elite.features.every((f) => f.access === 'full');
      expect(allFull).toBe(true);
    });
  });

  it('should have required feature access entries in all tiers', () => {
    for (const tier of ['free', 'pro', 'elite'] as const) {
      const config = TIER_CONFIGS[tier];
      expect(config.features.length).toBeGreaterThan(0);
      expect(config.id).toBe(tier);
    }
  });
});
