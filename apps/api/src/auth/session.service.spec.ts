import { UserRole } from '@prisma/client';
import { describe, expect, it, vi } from 'vitest';
import type { AuthConfig } from '../config/auth.config';
import { SessionService, hashSessionToken } from './session.service';

const config = {
  sessionTtlMs: 60_000,
  cleanupIntervalMs: 60_000,
} as AuthConfig;

function createPrisma(session: any) {
  return {
    session: {
      create: vi.fn(async ({ data }) => ({ id: 'session-id', ...data })),
      findUnique: vi.fn(async () => session),
      update: vi.fn(async () => session),
      deleteMany: vi.fn(async () => ({ count: 1 })),
    },
  } as any;
}

describe('SessionService', () => {
  it('persists only a SHA-256 hash for a new opaque token', async () => {
    const prisma = createPrisma(null);
    const service = new SessionService(prisma, config);
    const result = await service.create({ id: 'user-id', keycloakUserId: 'subject' });
    const persisted = prisma.session.create.mock.calls[0][0].data;

    expect(result.token).toHaveLength(43);
    expect(persisted.tokenHash).toBe(hashSessionToken(result.token));
    expect(persisted.tokenHash).not.toBe(result.token);
    expect(persisted).not.toHaveProperty('accessToken');
    expect(persisted).not.toHaveProperty('refreshToken');
  });

  it.each([
    ['expired', { expiresAt: new Date(Date.now() - 1), isActiveLocal: true }],
    ['inactive', { expiresAt: new Date(Date.now() + 60_000), isActiveLocal: false }],
  ])('rejects and removes an %s session', async (_label, state) => {
    const token = 'opaque-token';
    const prisma = createPrisma({
      id: 'session-id',
      tokenHash: hashSessionToken(token),
      userProfileId: 'user-id',
      ...state,
      userProfile: {
        id: 'user-id',
        name: 'User',
        email: 'user@example.test',
        roleSnapshot: UserRole.USER,
        isActiveLocal: state.isActiveLocal,
      },
    });
    const service = new SessionService(prisma, config);

    await expect(service.resolve(token)).rejects.toMatchObject({ status: 401 });
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { tokenHash: hashSessionToken(token) },
    });
  });

  it('removes expired sessions in the periodic cleanup operation', async () => {
    const prisma = createPrisma(null);
    const service = new SessionService(prisma, config);
    const now = new Date();

    await expect(service.cleanupExpired(now)).resolves.toBe(1);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { expiresAt: { lte: now } },
    });
  });
});
