import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { B2bApiKey } from '../../types';

export const CurrentApiKey = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): B2bApiKey => {
    const request = ctx.switchToHttp().getRequest<Request & { apiKey: B2bApiKey }>();
    return request.apiKey;
  },
);
