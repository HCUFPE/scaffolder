import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { redactSensitiveData } from './redaction';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly isProduction = process.env.NODE_ENV === 'production';

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const startTime = Date.now();
    const { method, url, ip } = request;
    const userAgent = request.get('user-agent') || '-';
    const requestId = request.requestId || (request.headers['x-request-id'] as string) || '-';

    return next.handle().pipe(
      tap({
        next: () => {
          this.logSuccess(request, response, startTime, requestId, method, url, ip, userAgent);
        },
        error: (error: unknown) => {
          this.logError(request, response, startTime, requestId, method, url, ip, userAgent, error);
        },
      }),
    );
  }

  private logSuccess(
    _request: Request,
    response: Response,
    startTime: number,
    requestId: string,
    method: string,
    url: string,
    ip: string | undefined,
    userAgent: string,
  ): void {
    const durationMs = Date.now() - startTime;
    const statusCode = response.statusCode;

    if (this.isProduction) {
      const logEntry = redactSensitiveData({
        level: 'info',
        timestamp: new Date().toISOString(),
        requestId,
        method,
        url,
        statusCode,
        durationMs,
        ip,
        userAgent,
      });
      console.log(JSON.stringify(logEntry));
    } else {
      this.logger.log(`${method} ${url} ${statusCode} +${durationMs}ms [${requestId}]`);
    }
  }

  private logError(
    _request: Request,
    response: Response,
    startTime: number,
    requestId: string,
    method: string,
    url: string,
    ip: string | undefined,
    userAgent: string,
    error: unknown,
  ): void {
    const durationMs = Date.now() - startTime;
    const statusCode =
      (error as { getStatus?: () => number })?.getStatus?.() ||
      (error as { status?: number })?.status ||
      response.statusCode ||
      500;

    const message = (error as Error)?.message || 'Erro desconhecido';

    if (this.isProduction) {
      const logEntry = redactSensitiveData({
        level: statusCode >= 500 ? 'error' : 'warn',
        timestamp: new Date().toISOString(),
        requestId,
        method,
        url,
        statusCode,
        durationMs,
        ip,
        userAgent,
        error: message,
      });
      console.log(JSON.stringify(logEntry));
    } else {
      if (statusCode >= 500) {
        this.logger.error(`${method} ${url} ${statusCode} +${durationMs}ms [${requestId}] - ${message}`);
      } else {
        this.logger.warn(`${method} ${url} ${statusCode} +${durationMs}ms [${requestId}] - ${message}`);
      }
    }
  }
}
