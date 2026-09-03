import { validateEnv } from './lib/env.mjs';
import { runStep } from './lib/process.mjs';

try {
  validateEnv();
  await runStep('Executando seed de desenvolvimento', 'pnpm', ['--dir', 'apps/api', 'exec', 'node', 'prisma/seed.mjs']);
  console.log('Seed concluído.');
} catch (error) {
  console.error([
    'Falha ao executar seed.',
    error.message,
    'Verifique se o banco está saudável e se as migrations foram aplicadas.'
  ].join('\n'));
  process.exit(1);
}
