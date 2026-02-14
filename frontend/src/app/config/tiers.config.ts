import { TierConfig, FeatureAccess, SubscriptionTier } from '../@types';

/* ── Feature IDs ── */
export const FEATURE_IDS = {
  PROJECTIONS: 'projections',
  PROJECTIONS_BREAKDOWN: 'projections-breakdown',
  CAPTAIN: 'captain',
  CAPTAIN_FULL: 'captain-full-list',
  FDR: 'fdr',
  FORM_TRACKER: 'form-tracker',
  DREAM_TEAM: 'dream-team',
  DREAM_TEAM_SAVE: 'dream-team-save',
  LIVE: 'live',
  DIFFERENTIALS: 'differentials',
  COMPARE: 'compare',
  SIMULATOR: 'simulator',
  DIGEST: 'digest',
  DIGEST_FULL: 'digest-full',
  WATCHLIST: 'watchlist',
  PRICE_ALERTS: 'price-alerts',
  F1_STANDINGS: 'f1-standings',
  F1_RACE_DATA: 'f1-race-data',
  TRANSFER_PLANNER: 'transfer-planner',
  PRICE_PREDICTOR: 'price-predictor',
  TEMPLATE_TRACKER: 'template-tracker',
  CHIP_ADVISOR: 'chip-advisor',
  AD_FREE: 'ad-free',
  AI_INSIGHTS: 'ai-insights',
  MINI_LEAGUE_SPY: 'mini-league-spy',
  CUSTOM_SCORING: 'custom-scoring',
  HISTORICAL_DATA: 'historical-data',
  LIVE_AI_COMMENTARY: 'live-ai-commentary',
  EXPORT_API: 'export-api',
  F1_TELEMETRY: 'f1-telemetry',
  MULTI_LEAGUE: 'multi-league',
  EARLY_ACCESS: 'early-access',
} as const;

const DAY_MS = 86_400_000;

/* ── Feature access definitions per tier ── */

const FREE_FEATURES: FeatureAccess[] = [
  { featureId: FEATURE_IDS.PROJECTIONS, access: 'limited' },
  { featureId: FEATURE_IDS.PROJECTIONS_BREAKDOWN, access: 'none' },
  { featureId: FEATURE_IDS.CAPTAIN, access: 'limited', blurred: true },
  { featureId: FEATURE_IDS.CAPTAIN_FULL, access: 'none', blurred: true },
  { featureId: FEATURE_IDS.FDR, access: 'limited' },
  { featureId: FEATURE_IDS.FORM_TRACKER, access: 'limited' },
  { featureId: FEATURE_IDS.DREAM_TEAM, access: 'limited' },
  { featureId: FEATURE_IDS.DREAM_TEAM_SAVE, access: 'none' },
  { featureId: FEATURE_IDS.LIVE, access: 'limited' },
  { featureId: FEATURE_IDS.DIFFERENTIALS, access: 'limited' },
  { featureId: FEATURE_IDS.COMPARE, access: 'limited', limit: 3, periodMs: DAY_MS },
  { featureId: FEATURE_IDS.SIMULATOR, access: 'limited', limit: 2, periodMs: DAY_MS },
  { featureId: FEATURE_IDS.DIGEST, access: 'limited' },
  { featureId: FEATURE_IDS.DIGEST_FULL, access: 'none' },
  { featureId: FEATURE_IDS.WATCHLIST, access: 'limited' },
  { featureId: FEATURE_IDS.PRICE_ALERTS, access: 'none' },
  { featureId: FEATURE_IDS.F1_STANDINGS, access: 'full' },
  { featureId: FEATURE_IDS.F1_RACE_DATA, access: 'none' },
  { featureId: FEATURE_IDS.TRANSFER_PLANNER, access: 'none' },
  { featureId: FEATURE_IDS.PRICE_PREDICTOR, access: 'none' },
  { featureId: FEATURE_IDS.TEMPLATE_TRACKER, access: 'none' },
  { featureId: FEATURE_IDS.CHIP_ADVISOR, access: 'none' },
  { featureId: FEATURE_IDS.AD_FREE, access: 'none' },
  { featureId: FEATURE_IDS.AI_INSIGHTS, access: 'none' },
  { featureId: FEATURE_IDS.MINI_LEAGUE_SPY, access: 'none' },
  { featureId: FEATURE_IDS.CUSTOM_SCORING, access: 'none' },
  { featureId: FEATURE_IDS.HISTORICAL_DATA, access: 'none' },
  { featureId: FEATURE_IDS.LIVE_AI_COMMENTARY, access: 'none' },
  { featureId: FEATURE_IDS.EXPORT_API, access: 'none' },
  { featureId: FEATURE_IDS.F1_TELEMETRY, access: 'none' },
  { featureId: FEATURE_IDS.MULTI_LEAGUE, access: 'none' },
  { featureId: FEATURE_IDS.EARLY_ACCESS, access: 'none' },
];

