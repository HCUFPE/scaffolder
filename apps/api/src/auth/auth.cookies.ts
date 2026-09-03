import type { CookieOptions, Request } from 'express';
import { parse } from 'cookie';
import type { AuthConfig } from '../config/auth.config';

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.cookie;
  if (!header) return undefined;
  return parse(header)[name];
}

export function sessionCookieOptions(config: AuthConfig): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.secureCookies,
    path: '/',
    maxAge: config.sessionTtlMs,
  };
}

export function correlationCookieOptions(config: AuthConfig): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.secureCookies,
    path: '/api/v1/auth/callback',
    maxAge: config.correlationTtlMs,
  };
}

export function clearSessionCookieOptions(config: AuthConfig): CookieOptions {
  const { maxAge: _maxAge, ...options } = sessionCookieOptions(config);
  return options;
}

export function clearCorrelationCookieOptions(config: AuthConfig): CookieOptions {
  const { maxAge: _maxAge, ...options } = correlationCookieOptions(config);
  return options;
}

export function assertTrustedOrigin(request: Request, config: AuthConfig): void {
  const origin = request.headers.origin;
  if (!origin || origin !== new URL(config.webBaseUrl).origin) {
    throw new Error('Origem da requisição não permitida.');
  }
}
