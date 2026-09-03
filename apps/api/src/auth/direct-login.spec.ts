import { describe, expect, it, vi, beforeEach } from 'vitest';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import type { AuthService } from './auth.service';
import type { OidcService } from './oidc.service';
import type { SessionService } from './session.service';
import type { AuthConfig } from '../config/auth.config';

describe('Headless Direct Login', () => {
  let controller: AuthController;
  let authService: Partial<AuthService>;
  let oidcService: Partial<OidcService>;
  let sessionService: Partial<SessionService>;
  let config: AuthConfig;

  beforeEach(() => {
    authService = {
      completeLogin: vi.fn().mockResolvedValue({
        token: 'raw-opaque-token-123',
        user: {
          id: 'usr_1',
          name: 'Ada Lovelace',
          email: 'ada@example.com',
          role: UserRole.ADMIN,
        },
      }),
    };

    oidcService = {
      loginWithCredentials: vi.fn().mockResolvedValue({
        subject: 'kc-sub-123',
        email: 'ada@example.com',
        name: 'Ada Lovelace',
        roles: ['ADMIN'],
      }),
    };

    sessionService = {
      revokeCurrent: vi.fn(),
      revokeAll: vi.fn(),
    };

    config = {
      issuer: 'http://localhost:8080/realms/appstart',
      clientId: 'appstart-api',
      clientSecret: 'secret',
      callbackUrl: 'http://localhost:3100/api/v1/auth/callback',
      webBaseUrl: 'http://localhost:5173',
      sessionCookieName: 'appstart_session',
      correlationCookieName: 'appstart_oidc_correlation',
      sessionTtlSeconds: 86400,
      correlationTtlMs: 300000,
      cookieSecure: false,
    };

    controller = new AuthController(
      authService as AuthService,
      oidcService as OidcService,
      sessionService as SessionService,
      config,
    );
  });

  it('authenticates with credentials, sets session cookie, and returns safe user profile', async () => {
    const mockRequest = {
      headers: {
        origin: 'http://localhost:5173',
      },
    } as any;

    const cookieMock = vi.fn();
    const mockResponse = {
      cookie: cookieMock,
    } as any;

    const result = await controller.directLogin(
      { username: 'admin', password: 'SecretPassword123' },
      mockRequest,
      mockResponse,
    );

    expect(oidcService.loginWithCredentials).toHaveBeenCalledWith('admin', 'SecretPassword123');
    expect(authService.completeLogin).toHaveBeenCalledWith({
      subject: 'kc-sub-123',
      email: 'ada@example.com',
      name: 'Ada Lovelace',
      roles: ['ADMIN'],
    });

    expect(cookieMock).toHaveBeenCalledWith(
      'appstart_session',
      'raw-opaque-token-123',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );

    expect(result).toEqual({
      user: {
        id: 'usr_1',
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        role: UserRole.ADMIN,
      },
    });
  });
});
