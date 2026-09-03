import { describe, expect, it } from 'vitest';
import { parseSelfServiceProfileUpdate } from './self-service-profile.policy';

describe('parseSelfServiceProfileUpdate', () => {
  it('accepts and normalizes the allowed display name', () => {
    expect(parseSelfServiceProfileUpdate({ name: '  Nome Permitido  ' })).toEqual({
      name: 'Nome Permitido',
    });
  });

  it.each([
    { name: 'User', role: 'ADMIN' },
    { name: 'User', roleSnapshot: 'ADMIN' },
    { name: 'User', isActiveLocal: true },
    { name: 'User', keycloakUserId: 'another-subject' },
  ])('rejects protected self-service fields: %o', (payload) => {
    expect(() => parseSelfServiceProfileUpdate(payload)).toThrow(/campos protegidos/i);
  });

  it('rejects unknown fields instead of silently accepting mass assignment', () => {
    expect(() => parseSelfServiceProfileUpdate({ name: 'User', unexpected: true })).toThrow(
      /campos não permitidos/i,
    );
  });
});
