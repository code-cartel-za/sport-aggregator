/**
 * Usage Tracking Types
 * Tracks daily feature usage for tier-gated limits.
 */

export interface UsageRecord {
  date: string;
  comparisons: number;
  simulations: number;
  featureAccess: Record<string, number>;
}

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  resetIn?: string;
}
