import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { createHash, generateKeyPairSync, randomUUID } from 'node:crypto';
import { createServer, type Server } from 'node:http';
import { exportJWK, SignJWT } from 'jose';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module';
import { AUTH_CONFIG, createAuthConfig, type AuthConfig } from '../src/config/auth.config';
import { PrismaService } from '../src/prisma/prisma.service';
import { hashSessionToken } from '../src/auth/session.service';
import { KeycloakAdminService } from '../src/users/keycloak-admin.service';

class InMemoryPrisma {
  profiles: Array<any> = [];
  sessions: Array<any> = [];

  userProfile = {
    findUnique: async (_args: any) => undefined,
  } as any;

  session = {} as any;
  $transaction = async (operations: Promise<any>[]) => Promise.all(operations);

  constructor() {
    this.userProfile.findUnique = async ({ where }: any) => this.profiles.find((profile) =>
      (where.id && profile.id === where.id)
      || (where.keycloakUserId && profile.keycloakUserId === where.keycloakUserId)
      || (where.email && profile.email === where.email),
    ) ?? null;
    this.userProfile.create = async ({ data }: any) => {
      if (this.profiles.some((profile) => profile.email === data.email || profile.keycloakUserId === data.keycloakUserId)) {
        throw new Error('unique constraint');
      }
      const profile = {
        id: randomUUID(),
        roleSnapshot: UserRole.USER,
        isActiveLocal: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...data,
      };
      this.profiles.push(profile);
      return profile;
    };
    this.userProfile.update = async ({ where, data }: any) => {
      const profile = this.profiles.find((candidate) => candidate.id === where.id);
      if (!profile) throw new Error('profile not found');
      Object.assign(profile, data, { updatedAt: new Date() });
      return profile;
    };
    this.userProfile.findMany = async ({ where, skip = 0, take = 20 }: any) => {
      const search = where?.OR?.[0]?.name?.contains?.toLowerCase();
      const filtered = search
        ? this.profiles.filter((profile) => profile.name.toLowerCase().includes(search) || profile.email.toLowerCase().includes(search))
        : this.profiles;
      return filtered.slice(skip, skip + take);
    };
    this.userProfile.count = async ({ where }: any) => {
      const search = where?.OR?.[0]?.name?.contains?.toLowerCase();
      return search
        ? this.profiles.filter((profile) => profile.name.toLowerCase().includes(search) || profile.email.toLowerCase().includes(search)).length
        : this.profiles.length;
    };
    this.userProfile.upsert = async ({ where, create, update }: any) => {
      const current = this.profiles.find((profile) => profile.keycloakUserId === where.keycloakUserId);
      if (current) {
        Object.assign(current, update, { updatedAt: new Date() });
        return current;
      }
      return this.userProfile.create({ data: create });
    };

    this.session.create = async ({ data }: any) => {
      const session = {
        id: randomUUID(),
        createdAt: new Date(),
        lastUsedAt: new Date(),
        ...data,
      };
      this.sessions.push(session);
      return session;
    };
    this.session.findUnique = async ({ where }: any) => {
      const session = this.sessions.find((candidate) => candidate.tokenHash === where.tokenHash);
      if (!session) return null;
      return {
        ...session,
        userProfile: this.profiles.find((profile) => profile.id === session.userProfileId),
      };
    };
    this.session.update = async ({ where, data }: any) => {
      const session = this.sessions.find((candidate) => candidate.id === where.id);
      Object.assign(session, data);
      return session;
    };
    this.session.deleteMany = async ({ where }: any) => {
      const before = this.sessions.length;
      this.sessions = this.sessions.filter((session) => {
        if (where.tokenHash) return session.tokenHash !== where.tokenHash;
        if (where.userProfileId) return session.userProfileId !== where.userProfileId;
        if (where.expiresAt?.lte) return session.expiresAt > where.expiresAt.lte;
        return true;
      });
      return { count: before - this.sessions.length };
    };
  }
}

class FakeKeycloakAdmin {
  async createUser(input: { email: string }): Promise<string> {
    return `managed-${input.email}`;
  }

  async deleteUser(_userId: string): Promise<void> {}

  async updateUser(userId: string, _input: unknown): Promise<any> {
    return {
      user: { id: userId, enabled: true },
      applicationRole: UserRole.USER,
    };
  }

  async setEnabled(userId: string, enabled: boolean): Promise<any> {
    return {
      user: { id: userId, enabled: !enabled },
      applicationRole: UserRole.USER,
    };
  }

  async restoreUser(_state: unknown): Promise<void> {}
}

interface FakeIdentity {
  subject: string;
  email: string;
  name: string;
  roles: string[];
}

const adminIdentity: FakeIdentity = {
  subject: 'keycloak-admin-subject',
  email: 'admin@appstart.local',
  name: 'Administrador AppStart',
  roles: ['admin'],
};

