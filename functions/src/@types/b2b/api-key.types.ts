export interface B2bApiKey {
  key: string;
  name: string;
  email: string;
  tier: B2bTier;
  status: B2bKeyStatus;
  rateLimits: B2bRateLimits;
  usage: B2bUsage;
  permissions: string[];
  createdAt: string;
  expiresAt: string | null;
}

export type B2bTier = "starter" | "growth" | "enterprise";
export type B2bKeyStatus = "active" | "suspended" | "revoked";

export interface B2bRateLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
}

export interface B2bUsage {
  today: number;
  thisMinute: number;
  lastRequestAt: string | null;
}

export interface B2bRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
  limit: number;
}

export const TIER_LIMITS: Record<B2bTier, B2bRateLimits> = {
  starter: {requestsPerMinute: 30, requestsPerDay: 1000},
  growth: {requestsPerMinute: 120, requestsPerDay: 10000},
  enterprise: {requestsPerMinute: 600, requestsPerDay: 100000},
};
