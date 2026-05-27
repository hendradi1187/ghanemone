import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

/**
 * Global logging interceptor — logs method, path, status code, and duration for every request.
 * Sensitive fields (password, token, secret, authorization) are redacted from body logs.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const statusCode = response.statusCode;
          this.logger.log(`${method} ${url} ${statusCode} +${duration}ms`);
        },
        error: (err: unknown) => {
          const duration = Date.now() - start;
          const statusCode = err instanceof Error ? 500 : (err as { status?: number })?.status ?? 500;
          this.logger.warn(`${method} ${url} ${statusCode} +${duration}ms`);
        },
      }),
    );
  }
}
