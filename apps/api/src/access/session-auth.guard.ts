import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { readCookie } from '../auth/auth.cookies';
import { SessionService } from '../auth/session.service';
import { AUTH_CONFIG, type AuthConfig } from '../config/auth.config';
import { Inject } from '@nestjs/common';
import { IS_PUBLIC_KEY } from './access.decorators';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionService,
    @Inject(AUTH_CONFIG) private readonly config: AuthConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    request.auth = await this.sessions.resolve(readCookie(request, this.config.sessionCookieName));
    return true;
  }
}
