import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { randomUUID } from 'crypto';

interface ErrorBody {
  success: boolean;
  error: { code: string; message: string };
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_ERROR';
    let message = 'An unexpected error occurred';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null && 'error' in body) {
        const errorBody = body as ErrorBody;
        code = errorBody.error?.code ?? 'ERROR';
        message = errorBody.error?.message ?? exception.message;
      } else if (typeof body === 'object' && body !== null && 'message' in body) {
        const msgBody = body as { message: string | string[] };
        message = Array.isArray(msgBody.message)
          ? msgBody.message.join(', ')
          : msgBody.message;
        code = status === 400 ? 'VALIDATION_ERROR' : 'ERROR';
      } else {
        message = exception.message;
      }
    }

    response.status(status).json({
      success: false,
      error: { code, message },
      meta: {
        requestId: randomUUID(),
        timestamp: new Date().toISOString(),
        cached: false,
        rateLimit: { remaining: -1, limit: -1, resetAt: '' },
      },
    });
  }
}
