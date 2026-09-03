import { UserRole } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { toManagedUser } from '../users/user.types';

describe('Safe serialization and contract compliance', () => {
  it('does not expose tokenHash, password, or provider credentials in ManagedUserDto', () => {
    const mockProfile = {
      id: 'usr_123',
      keycloakUserId: 'kc_abc',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      roleSnapshot: UserRole.ADMIN,
      isActiveLocal: true,
      createdAt: new Date('2026-08-31T12:00:00.000Z'),
      updatedAt: new Date('2026-08-31T12:30:00.000Z'),
    };

    const dto = toManagedUser(mockProfile);

    expect(dto).toEqual({
      id: 'usr_123',
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: UserRole.ADMIN,
      isActive: true,
      createdAt: '2026-08-31T12:00:00.000Z',
      updatedAt: '2026-08-31T12:30:00.000Z',
    });

    const serialized = JSON.stringify(dto);
    expect(serialized).not.toContain('tokenHash');
    expect(serialized).not.toContain('password');
    expect(serialized).not.toContain('clientSecret');
    expect(serialized).not.toContain('keycloakUserId');
  });

  it('serializes dates as standard ISO 8601 UTC strings ending with Z', () => {
    const now = new Date('2026-08-31T15:45:00.000Z');
    const mockProfile = {
      id: 'usr_456',
      keycloakUserId: 'kc_def',
      name: 'Grace Hopper',
      email: 'grace@example.com',
      roleSnapshot: UserRole.USER,
      isActiveLocal: true,
      createdAt: now,
      updatedAt: now,
    };

    const dto = toManagedUser(mockProfile);

    expect(dto.createdAt).toBe('2026-08-31T15:45:00.000Z');
    expect(dto.updatedAt).toBe('2026-08-31T15:45:00.000Z');
    expect(dto.createdAt.endsWith('Z')).toBe(true);
  });
});
