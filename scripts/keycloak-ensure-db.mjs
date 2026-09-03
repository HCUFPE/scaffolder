import { execFileSync } from 'node:child_process';
import { validateEnv } from './lib/env.mjs';

function runPsql(env, sql) {
  return execFileSync(
    'docker',
    [
      'compose', 'exec', '-T', 'postgres',
      'psql',
      '--username', env.POSTGRES_USER,
      '--dbname', env.POSTGRES_DB,
      '--tuples-only',
      '--no-align',
      '--command', sql
    ],
    { encoding: 'utf8' }
  ).trim();
}

try {
  const env = validateEnv();
  const exists = runPsql(
    env,
    `SELECT 1 FROM pg_database WHERE datname = '${env.KEYCLOAK_DB_NAME}'`
  );

  if (exists === '1') {
    console.log(`Banco do Keycloak já existe: ${env.KEYCLOAK_DB_NAME}`);
  } else {
    runPsql(env, `CREATE DATABASE "${env.KEYCLOAK_DB_NAME}"`);
    console.log(`Banco do Keycloak criado: ${env.KEYCLOAK_DB_NAME}`);
  }
} catch (error) {
  console.error([
    'Não foi possível preparar o banco do Keycloak.',
    error.message
  ].join('\n'));
  process.exit(1);
}
