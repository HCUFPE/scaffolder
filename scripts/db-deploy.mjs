import { runStep } from './lib/process.mjs';

function validateProductionDatabaseUrl() {
  if (process.env.NODE_ENV !== 'production') {
    throw new Error('db:deploy exige NODE_ENV=production para evitar uso acidental no desenvolvimento.');
  }

  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL é obrigatória para aplicar migrations de produção.');

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL deve ser uma URL PostgreSQL válida.');
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL deve usar o protocolo postgresql:// ou postgres://.');
  }
}

try {
  validateProductionDatabaseUrl();
  await runStep('Aplicando migrations de produção com prisma migrate deploy', 'pnpm', [
    '--dir',
    'apps/api',
    'exec',
    'prisma',
    'migrate',
    'deploy',
    '--schema',
    'prisma/schema.prisma',
  ]);
  console.log('Migrations de produção aplicadas com sucesso.');
} catch (error) {
  console.error(['Falha no deploy das migrations.', error.message].join('\n'));
  process.exit(1);
}
