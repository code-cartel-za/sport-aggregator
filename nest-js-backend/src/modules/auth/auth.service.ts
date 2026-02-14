import { Injectable, Inject, ForbiddenException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { randomBytes } from 'crypto';
import { B2bApiKey, TIER_RATE_LIMITS } from '../../types';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { UsageService } from '../usage/usage.service';
import { B2bUsageRecord } from '../../types';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
    private readonly usageService: UsageService,
  ) {}

  async createKey(dto: CreateApiKeyDto, adminSecret: string): Promise<B2bApiKey> {
    const expectedSecret = process.env['ADMIN_SECRET'] ?? 'default-admin-secret';
    if (adminSecret !== expectedSecret) {
      throw new ForbiddenException({
        success: false,
        error: { code: 'INVALID_ADMIN_SECRET', message: 'Invalid admin secret' },
      });
    }

    const key = `sk_live_${randomBytes(24).toString('hex')}`;
    const rateLimits = TIER_RATE_LIMITS[dto.tier];

    const apiKey: B2bApiKey = {
      key,
      name: dto.name,
      email: dto.email,
      tier: dto.tier,
      status: 'active',
      rateLimits,
      permissions: ['football', 'fpl', 'f1'],
      createdAt: new Date().toISOString(),
      expiresAt: dto.expiresAt ?? null,
    };

    await this.db.collection('api-keys').doc(key).set(apiKey);
    return apiKey;
  }

  async revokeKey(key: string): Promise<void> {
    const doc = this.db.collection('api-keys').doc(key);
    const snapshot = await doc.get();
    if (!snapshot.exists) {
      throw new ForbiddenException({
        success: false,
        error: { code: 'KEY_NOT_FOUND', message: 'API key not found' },
      });
    }
    await doc.update({ status: 'revoked' });
  }

  async getUsage(apiKey: string): Promise<B2bUsageRecord[]> {
    return this.usageService.getUsageForKey(apiKey);
  }
}
