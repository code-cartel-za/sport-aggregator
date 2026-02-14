import { ExecutionContext, UnauthorizedException, ForbiddenException, HttpException } from '@nestjs/common';
import { ApiKeyGuard } from './api-key.guard';
import { createMockFirestore } from '../../test/helpers/mock-firestore';
import { B2bApiKey } from '../../types';

function createMockContext(headers: Record<string, string | undefined> = {}, path = '/v1/test'): ExecutionContext {
  const request: Record<string, unknown> = {
    headers,
    path,
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => ({}),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

const validKey: B2bApiKey = {
  key: 'sk_live_test123',
  name: 'Test App',
  email: 'test@example.com',
  tier: 'starter',
  status: 'active',
  rateLimits: { requestsPerMinute: 30, requestsPerDay: 1000 },
  permissions: ['football', 'fpl', 'f1'],
  createdAt: '2026-01-01T00:00:00.000Z',
  expiresAt: null,
};

describe('ApiKeyGuard', () => {
  it('should return 401 when x-api-key header is missing', async () => {
    const db = createMockFirestore();
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({});
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return 401 when API key does not exist in Firestore', async () => {
    const db = createMockFirestore();
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'nonexistent_key' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('should return 403 when key status is suspended', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_suspended': { ...validKey, key: 'sk_suspended', status: 'suspended' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_suspended' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should return 403 when key status is revoked', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_revoked': { ...validKey, key: 'sk_revoked', status: 'revoked' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_revoked' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should return 403 when key is expired', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_expired': { ...validKey, key: 'sk_expired', expiresAt: '2020-01-01T00:00:00.000Z' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_expired' });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('should return 429 when daily rate limit exceeded', async () => {
    const today = new Date().toISOString().split('T')[0];
    const db = createMockFirestore({
      'api-keys': { 'sk_limited': { ...validKey, key: 'sk_limited', rateLimits: { requestsPerMinute: 30, requestsPerDay: 5 } } },
      'api-usage': { [`sk_limited_${today}`]: { requestCount: 5, key: 'sk_limited', date: today } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_limited' });
    try {
      await guard.canActivate(ctx);
      fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
      expect((e as HttpException).getStatus()).toBe(429);
    }
  });

  it('should allow request when key is valid and within limits', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_valid': { ...validKey, key: 'sk_valid' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_valid' });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('should increment usage counter on successful request', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_usage': { ...validKey, key: 'sk_usage' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_usage' });
    await guard.canActivate(ctx);

    const store = (db as Record<string, unknown>)['_store'] as Record<string, Record<string, Record<string, unknown>>>;
    const usageEntries = Object.keys(store['api-usage'] ?? {});
    expect(usageEntries.length).toBe(1);
  });

  it('should attach apiKey data to request object', async () => {
    const db = createMockFirestore({
      'api-keys': { 'sk_attach': { ...validKey, key: 'sk_attach' } },
    });
    const guard = new ApiKeyGuard(db as never);
    const ctx = createMockContext({ 'x-api-key': 'sk_attach' });
    await guard.canActivate(ctx);

    const request = ctx.switchToHttp().getRequest() as Record<string, unknown>;
    expect(request['apiKey']).toBeDefined();
    expect((request['apiKey'] as B2bApiKey).key).toBe('sk_attach');
  });
});
