import { spawn } from 'node:child_process';
import { validateRuntime } from './lib/runtime.mjs';
import { validateEnv } from './lib/env.mjs';
import { checkPortAvailable } from './lib/ports.mjs';

const children = [];

function stopChildren() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  }
}

try {
  validateRuntime();
  const env = validateEnv();

  await checkPortAvailable(Number(env.API_PORT), 'API');
  await checkPortAvailable(Number(env.WEB_PORT), 'frontend');

  const startPnpmScript = (scriptName) => {
    const args = ['run', scriptName];
    const options = { stdio: 'inherit', env: process.env };
    if (process.platform === 'win32') {
      // On Windows pnpm is a .cmd shim; start its fixed project command via cmd.exe.
      return spawn(`pnpm ${args.join(' ')}`, { ...options, shell: true });
    }
    return spawn('pnpm', args, options);
  };

  const api = startPnpmScript('api:dev');
  const web = startPnpmScript('web:dev');
  children.push(api, web);

  for (const child of children) {
    child.on('exit', (code) => {
      if (code && code !== 0) {
        stopChildren();
        process.exit(code);
      }
    });
  }

  process.on('SIGINT', () => {
    stopChildren();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    stopChildren();
    process.exit(0);
  });
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
