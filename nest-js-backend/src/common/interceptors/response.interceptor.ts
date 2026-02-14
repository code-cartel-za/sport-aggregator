import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { randomUUID } from 'crypto';
import { Request } from 'express';
import { B2bApiKey, B2bApiResponse } from '../../types';

@Injectable()
export class B2bResponseInterceptor<T> implements NestInterceptor<T, B2bApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<B2bApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Request & { apiKey?: B2bApiKey }>();
    const apiKey: B2bApiKey | undefined = request.apiKey;

    return next.handle().pipe(
      map((data: T): B2bApiResponse<T> => ({
        success: true,
        data,
        meta: {
          requestId: randomUUID(),
          timestamp: new Date().toISOString(),
          cached: false,
          rateLimit: {
            remaining: apiKey?.rateLimits.requestsPerDay ?? -1,
            limit: apiKey?.rateLimits.requestsPerDay ?? -1,
            resetAt: new Date(
              new Date().setUTCHours(24, 0, 0, 0),
            ).toISOString(),
          },
        },
      })),
    );
  }
}
