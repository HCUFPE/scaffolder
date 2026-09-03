import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, expect, it } from 'vitest';
import type { AuthConfig } from '../../config/auth.config';
import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
  const config: AuthConfig = {
    webBaseUrl: 'http://localhost:5173',
    sessionCookieName: 'appstart_session',
  } as unknown as AuthConfig;

  function createMockContext(method: string, headers: Record<string, string>, isPublic = false): ExecutionContext {
    const reflector = {
      getAllAndOverride: () => isPublic,
    } as unknown as Reflector;

    const request = {
      method,
      headers,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
      reflector,
    } as unknown as ExecutionContext;
  }

  it('allows safe HTTP methods unconditionally', () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('GET', { cookie: 'appstart_session=123' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows public routes even for mutating methods', () => {
    const reflector = { getAllAndOverride: () => true } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('POST', { cookie: 'appstart_session=123' }, true);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows cookie-authenticated mutations with matching Origin header', () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('POST', {
      cookie: 'appstart_session=123',
      origin: 'http://localhost:5173',
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects cookie-authenticated mutations with untrusted Origin header', () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('POST', {
      cookie: 'appstart_session=123',
      origin: 'https://evil.attacker.com',
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('rejects cookie-authenticated mutations missing origin and CSRF header', () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('POST', {
      cookie: 'appstart_session=123',
    });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows cookie-authenticated mutations with custom CSRF header when origin is omitted', () => {
    const reflector = { getAllAndOverride: () => false } as unknown as Reflector;
    const guard = new CsrfGuard(reflector, config);
    const ctx = createMockContext('POST', {
      cookie: 'appstart_session=123',
      'x-requested-with': 'XMLHttpRequest',
    });

    expect(guard.canActivate(ctx)).toBe(true);
  });
});
