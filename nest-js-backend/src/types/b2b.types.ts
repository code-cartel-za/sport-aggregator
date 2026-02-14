export type B2bTier = 'starter' | 'growth' | 'enterprise';
export type B2bKeyStatus = 'active' | 'suspended' | 'revoked';

export interface B2bApiKey {
  key: string;
  name: string;
  email: string;
  tier: B2bTier;
  status: B2bKeyStatus;
  rateLimits: B2bRateLimits;
  permissions: string[];
  createdAt: string;
  expiresAt: string | null;
}

export interface B2bRateLimits {
  requestsPerMinute: number;
  requestsPerDay: number;
}

export interface B2bUsageRecord {
  key: string;
  date: string;
  requestCount: number;
  endpoints: Record<string, number>;
  lastRequestAt: string;
}

export interface B2bApiResponse<T> {
  success: boolean;
  data?: T;
  error?: B2bApiError;
  meta: B2bResponseMeta;
}

export interface B2bApiError {
  code: string;
  message: string;
}

export interface B2bResponseMeta {
  requestId: string;
  timestamp: string;
  cached: boolean;
  rateLimit: {
    remaining: number;
    limit: number;
    resetAt: string;
  };
}

export const TIER_RATE_LIMITS: Record<B2bTier, B2bRateLimits> = {
  starter: { requestsPerMinute: 30, requestsPerDay: 1000 },
  growth: { requestsPerMinute: 120, requestsPerDay: 10000 },
  enterprise: { requestsPerMinute: 600, requestsPerDay: 100000 },
};