const userIdentity: FakeIdentity = {
  subject: 'keycloak-user-subject',
  email: 'user@appstart.local',
  name: 'Usuário AppStart',
  roles: ['user'],
};

class FakeOidcProvider {
  private server?: Server;
  private readonly keyPair = generateKeyPairSync('rsa', { modulusLength: 2048 });
  private readonly codes = new Map<string, { nonce: string; challenge: string; identity: FakeIdentity }>();
  origin = '';
  issuer = '';
  clientId = 'appstart-server';

  async start(): Promise<void> {
    const publicJwk = await exportJWK(this.keyPair.publicKey);
    Object.assign(publicJwk, { kid: 'test-key', use: 'sig', alg: 'RS256' });

    this.server = createServer(async (req, res) => {
      const url = new URL(req.url ?? '/', this.origin || 'http://localhost');
      res.setHeader('content-type', 'application/json');

      if (url.pathname.endsWith('/.well-known/openid-configuration')) {
        res.end(JSON.stringify({
          issuer: this.issuer,
          authorization_endpoint: `${this.issuer}/protocol/openid-connect/auth`,
          token_endpoint: `${this.issuer}/protocol/openid-connect/token`,
          jwks_uri: `${this.issuer}/protocol/openid-connect/certs`,
          end_session_endpoint: `${this.issuer}/protocol/openid-connect/logout`,
        }));
        return;
      }
      if (url.pathname.endsWith('/protocol/openid-connect/certs')) {
        res.end(JSON.stringify({ keys: [publicJwk] }));
        return;
      }
      if (url.pathname.endsWith('/protocol/openid-connect/token') && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) body += chunk;
        const params = new URLSearchParams(body);
        const code = params.get('code') ?? '';
        const pending = this.codes.get(code);
        const verifier = params.get('code_verifier') ?? '';
        const challenge = createHash('sha256').update(verifier).digest('base64url');
        if (!pending || challenge !== pending.challenge || params.get('client_secret') !== 'test-secret') {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: 'invalid_grant' }));
          return;
        }
        this.codes.delete(code);
        const idToken = await new SignJWT({
          email: pending.identity.email,
          name: pending.identity.name,
          nonce: pending.nonce,
          realm_access: { roles: pending.identity.roles },
        })
          .setProtectedHeader({ alg: 'RS256', kid: 'test-key' })
          .setIssuer(this.issuer)
          .setAudience(this.clientId)
          .setSubject(pending.identity.subject)
          .setIssuedAt()
          .setExpirationTime('5m')
          .sign(this.keyPair.privateKey);
        res.end(JSON.stringify({ access_token: 'must-not-leak', refresh_token: 'must-not-leak', id_token: idToken }));
        return;
      }
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'not_found' }));
    });

    await new Promise<void>((resolve) => this.server!.listen(0, '127.0.0.1', resolve));
    const address = this.server.address();
    if (!address || typeof address === 'string') throw new Error('OIDC test server did not start');
    this.origin = `http://127.0.0.1:${address.port}`;
    this.issuer = `${this.origin}/realms/appstart`;
  }

  issueCode(authorizationLocation: string, identity: FakeIdentity = adminIdentity): { code: string; state: string } {
    const authorization = new URL(authorizationLocation);
    expect(authorization.searchParams.get('code_challenge_method')).toBe('S256');
    expect(authorization.searchParams.get('redirect_uri')).toBe('http://localhost:3000/api/v1/auth/callback');
    const code = randomUUID();
    this.codes.set(code, {
      nonce: authorization.searchParams.get('nonce')!,
      challenge: authorization.searchParams.get('code_challenge')!,
      identity,
    });
    return { code, state: authorization.searchParams.get('state')! };
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve, reject) => this.server?.close((error) => error ? reject(error) : resolve()));
  }
}

