import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';

export interface CacheDoc<T> {
  key: string;
  data: T;
  createdAt: number;
  expiresAt: number;
  ttlMs: number;
}

export interface CacheResult<T> {
  data: T;
  fromCache: boolean;
}

@Injectable()
export class CacheService {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async get<T>(key: string, collection = 'cache'): Promise<T | null> {
    const doc = await this.db.collection(collection).doc(key).get();
    if (!doc.exists) return null;

    const cached = doc.data() as CacheDoc<T>;
    if (Date.now() > cached.expiresAt) return null;

    return cached.data;
  }

  async set<T>(key: string, data: T, ttlMs: number, collection = 'cache'): Promise<void> {
    const now = Date.now();
    const cacheDoc: CacheDoc<T> = {
      key,
      data,
      createdAt: now,
      expiresAt: now + ttlMs,
      ttlMs,
    };
    await this.db.collection(collection).doc(key).set(cacheDoc);
  }

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number,
    collection = 'cache',
  ): Promise<CacheResult<T>> {
    const cached = await this.get<T>(key, collection);
    if (cached !== null) {
      return { data: cached, fromCache: true };
    }

    const data = await fetcher();
    await this.set(key, data, ttlMs, collection);
    return { data, fromCache: false };
  }
}
