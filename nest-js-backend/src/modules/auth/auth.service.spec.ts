import { ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { createMockFirestore } from '../../test/helpers/mock-firestore';
import { UsageService } from '../usage/usage.service';
import { B2bUsageRecord } from '../../types';

describe('AuthService', () => {
  let authService: AuthService;
  let db: ReturnType<typeof createMockFirestore>;
  let usageService: UsageService;

  beforeEach(() => {
    db = createMockFirestore();
    usageService = {
      getUsageForKey: jest.fn().mockResolvedValue([
        { key: 'sk_live_test', date: '2026-02-14', requestCount: 42, endpoints: {}, lastRequestAt: '2026-02-14T12:00:00Z' },
      ] as B2bUsageRecord[]),
    } as unknown as UsageService;
    authService = new AuthService(db as never, usageService);
    process.env['ADMIN_SECRET'] = 'test-secret';
  });

  afterEach(() => {
    delete process.env['ADMIN_SECRET'];
  });

  it('should create API key with correct structure', async () => {
    const result = await authService.createKey(
      { name: 'Test App', email: 'test@example.com', tier: 'starter' },
      'test-secret',
    );
    expect(result.key).toMatch(/^sk_live_/);
    expect(result.name).toBe('Test App');
    expect(result.email).toBe('test@example.com');
    expect(result.tier).toBe('starter');
    expect(result.status).toBe('active');
    expect(result.rateLimits.requestsPerDay).toBe(1000);
    expect(result.permissions).toContain('football');
  });

  it('should reject creation without valid admin secret', async () => {
    await expect(
      authService.createKey(
        { name: 'Test', email: 'test@example.com', tier: 'starter' },
        'wrong-secret',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should revoke key (sets status to revoked)', async () => {
    const key = await authService.createKey(
      { name: 'Revoke Me', email: 'test@example.com', tier: 'starter' },
      'test-secret',
    );
    await authService.revokeKey(key.key);

    const store = (db as Record<string, unknown>)['_store'] as Record<string, Record<string, Record<string, unknown>>>;
    const keyData = store['api-keys']?.[key.key];
    expect(keyData?.['status']).toBe('revoked');
  });

  it('should return usage stats for a key', async () => {
    const usage = await authService.getUsage('sk_live_test');
    expect(usage).toHaveLength(1);
    expect(usage[0].requestCount).toBe(42);
    expect(usageService.getUsageForKey).toHaveBeenCalledWith('sk_live_test');
  });
});
