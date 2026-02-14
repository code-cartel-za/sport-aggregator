import { Injectable, inject } from '@angular/core';
import { UsageRecord, UsageCheckResult } from '../@types';
import { TierService } from './tier.service';
import { FEATURE_IDS } from '../config/tiers.config';

const USAGE_KEY = 'sport-agg-daily-usage';

@Injectable({ providedIn: 'root' })
export class UsageTrackingService {
  private readonly tierService = inject(TierService);

  private getToday(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private loadUsage(): UsageRecord {
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      if (stored) {
        const record: UsageRecord = JSON.parse(stored);
        if (record.date === this.getToday()) {
          return record;
        }
      }
    } catch {
      // Fall through to default
    }
    return this.createEmptyRecord();
  }

  private createEmptyRecord(): UsageRecord {
    return {
      date: this.getToday(),
      comparisons: 0,
      simulations: 0,
      featureAccess: {},
    };
  }

  private saveUsage(record: UsageRecord): void {
    localStorage.setItem(USAGE_KEY, JSON.stringify(record));
  }

  trackUsage(featureId: string): UsageCheckResult {
    const check = this.canUse(featureId);
    if (!check.allowed) {
      return check;
    }

    const record = this.loadUsage();
    record.featureAccess[featureId] = (record.featureAccess[featureId] ?? 0) + 1;

    if (featureId === FEATURE_IDS.COMPARE) {
      record.comparisons += 1;
    } else if (featureId === FEATURE_IDS.SIMULATOR) {
      record.simulations += 1;
    }

    this.saveUsage(record);

    return {
      allowed: true,
      remaining: check.remaining - 1,
    };
  }

  getUsageToday(featureId: string): number {
    const record = this.loadUsage();
    return record.featureAccess[featureId] ?? 0;
  }

  getRemainingToday(featureId: string): number {
    const feature = this.tierService.getFeatureAccess(featureId);
    if (!feature.limit || feature.limit === -1) {
      return -1; // unlimited
    }
    const used = this.getUsageToday(featureId);
    return Math.max(0, feature.limit - used);
  }

  resetDailyUsage(): void {
    this.saveUsage(this.createEmptyRecord());
  }

  canUse(featureId: string): UsageCheckResult {
    const feature = this.tierService.getFeatureAccess(featureId);

    if (feature.access === 'none') {
      return { allowed: false, remaining: 0 };
    }

    if (feature.access === 'full' && !feature.limit) {
      return { allowed: true, remaining: -1 };
    }

    if (!feature.limit || feature.limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    const used = this.getUsageToday(featureId);
    const remaining = Math.max(0, feature.limit - used);

    if (remaining <= 0) {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / 3_600_000);
      const minutes = Math.floor((diffMs % 3_600_000) / 60_000);

      return {
        allowed: false,
        remaining: 0,
        resetIn: `${hours}h ${minutes}m`,
      };
    }

    return { allowed: true, remaining };
  }
}