const PRO_FEATURES: FeatureAccess[] = [
  { featureId: FEATURE_IDS.PROJECTIONS, access: 'full' },
  { featureId: FEATURE_IDS.PROJECTIONS_BREAKDOWN, access: 'full' },
  { featureId: FEATURE_IDS.CAPTAIN, access: 'full' },
  { featureId: FEATURE_IDS.CAPTAIN_FULL, access: 'full' },
  { featureId: FEATURE_IDS.FDR, access: 'full' },
  { featureId: FEATURE_IDS.FORM_TRACKER, access: 'full' },
  { featureId: FEATURE_IDS.DREAM_TEAM, access: 'full' },
  { featureId: FEATURE_IDS.DREAM_TEAM_SAVE, access: 'full' },
  { featureId: FEATURE_IDS.LIVE, access: 'full' },
  { featureId: FEATURE_IDS.DIFFERENTIALS, access: 'full' },
  { featureId: FEATURE_IDS.COMPARE, access: 'full' },
  { featureId: FEATURE_IDS.SIMULATOR, access: 'full' },
  { featureId: FEATURE_IDS.DIGEST, access: 'full' },
  { featureId: FEATURE_IDS.DIGEST_FULL, access: 'full' },
  { featureId: FEATURE_IDS.WATCHLIST, access: 'full' },
  { featureId: FEATURE_IDS.PRICE_ALERTS, access: 'full' },
  { featureId: FEATURE_IDS.F1_STANDINGS, access: 'full' },
  { featureId: FEATURE_IDS.F1_RACE_DATA, access: 'full' },
  { featureId: FEATURE_IDS.TRANSFER_PLANNER, access: 'full' },
  { featureId: FEATURE_IDS.PRICE_PREDICTOR, access: 'full' },
  { featureId: FEATURE_IDS.TEMPLATE_TRACKER, access: 'full' },
  { featureId: FEATURE_IDS.CHIP_ADVISOR, access: 'full' },
  { featureId: FEATURE_IDS.AD_FREE, access: 'full' },
  { featureId: FEATURE_IDS.AI_INSIGHTS, access: 'none' },
  { featureId: FEATURE_IDS.MINI_LEAGUE_SPY, access: 'none' },
  { featureId: FEATURE_IDS.CUSTOM_SCORING, access: 'none' },
  { featureId: FEATURE_IDS.HISTORICAL_DATA, access: 'none' },
  { featureId: FEATURE_IDS.LIVE_AI_COMMENTARY, access: 'none' },
  { featureId: FEATURE_IDS.EXPORT_API, access: 'none' },
  { featureId: FEATURE_IDS.F1_TELEMETRY, access: 'none' },
  { featureId: FEATURE_IDS.MULTI_LEAGUE, access: 'none' },
  { featureId: FEATURE_IDS.EARLY_ACCESS, access: 'none' },
];

