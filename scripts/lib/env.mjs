import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_KEYS = [
  'NODE_ENV',
  'API_PORT',
  'API_BASE_URL',
  'WEB_PORT',
  'WEB_BASE_URL',
  'POSTGRES_DB',
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_PORT',
  'KEYCLOAK_DB_NAME',
  'KEYCLOAK_PORT',
  'KEYCLOAK_BASE_URL',
  'KEYCLOAK_REALM',
  'KEYCLOAK_CLIENT_ID',
  'KEYCLOAK_CLIENT_SECRET',
  'KEYCLOAK_ADMIN_CLIENT_ID',
  'KEYCLOAK_ADMIN_CLIENT_SECRET',
  'KEYCLOAK_ADMIN_USER',
  'KEYCLOAK_ADMIN_PASSWORD',
  'KEYCLOAK_PASSWORD_MIN_LENGTH',
  'DATABASE_URL',
  'SESSION_TTL_HOURS',
  'SESSION_COOKIE_NAME',
  'OIDC_CORRELATION_TTL_SECONDS',
  'SESSION_CLEANUP_INTERVAL_MINUTES',
  'DEV_ADMIN_EMAIL',
  'DEV_ADMIN_PASSWORD',
  'DEV_ADMIN_NAME',
  'DEV_USER_EMAIL',
  'DEV_USER_PASSWORD',
  'DEV_USER_NAME'
];

export const rootDir = process.cwd();
export const envPath = path.join(rootDir, '.env');

export function parseEnvFile(filePath = envPath) {
  if (!fs.existsSync(filePath)) {
    throw new Error([
      'Arquivo .env não encontrado.',
      'Copie .env.example para .env antes de continuar.',
      'Exemplo: cp .env.example .env'
    ].join('\n'));
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

export function loadEnv() {
  const env = parseEnvFile();
  for (const [key, value] of Object.entries(env)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
  return process.env;
}

export function validateEnv() {
  const env = loadEnv();
  const missing = REQUIRED_KEYS.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error([
      'Variáveis obrigatórias ausentes no .env:',
      ...missing.map((key) => `- ${key}`),
      '',
      'Revise .env.example e preencha os valores necessários.'
    ].join('\n'));
  }

  for (const key of ['API_PORT', 'WEB_PORT', 'POSTGRES_PORT', 'KEYCLOAK_PORT']) {
    const value = Number(env[key]);
    if (!Number.isInteger(value) || value <= 0 || value > 65535) {
      throw new Error(`Valor inválido para ${key}: ${env[key]}. Informe uma porta entre 1 e 65535.`);
    }
  }

  const passwordMinLength = Number(env.KEYCLOAK_PASSWORD_MIN_LENGTH);
  if (!Number.isInteger(passwordMinLength) || passwordMinLength < 8 || passwordMinLength > 128) {
    throw new Error('KEYCLOAK_PASSWORD_MIN_LENGTH deve ser um inteiro entre 8 e 128.');
  }

  for (const key of ['POSTGRES_DB', 'POSTGRES_USER', 'KEYCLOAK_DB_NAME']) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(env[key])) {
      throw new Error(`Valor inválido para ${key}: ${env[key]}. Use apenas letras, números e underscore.`);
    }
  }

  for (const key of ['KEYCLOAK_REALM', 'KEYCLOAK_CLIENT_ID', 'KEYCLOAK_ADMIN_CLIENT_ID']) {
    if (!/^[a-zA-Z0-9._-]+$/.test(env[key])) {
      throw new Error(`Valor inválido para ${key}: ${env[key]}. Use apenas letras, números, ponto, hífen e underscore.`);
    }
  }

  for (const key of ['API_BASE_URL', 'WEB_BASE_URL', 'KEYCLOAK_BASE_URL']) {
    try {
      const url = new URL(env[key]);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('scheme');
      }
      if (env.NODE_ENV === 'production' && url.protocol !== 'https:') {
        throw new Error('https');
      }
    } catch {
      throw new Error(`Valor inválido para ${key}: ${env[key]}. Informe uma URL HTTP(S)${env.NODE_ENV === 'production' ? ' com HTTPS' : ''}.`);
    }
  }

  const sessionTtlHours = Number(env.SESSION_TTL_HOURS);
  if (!Number.isInteger(sessionTtlHours) || sessionTtlHours < 1 || sessionTtlHours > 8760) {
    throw new Error('SESSION_TTL_HOURS deve ser um inteiro entre 1 e 8760.');
  }

  const correlationTtl = Number(env.OIDC_CORRELATION_TTL_SECONDS);
  if (!Number.isInteger(correlationTtl) || correlationTtl < 60 || correlationTtl > 900) {
    throw new Error('OIDC_CORRELATION_TTL_SECONDS deve ser um inteiro entre 60 e 900.');
  }

  const cleanupInterval = Number(env.SESSION_CLEANUP_INTERVAL_MINUTES);
  if (!Number.isInteger(cleanupInterval) || cleanupInterval < 1 || cleanupInterval > 1440) {
    throw new Error('SESSION_CLEANUP_INTERVAL_MINUTES deve ser um inteiro entre 1 e 1440.');
  }

  return env;
}
