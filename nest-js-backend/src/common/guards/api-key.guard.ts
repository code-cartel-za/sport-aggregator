import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';
import { B2bApiKey } from '../../types';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject('FIRESTORE') private readonly db: admin.firestore.Firestore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey: string | undefined = request.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException({
        success: false,
        error: { code: 'MISSING_API_KEY', message: 'x-api-key header is required' },
      });
    }

    // Look up key in Firestore
    const keyDoc = await this.db.collection('api-keys').doc(apiKey).get();

    if (!keyDoc.exists) {
      throw new UnauthorizedException({
        success: false,
        error: { code: 'INVALID_API_KEY', message: 'API key is not valid' },
      });
    }

    const keyData = keyDoc.data() as B2bApiKey;

    // Check status
    if (keyData.status !== 'active') {
      throw new ForbiddenException({
        success: false,
        error: { code: 'KEY_INACTIVE', message: `API key is ${keyData.status}` },
      });
    }

    // Check expiry
    if (keyData.expiresAt && new Date(keyData.expiresAt) < new Date()) {
      throw new ForbiddenException({
        success: false,
        error: { code: 'KEY_EXPIRED', message: 'API key has expired' },
      });
    }

    // Rate limiting — check daily usage
    const today: string = new Date().toISOString().split('T')[0] as string;
    const usageRef = this.db.collection('api-usage').doc(`${apiKey}_${today}`);
    const usageDoc = await usageRef.get();
    const currentDailyCount: number = usageDoc.exists
      ? (usageDoc.data()?.['requestCount'] as number ?? 0)
      : 0;

    if (currentDailyCount >= keyData.rateLimits.requestsPerDay) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Daily limit of ${keyData.rateLimits.requestsPerDay} requests exceeded`,
          },
        },
        429,
      );
    }

    // Increment usage
    const endpoint: string = request.path;
    await usageRef.set(
      {
        key: apiKey,
        date: today,
        requestCount: admin.firestore.FieldValue.increment(1),
        [`endpoints.${endpoint.replace(/\//g, '_')}`]: admin.firestore.FieldValue.increment(1),
        lastRequestAt: new Date().toISOString(),
      },
      { merge: true },
    );

    // Attach key data to request for downstream use
    (request as Request & { apiKey: B2bApiKey })['apiKey'] = keyData;

    return true;
  }
}
