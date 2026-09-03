import { validateEnv } from './lib/env.mjs';
import { runStep } from './lib/process.mjs';

try {
  validateEnv();
  await runStep('Aplicando migrations Prisma', 'pnpm', ['--dir', 'apps/api', 'exec', 'prisma', 'migrate', 'deploy', '--schema', 'prisma/schema.prisma']);
  console.log('Migrations aplicadas.');
} catch (error) {
  console.error([
    'Falha ao aplicar migrations.',
    error.message,
    'Confirme se `pnpm install` foi executado e se o banco está disponível.'
  ].join('\n'));
  process.exit(1);
}