describe('Keycloak BFF authentication (e2e)', () => {
  const provider = new FakeOidcProvider();
  const database = new InMemoryPrisma();
  let app: any;
  let agent: ReturnType<typeof request.agent>;
  let config: AuthConfig;

  beforeAll(async () => {
    await provider.start();
    config = createAuthConfig({
      NODE_ENV: 'test',
      API_PORT: '3000',
      WEB_PORT: '5173',
      API_BASE_URL: 'http://localhost:3000',
      WEB_BASE_URL: 'http://localhost:5173',
      KEYCLOAK_BASE_URL: provider.origin,
      KEYCLOAK_REALM: 'appstart',
      KEYCLOAK_CLIENT_ID: provider.clientId,
      KEYCLOAK_CLIENT_SECRET: 'test-secret',
      KEYCLOAK_ADMIN_CLIENT_ID: 'appstart-admin',
      KEYCLOAK_ADMIN_CLIENT_SECRET: 'test-admin-secret',
      SESSION_TTL_HOURS: '24',
      SESSION_COOKIE_NAME: 'appstart_session',
      OIDC_CORRELATION_TTL_SECONDS: '300',
      SESSION_CLEANUP_INTERVAL_MINUTES: '60',
    });

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(AUTH_CONFIG)
      .useValue(config)
      .overrideProvider(PrismaService)
      .useValue(database)
      .compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    agent = request.agent(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
    await provider.stop();
  });

  async function login(
    targetAgent: ReturnType<typeof request.agent> = agent,
    identity: FakeIdentity = adminIdentity,
  ): Promise<void> {
    const start = await targetAgent.get('/api/v1/auth/login').query({ returnTo: '/tasks?filter=open' }).expect(302);
    const { code, state } = provider.issueCode(start.headers.location, identity);
    const callback = await targetAgent
      .get('/api/v1/auth/callback')
      .query({ code, state })
      .expect(303);
    expect(callback.headers.location).toBe('http://localhost:5173/tasks?filter=open');
    const sessionCookie = callback.headers['set-cookie'].find((value: string) => value.startsWith('appstart_session='));
    expect(sessionCookie).toContain('HttpOnly');
    expect(sessionCookie).toContain('SameSite=Lax');
    expect(sessionCookie).not.toContain('must-not-leak');
  }

  it('completes OIDC login, stores only a local token hash, and returns the safe profile', async () => {
    await login();

    expect(database.profiles).toHaveLength(1);
    expect(database.profiles[0]).toMatchObject({
      keycloakUserId: 'keycloak-admin-subject',
      email: 'admin@appstart.local',
      roleSnapshot: UserRole.ADMIN,
    });
    expect(database.sessions).toHaveLength(1);
    expect(database.sessions[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(database)).not.toContain('must-not-leak');

    const me = await agent.get('/api/v1/auth/me').expect(200);
    expect(me.body).toEqual({
      user: expect.objectContaining({
        name: 'Administrador AppStart',
        email: 'admin@appstart.local',
        role: 'ADMIN',
      }),
    });
    expect(me.body.user).not.toHaveProperty('keycloakUserId');
  });

  it('rejects a mismatched state and clears correlation state', async () => {
    const start = await agent.get('/api/v1/auth/login').expect(302);
    const { code } = provider.issueCode(start.headers.location);
    const response = await agent
      .get('/api/v1/auth/callback')
      .query({ code, state: 'forged-state' })
      .expect(401);
    expect(response.headers['set-cookie'].join(';')).toContain('appstart_session_oidc=;');
  });

  it('redirects account management to Keycloak', async () => {
    await agent.get('/api/v1/auth/account').expect(302).expect('location', `${provider.issuer}/account`);
  });

  it('revokes every local session through logout-all', async () => {
    await login();
    expect(database.sessions.length).toBeGreaterThan(1);
    await agent
      .post('/api/v1/auth/logout-all')
      .set('Origin', 'http://localhost:5173')
      .expect(204);
    expect(database.sessions).toHaveLength(0);
    await agent.get('/api/v1/auth/me').expect(401);
  });

  it('revokes the current session before federated logout', async () => {
    await login();
    const storedHash = database.sessions.at(-1)!.tokenHash;
    const response = await agent
      .post('/api/v1/auth/logout')
      .set('Origin', 'http://localhost:5173')
      .expect(303);
    expect(response.headers.location).toContain('/protocol/openid-connect/logout');
    expect(database.sessions.some((session) => session.tokenHash === storedHash)).toBe(false);
    expect(response.headers['set-cookie'].join(';')).toContain('appstart_session=;');
  });

  it('returns 401 without a session and keeps explicitly public endpoints available', async () => {
    await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    await request(app.getHttpServer()).get('/api/v1/admin/access-check').expect(401);
    await request(app.getHttpServer()).get('/api/v1/health/live').expect(200);
    await request(app.getHttpServer()).get('/api/v1/auth/login').expect(302);
  });

  it('returns 403 for USER and allows ADMIN on an administrative endpoint', async () => {
    const regularUser = request.agent(app.getHttpServer());
    await login(regularUser, userIdentity);
    const denied = await regularUser.get('/api/v1/admin/access-check').expect(403);
    expect(denied.body.statusCode).toBe(403);

    const administrator = request.agent(app.getHttpServer());
    await login(administrator, adminIdentity);
    const allowed = await administrator.get('/api/v1/admin/access-check').expect(200);
    expect(allowed.body).toEqual({ allowed: true, userId: expect.any(String) });
  });

  it('does not persist a raw session token', () => {
    const token = 'raw-session-token';
    expect(hashSessionToken(token)).not.toBe(token);
    expect(JSON.stringify(database.sessions)).not.toContain(token);
  });
});
