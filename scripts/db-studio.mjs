import { validateEnv } from './lib/env.mjs';
import { runStep } from './lib/process.mjs';

try {
  validateEnv();
  await runStep('Abrindo Prisma Studio', 'pnpm', ['--dir', 'apps/api', 'exec', 'prisma', 'studio', '--schema', 'prisma/schema.prisma']);
} catch (error) {
  console.error([
    'Falha ao abrir Prisma Studio.',
    error.message,
    'Confirme se `pnpm install` foi executado antes de usar este comando.'
  ].join('\n'));
  process.exit(1);
}
