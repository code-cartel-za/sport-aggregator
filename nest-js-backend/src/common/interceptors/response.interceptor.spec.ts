import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { B2bResponseInterceptor } from './response.interceptor';
import { B2bApiKey, B2bApiResponse } from '../../types';

function createMockContext(apiKey?: B2bApiKey): ExecutionContext {
  const request: Record<string, unknown> = { apiKey };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('B2bResponseInterceptor', () => {
  const interceptor = new B2bResponseInterceptor();

  const mockApiKey: B2bApiKey = {
    key: 'sk_test',
    name: 'Test',
    email: 'test@test.com',
    tier: 'starter',
    status: 'active',
    rateLimits: { requestsPerMinute: 30, requestsPerDay: 1000 },
    permissions: ['football'],
    createdAt: '2026-01-01',
    expiresAt: null,
  };

  it('should wrap response in B2bApiResponse format', async () => {
    const ctx = createMockContext(mockApiKey);
    const handler: CallHandler = { handle: () => of({ teams: [] }) };
    const result = await lastValueFrom(interceptor.intercept(ctx, handler));
    const response = result as B2bApiResponse<{ teams: unknown[] }>;
    expect(response.success).toBe(true);
    expect(response.data).toEqual({ teams: [] });
  });

  it('should include requestId, timestamp, cached flag in meta', async () => {
    const ctx = createMockContext(mockApiKey);
    const handler: CallHandler = { handle: () => of('data') };
    const result = await lastValueFrom(interceptor.intercept(ctx, handler));
    const response = result as B2bApiResponse<string>;
    expect(response.meta.requestId).toBeDefined();
    expect(response.meta.timestamp).toBeDefined();
    expect(response.meta.cached).toBe(false);
  });

  it('should include rateLimit info from apiKey on request', async () => {
    const ctx = createMockContext(mockApiKey);
    const handler: CallHandler = { handle: () => of('data') };
    const result = await lastValueFrom(interceptor.intercept(ctx, handler));
    const response = result as B2bApiResponse<string>;
    expect(response.meta.rateLimit.limit).toBe(1000);
    expect(response.meta.rateLimit.remaining).toBe(1000);
    expect(response.meta.rateLimit.resetAt).toBeDefined();
  });
});
