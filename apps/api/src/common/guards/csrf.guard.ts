import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../access/access.decorators';
import { readCookie } from '../../auth/auth.cookies';
import { AUTH_CONFIG, type AuthConfig } from '../../config/auth.config';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    if (!MUTATING_METHODS.has(request.method.toUpperCase())) {
      return true;
    }

    // If request uses cookie-based authentication, verify origin / custom header
    const hasSessionCookie = Boolean(readCookie(request, this.config.sessionCookieName));
    if (hasSessionCookie) {
      this.validateOriginAndHeader(request);
    }

    return true;
  }

  private validateOriginAndHeader(request: Request): void {
    const origin = request.headers.origin;
    const referer = request.headers.referer;
    const expectedOrigin = new URL(this.config.webBaseUrl).origin;

    if (origin) {
      if (origin !== expectedOrigin) {
        throw new ForbiddenException('Origem da requisição não permitida.');
      }
      return;
    }

    if (referer) {
      try {
        const refererOrigin = new URL(referer).origin;
        if (refererOrigin !== expectedOrigin) {
          throw new ForbiddenException('Referer da requisição não permitido.');
        }
        return;
      } catch {
        throw new ForbiddenException('Referer inválido.');
      }
    }

    // If neither Origin nor Referer is present on a cookie-authenticated mutation:
    const customHeader = request.headers['x-requested-with'] || request.headers['x-csrf-token'];
    if (!customHeader) {
      throw new ForbiddenException('Mutação autenticada por cookie requer validação de origem ou cabeçalho CSRF.');
    }
  }
}
