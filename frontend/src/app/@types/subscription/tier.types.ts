/**
 * Subscription Tier Types
 * Defines the tier system for Sport Aggregator's freemium model.
 */

export type SubscriptionTier = 'free' | 'pro' | 'elite';

export type ProjectionDepth = 'top5' | 'all';
export type CaptainDepth = 'top1' | 'top10' | 'all';
export type FeatureAccessLevel = 'full' | 'limited' | 'preview' | 'none';

export interface FeatureAccess {
  featureId: string;
  access: FeatureAccessLevel;
  limit?: number;
  periodMs?: number;
  blurred?: boolean;
}

export interface UsageLimits {
  comparisonsPerDay: number;
  simulationsPerDay: number;
  watchlistSize: number;
  savedTeams: number;
  projectionDepth: ProjectionDepth;
  captainDepth: CaptainDepth;
  fdrWeeks: number;
  formWeeks: number;
  liveDelaySec: number;
  leaguesMax: number;
}

export interface TierPrice {
  monthly: number;
  yearly: number;
  currency: string;
}

export interface TierConfig {
  id: SubscriptionTier;
  name: string;
  price: TierPrice;
  features: FeatureAccess[];
  limits: UsageLimits;
}

export type SubscriptionStatus = 'active' | 'trial' | 'expired' | 'cancelled';
export type SubscriptionPlatform = 'ios' | 'android' | 'web' | 'none';

export interface UserSubscription {
  uid: string;
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  platform: SubscriptionPlatform;
  productId: string | null;
  expiresAt: string | null;
  trialEndsAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}
