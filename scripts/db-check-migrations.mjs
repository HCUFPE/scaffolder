import { spawnSync } from 'node:child_process';
import path from 'node:path';

const rootDir = process.cwd();
const apiDir = path.join(rootDir, 'apps', 'api');
const schemaPath = path.join(apiDir, 'prisma', 'schema.prisma');
const migrationsPath = path.join(apiDir, 'prisma', 'migrations');
const shadowDatabaseUrl = process.env.SHADOW_DATABASE_URL;

if (!shadowDatabaseUrl) {
  console.error([
    'SHADOW_DATABASE_URL é obrigatória para validar migrations.',
    'Use um banco PostgreSQL temporário e exclusivo, cujo nome termine com `_shadow`.',
    'Nunca aponte esta variável para um banco com dados reais.'
  ].join('\n'));
  process.exit(1);
}

let shadowUrl;
try {
  shadowUrl = new URL(shadowDatabaseUrl);
} catch {
  console.error('SHADOW_DATABASE_URL deve ser uma URL PostgreSQL válida.');
  process.exit(1);
}

const databaseName = decodeURIComponent(shadowUrl.pathname.replace(/^\//, ''));
if (!['postgres:', 'postgresql:'].includes(shadowUrl.protocol) || !databaseName.endsWith('_shadow')) {
  console.error('SHADOW_DATABASE_URL deve apontar para um banco PostgreSQL exclusivo cujo nome termine com `_shadow`.');
  process.exit(1);
}

const env = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL || shadowDatabaseUrl,
};

function runPrisma(args) {
  return spawnSync('pnpm', ['--dir', apiDir, 'exec', 'prisma', ...args], {
    cwd: rootDir,
    env,
    encoding: 'utf8',
  });
}

const validation = runPrisma(['validate', '--schema', schemaPath]);
process.stdout.write(validation.stdout ?? '');
process.stderr.write(validation.stderr ?? '');
if (validation.status !== 0) process.exit(validation.status ?? 1);

const diff = runPrisma([
  'migrate',
  'diff',
  '--from-migrations', migrationsPath,
  '--to-schema-datamodel', schemaPath,
  '--shadow-database-url', shadowDatabaseUrl,
  '--exit-code',
]);
process.stdout.write(diff.stdout ?? '');
process.stderr.write(diff.stderr ?? '');

if (diff.status === 2) {
  console.error([
    'O schema Prisma não corresponde às migrations versionadas.',
    'Gere e versione uma migration para a alteração estrutural antes de enviar a mudança.'
  ].join('\n'));
  process.exit(1);
}
if (diff.status !== 0) process.exit(diff.status ?? 1);

console.log('Schema Prisma e migrations estão sincronizados.');
