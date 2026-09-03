import { execFileSync } from 'node:child_process';
import { runStep } from './lib/process.mjs';

function ensureDockerAvailable() {
  try {
    execFileSync('docker', ['info'], { stdio: 'ignore' });
  } catch {
    throw new Error('Docker não está disponível. Inicie o Docker e tente novamente.');
  }
}

try {
  ensureDockerAvailable();
  await runStep('Parando Keycloak sem remover dados', 'docker', ['compose', 'stop', 'keycloak']);
  console.log('Keycloak parado.');
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
