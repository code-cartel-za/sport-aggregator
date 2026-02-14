/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock firebase-admin before importing cache module
const mockStore: Record<string, Record<string, Record<string, unknown>>> = {};

function getOrCreate(col: string): Record<string, Record<string, unknown>> {
  if (!mockStore[col]) mockStore[col] = {};
  return mockStore[col];
}

jest.mock('firebase-admin', () => ({
  firestore: () => ({
    collection: (name: string) => ({
      doc: (docId: string) => ({
        get: async () => {
          const col = getOrCreate(name);
          const data = col[docId];
          return {
            exists: !!data,
            data: () => data ? { ...data } : undefined,
          };
        },
        set: async (data: Record<string, unknown>) => {
          const col = getOrCreate(name);
          col[docId] = { ...data };
        },
      }),
    }),
  }),
}));

import { getCached, setCache, getOrFetch, CacheOptions } from './cache';

const options: CacheOptions = { ttlMs: 60000, collection: 'cache' };

describe('getCached', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) delete mockStore[key];
  });

  it('should return null when no cache exists', async () => {
    const result = await getCached('nonexistent', options);
    expect(result).toBeNull();
  });

  it('should return null when cache is expired', async () => {
    const col = getOrCreate('cache');
    col['expired-key'] = { key: 'expired-key', data: { foo: 'bar' }, createdAt: 1000, expiresAt: 1, ttlMs: 60000 };
    const result = await getCached('expired-key', options);
    expect(result).toBeNull();
  });

  it('should return data when cache is fresh', async () => {
    const col = getOrCreate('cache');
    col['fresh-key'] = { key: 'fresh-key', data: { foo: 'bar' }, createdAt: Date.now(), expiresAt: Date.now() + 60000, ttlMs: 60000 };
    const result = await getCached<{ foo: string }>('fresh-key', options);
    expect(result).toEqual({ foo: 'bar' });
  });
});

describe('setCache', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) delete mockStore[key];
  });

  it('should store data with correct TTL', async () => {
    await setCache('test-key', { hello: 'world' }, options);
    const col = getOrCreate('cache');
    const stored = col['test-key'];
    expect(stored).toBeDefined();
    expect(stored['ttlMs']).toBe(60000);
    expect((stored['data'] as Record<string, string>)['hello']).toBe('world');
  });
});

describe('getOrFetch', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockStore)) delete mockStore[key];
  });

  it('should return cached data when fresh (does not call fetcher)', async () => {
    const col = getOrCreate('cache');
    col['cached'] = { key: 'cached', data: { cached: true }, createdAt: Date.now(), expiresAt: Date.now() + 60000, ttlMs: 60000 };
    const fetcher = jest.fn().mockResolvedValue({ cached: false });
    const result = await getOrFetch('cached', fetcher, options);
    expect(result.fromCache).toBe(true);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('should call fetcher when cache is stale', async () => {
    const fetcher = jest.fn().mockResolvedValue({ fresh: true });
    const result = await getOrFetch('missing', fetcher, options);
    expect(result.fromCache).toBe(false);
    expect(fetcher).toHaveBeenCalled();
  });

  it('should store fetched data in cache', async () => {
    const fetcher = jest.fn().mockResolvedValue({ stored: true });
    await getOrFetch('store-test', fetcher, options);
    const col = getOrCreate('cache');
    expect(col['store-test']).toBeDefined();
  });
});
