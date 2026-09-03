import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { createAuthConfig } from '../config/auth.config';
import { safeInternalPath } from './oidc.service';

describe('authentication security invariants', () => {
  it('keeps password and provider token fields out of the Prisma schema', () => {
    const schema = readFileSync(resolve(process.cwd(), 'prisma/schema.prisma'), 'utf8');
    expect(schema).not.toMatch(/password(hash)?\s+String/i);
    expect(schema).not.toMatch(/(?:access|refresh|id)Token\s+String/i);
    expect(schema).toContain('tokenHash');
    expect(schema).toContain('keycloakUserId');
  });

  it.each([
    ['https://evil.test', '/'],
    ['//evil.test/path', '/'],
    ['/\\evil.test', '/'],
    ['/tasks?status=open', '/tasks?status=open'],
  ])('normalizes return target %s', (input, expected) => {
    expect(safeInternalPath(input)).toBe(expected);
  });

  it('includes realm roles in the Keycloak ID token used by the BFF', () => {
    const renderer = readFileSync(resolve(process.cwd(), '../../scripts/keycloak-render-realm.mjs'), 'utf8');
    expect(renderer).toContain("'claim.name': 'realm_access.roles'");
    expect(renderer).toContain("'id.token.claim': 'true'");
  });

  it('requires HTTPS URLs in production', () => {
    expect(() => createAuthConfig({
      NODE_ENV: 'production',
      API_PORT: '3000',
      WEB_PORT: '5173',
      API_BASE_URL: 'http://api.example.test',
      WEB_BASE_URL: 'https://app.example.test',
      KEYCLOAK_BASE_URL: 'https://id.example.test',
      KEYCLOAK_REALM: 'appstart',
      KEYCLOAK_CLIENT_ID: 'appstart-server',
      KEYCLOAK_CLIENT_SECRET: 'secret',
      KEYCLOAK_ADMIN_CLIENT_ID: 'appstart-admin',
      KEYCLOAK_ADMIN_CLIENT_SECRET: 'admin-secret',
      SESSION_TTL_HOURS: '24',
      SESSION_COOKIE_NAME: 'session',
    })).toThrow(/API_BASE_URL deve usar HTTPS/);
  });
});
