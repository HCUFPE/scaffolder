import { execFileSync } from 'node:child_process';
import { validateEnv } from './lib/env.mjs';
import { runCommand, runStep } from './lib/process.mjs';

function ensureDockerAvailable() {
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
  } catch {
    throw new Error([
      'Docker não está disponível.',
      'Verifique se o Docker Desktop/daemon está em execução e se sua conta possui permissão para usar Docker.',
      'Depois tente novamente: pnpm auth:up'
    ].join('\n'));
  }
}

try {
  validateEnv();
  ensureDockerAvailable();

  await runCommand('node', ['scripts/keycloak-render-realm.mjs']);
  await runStep('Garantindo PostgreSQL disponível', 'docker', ['compose', 'up', '-d', '--wait', 'postgres']);
  await runCommand('node', ['scripts/keycloak-ensure-db.mjs']);
  await runStep('Subindo Keycloak com Docker Compose', 'docker', ['compose', 'up', '-d', 'keycloak']);
  await runCommand('node', ['scripts/keycloak-wait.mjs']);

  console.log('Keycloak pronto para uso.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
