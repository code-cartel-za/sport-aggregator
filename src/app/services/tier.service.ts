import { Injectable, inject, signal, computed, Signal } from '@angular/core';
import {
  SubscriptionTier, UserSubscription, TierConfig, FeatureAccess, UsageLimits,
} from '../@types';
import { TIER_CONFIGS, TIER_ORDER, getMinimumTier } from '../config/tiers.config';
import { AuthService } from './auth.service';

interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  upgradeRequired?: SubscriptionTier;
}

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  uid: '',
  tier: 'free',
  status: 'active',
  platform: 'none',
  productId: null,
  expiresAt: null,
  trialEndsAt: null,
  cancelledAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const DEFAULT_FEATURE: FeatureAccess = {
  featureId: 'unknown',
  access: 'none',
};

@Injectable({ providedIn: 'root' })
export class TierService {
  private readonly authService = inject(AuthService);

  private readonly _subscription = signal<UserSubscription>(DEFAULT_SUBSCRIPTION);

  readonly subscription: Signal<UserSubscription | null> = computed(() => {
    const sub = this._subscription();
    return sub.uid ? sub : null;
  });

  readonly currentTier: Signal<SubscriptionTier> = computed(() => {
    const sub = this._subscription();
    if (sub.status === 'expired' || sub.status === 'cancelled') {
      return 'free';
    }
    return sub.tier;
  });

  readonly tierConfig: Signal<TierConfig> = computed(() => {
    return TIER_CONFIGS[this.currentTier()];
  });

  constructor() {
    // Load subscription from localStorage on init; Firestore sync can be added later
    this.loadSubscription();
  }

  hasAccess(featureId: string): boolean {
    const feature = this.getFeatureAccess(featureId);
    return feature.access === 'full' || feature.access === 'limited';
  }

  getFeatureAccess(featureId: string): FeatureAccess {
    const config = this.tierConfig();
    return config.features.find(f => f.featureId === featureId) ?? DEFAULT_FEATURE;
  }

  getLimit<K extends keyof UsageLimits>(limitKey: K): UsageLimits[K] {
    return this.tierConfig().limits[limitKey];
  }

  isPro(): boolean {
    return this.currentTier() === 'pro' || this.currentTier() === 'elite';
  }

  isElite(): boolean {
    return this.currentTier() === 'elite';
  }

  isFreeTier(): boolean {
    return this.currentTier() === 'free';
  }

  canAccessFeature(featureId: string): AccessCheckResult {
    const feature = this.getFeatureAccess(featureId);

    if (feature.access === 'full') {
      return { allowed: true };
    }

    if (feature.access === 'limited') {
      return { allowed: true, reason: 'Limited access — upgrade for full features' };
    }

    if (feature.access === 'preview') {
      return {
        allowed: false,
        reason: 'Preview only — upgrade to unlock',
        upgradeRequired: getMinimumTier(featureId),
      };
    }

    return {
      allowed: false,
      reason: 'This feature requires an upgrade',
      upgradeRequired: getMinimumTier(featureId),
    };
  }

  /** Get the tier index for comparison */
  getTierLevel(tier: SubscriptionTier): number {
    return TIER_ORDER.indexOf(tier);
  }

  /** Check if current tier meets or exceeds the required tier */
  meetsMinimumTier(requiredTier: SubscriptionTier): boolean {
    return this.getTierLevel(this.currentTier()) >= this.getTierLevel(requiredTier);
  }

  /** Update subscription (would normally come from Firestore listener) */
  updateSubscription(sub: Partial<UserSubscription>): void {
    this._subscription.update(current => ({
      ...current,
      ...sub,
      updatedAt: new Date().toISOString(),
    }));
    this.saveSubscription();
  }

  private loadSubscription(): void {
    try {
      const stored = localStorage.getItem('sport-agg-tier-subscription');
      if (stored) {
        const parsed: UserSubscription = JSON.parse(stored);
        this._subscription.set(parsed);
      }
    } catch {
      // Use default
    }
  }

  private saveSubscription(): void {
    localStorage.setItem(
      'sport-agg-tier-subscription',
      JSON.stringify(this._subscription()),
    );
  }
}
