import { execFileSync } from 'node:child_process';
import { validateEnv } from './lib/env.mjs';
import { runStep } from './lib/process.mjs';

function ensureDockerAvailable() {
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
  } catch {
    throw new Error([
      'Docker não está disponível.',
      'Verifique se o Docker Desktop/daemon está em execução e se sua conta possui permissão para usar Docker.',
      'Depois tente novamente: pnpm db:up'
    ].join('\n'));
  }
}

try {
  validateEnv();
  ensureDockerAvailable();
  await runStep('Subindo PostgreSQL com Docker Compose', 'docker', ['compose', 'up', '-d', '--wait', 'postgres']);
  console.log('PostgreSQL pronto para uso.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
