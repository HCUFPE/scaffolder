export const AUTH_CONFIG = Symbol('AUTH_CONFIG');

export interface AuthConfig {
  nodeEnv: 'development' | 'test' | 'production';
  apiPort: number;
  apiBaseUrl: string;
  webBaseUrl: string;
  keycloakBaseUrl: string;
  realm: string;
  issuer: string;
  clientId: string;
  clientSecret: string;
  adminClientId: string;
  adminClientSecret: string;
  callbackUrl: string;
  sessionCookieName: string;
  correlationCookieName: string;
  sessionTtlMs: number;
  correlationTtlMs: number;
  cleanupIntervalMs: number;
  secureCookies: boolean;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name]?.trim();
  if (!value) throw new Error(`Variável obrigatória ausente: ${name}.`);
  return value;
}

function integer(value: string, name: string, minimum: number, maximum: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} deve ser um inteiro entre ${minimum} e ${maximum}.`);
  }
  return parsed;
}

function baseUrl(value: string, name: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${name} deve ser uma URL válida.`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error(`${name} deve ser uma URL HTTP(S) sem credenciais.`);
  }
  parsed.pathname = parsed.pathname.replace(/\/$/, '');
  parsed.search = '';
  parsed.hash = '';
  return parsed.toString().replace(/\/$/, '');
}

export function createAuthConfig(env: NodeJS.ProcessEnv = process.env): AuthConfig {
  const nodeEnvValue = env.NODE_ENV ?? 'development';
  if (!['development', 'test', 'production'].includes(nodeEnvValue)) {
    throw new Error('NODE_ENV deve ser development, test ou production.');
  }
  const nodeEnv = nodeEnvValue as AuthConfig['nodeEnv'];
  const apiPort = integer(required(env, 'API_PORT'), 'API_PORT', 1, 65_535);
  const webPort = integer(required(env, 'WEB_PORT'), 'WEB_PORT', 1, 65_535);
  const keycloakBaseUrl = baseUrl(required(env, 'KEYCLOAK_BASE_URL'), 'KEYCLOAK_BASE_URL');
  const apiBase = baseUrl(env.API_BASE_URL ?? `http://localhost:${apiPort}`, 'API_BASE_URL');
  const webBase = baseUrl(env.WEB_BASE_URL ?? `http://localhost:${webPort}`, 'WEB_BASE_URL');
  const realm = required(env, 'KEYCLOAK_REALM');
  const clientId = required(env, 'KEYCLOAK_CLIENT_ID');
  const clientSecret = required(env, 'KEYCLOAK_CLIENT_SECRET');
  const adminClientId = required(env, 'KEYCLOAK_ADMIN_CLIENT_ID');
  const adminClientSecret = required(env, 'KEYCLOAK_ADMIN_CLIENT_SECRET');
  const sessionCookieName = required(env, 'SESSION_COOKIE_NAME');

  if (!/^[a-zA-Z0-9._-]+$/.test(realm)) throw new Error('KEYCLOAK_REALM contém caracteres inválidos.');
  if (!/^[a-zA-Z0-9._-]+$/.test(clientId)) throw new Error('KEYCLOAK_CLIENT_ID contém caracteres inválidos.');
  if (!/^[a-zA-Z0-9._-]+$/.test(adminClientId)) throw new Error('KEYCLOAK_ADMIN_CLIENT_ID contém caracteres inválidos.');
  if (!/^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/.test(sessionCookieName)) {
    throw new Error('SESSION_COOKIE_NAME não é um nome de cookie válido.');
  }

  const sessionTtlHours = integer(required(env, 'SESSION_TTL_HOURS'), 'SESSION_TTL_HOURS', 1, 24 * 365);
  const correlationTtlSeconds = integer(env.OIDC_CORRELATION_TTL_SECONDS ?? '300', 'OIDC_CORRELATION_TTL_SECONDS', 60, 900);
  const cleanupIntervalMinutes = integer(env.SESSION_CLEANUP_INTERVAL_MINUTES ?? '60', 'SESSION_CLEANUP_INTERVAL_MINUTES', 1, 24 * 60);

  if (nodeEnv === 'production') {
    for (const [name, value] of [['API_BASE_URL', apiBase], ['WEB_BASE_URL', webBase], ['KEYCLOAK_BASE_URL', keycloakBaseUrl]] as const) {
      if (new URL(value).protocol !== 'https:') throw new Error(`${name} deve usar HTTPS em produção.`);
    }
  }

  const issuer = `${keycloakBaseUrl}/realms/${encodeURIComponent(realm)}`;
  return {
    nodeEnv,
    apiPort,
    apiBaseUrl: apiBase,
    webBaseUrl: webBase,
    keycloakBaseUrl,
    realm,
    issuer,
    clientId,
    clientSecret,
    adminClientId,
    adminClientSecret,
    callbackUrl: `${apiBase}/api/v1/auth/callback`,
    sessionCookieName,
    correlationCookieName: `${sessionCookieName}_oidc`,
    sessionTtlMs: sessionTtlHours * 60 * 60 * 1000,
    correlationTtlMs: correlationTtlSeconds * 1000,
    cleanupIntervalMs: cleanupIntervalMinutes * 60 * 1000,
    secureCookies: nodeEnv === 'production',
  };
}