const ELITE_FEATURES: FeatureAccess[] = [
  { featureId: FEATURE_IDS.PROJECTIONS, access: 'full' },
  { featureId: FEATURE_IDS.PROJECTIONS_BREAKDOWN, access: 'full' },
  { featureId: FEATURE_IDS.CAPTAIN, access: 'full' },
  { featureId: FEATURE_IDS.CAPTAIN_FULL, access: 'full' },
  { featureId: FEATURE_IDS.FDR, access: 'full' },
  { featureId: FEATURE_IDS.FORM_TRACKER, access: 'full' },
  { featureId: FEATURE_IDS.DREAM_TEAM, access: 'full' },
  { featureId: FEATURE_IDS.DREAM_TEAM_SAVE, access: 'full' },
  { featureId: FEATURE_IDS.LIVE, access: 'full' },
  { featureId: FEATURE_IDS.DIFFERENTIALS, access: 'full' },
  { featureId: FEATURE_IDS.COMPARE, access: 'full' },
  { featureId: FEATURE_IDS.SIMULATOR, access: 'full' },
  { featureId: FEATURE_IDS.DIGEST, access: 'full' },
  { featureId: FEATURE_IDS.DIGEST_FULL, access: 'full' },
  { featureId: FEATURE_IDS.WATCHLIST, access: 'full' },
  { featureId: FEATURE_IDS.PRICE_ALERTS, access: 'full' },
  { featureId: FEATURE_IDS.F1_STANDINGS, access: 'full' },
  { featureId: FEATURE_IDS.F1_RACE_DATA, access: 'full' },
  { featureId: FEATURE_IDS.TRANSFER_PLANNER, access: 'full' },
  { featureId: FEATURE_IDS.PRICE_PREDICTOR, access: 'full' },
  { featureId: FEATURE_IDS.TEMPLATE_TRACKER, access: 'full' },
  { featureId: FEATURE_IDS.CHIP_ADVISOR, access: 'full' },
  { featureId: FEATURE_IDS.AD_FREE, access: 'full' },
  { featureId: FEATURE_IDS.AI_INSIGHTS, access: 'full' },
  { featureId: FEATURE_IDS.MINI_LEAGUE_SPY, access: 'full' },
  { featureId: FEATURE_IDS.CUSTOM_SCORING, access: 'full' },
  { featureId: FEATURE_IDS.HISTORICAL_DATA, access: 'full' },
  { featureId: FEATURE_IDS.LIVE_AI_COMMENTARY, access: 'full' },
  { featureId: FEATURE_IDS.EXPORT_API, access: 'full' },
  { featureId: FEATURE_IDS.F1_TELEMETRY, access: 'full' },
  { featureId: FEATURE_IDS.MULTI_LEAGUE, access: 'full' },
  { featureId: FEATURE_IDS.EARLY_ACCESS, access: 'full' },
];

/* ── Tier Configurations ── */

export const TIER_CONFIGS: Record<SubscriptionTier, TierConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: { monthly: 0, yearly: 0, currency: 'GBP' },
    features: FREE_FEATURES,
    limits: {
      comparisonsPerDay: 3,
      simulationsPerDay: 2,
      watchlistSize: 5,
      savedTeams: 0,
      projectionDepth: 'top5',
      captainDepth: 'top1',
      fdrWeeks: 2,
      formWeeks: 3,
      liveDelaySec: 300,
      leaguesMax: 2,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 4.99, yearly: 39.99, currency: 'GBP' },
    features: PRO_FEATURES,
    limits: {
      comparisonsPerDay: -1,
      simulationsPerDay: -1,
      watchlistSize: 50,
      savedTeams: 10,
      projectionDepth: 'all',
      captainDepth: 'top10',
      fdrWeeks: 6,
      formWeeks: 10,
      liveDelaySec: 0,
      leaguesMax: 10,
    },
  },
  elite: {
    id: 'elite',
    name: 'Elite',
    price: { monthly: 9.99, yearly: 79.99, currency: 'GBP' },
    features: ELITE_FEATURES,
    limits: {
      comparisonsPerDay: -1,
      simulationsPerDay: -1,
      watchlistSize: -1,
      savedTeams: -1,
      projectionDepth: 'all',
      captainDepth: 'all',
      fdrWeeks: 10,
      formWeeks: 20,
      liveDelaySec: 0,
      leaguesMax: -1,
    },
  },
};

/** Ordered tiers from lowest to highest */
export const TIER_ORDER: SubscriptionTier[] = ['free', 'pro', 'elite'];

/** Get the minimum tier required for full access to a feature */
export function getMinimumTier(featureId: string): SubscriptionTier {
  for (const tier of TIER_ORDER) {
    const config = TIER_CONFIGS[tier];
    const feature = config.features.find(f => f.featureId === featureId);
    if (feature && feature.access === 'full') {
      return tier;
    }
  }
  return 'elite';
}

/** Product IDs for App Store / Play Store */
export const PRODUCT_IDS = {
  ios: {
    proMonthly: 'com.codecartel.sportagg.pro.monthly',
    proYearly: 'com.codecartel.sportagg.pro.yearly',
    eliteMonthly: 'com.codecartel.sportagg.elite.monthly',
    eliteYearly: 'com.codecartel.sportagg.elite.yearly',
  },
  android: {
    proMonthly: 'pro_monthly',
    proYearly: 'pro_yearly',
    eliteMonthly: 'elite_monthly',
    eliteYearly: 'elite_yearly',
  },
} as const;
