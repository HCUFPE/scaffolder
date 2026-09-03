import { spawn } from 'node:child_process';

export function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...options
    });

    child.on('error', (error) => reject(error));
    child.on('exit', (code, signal) => {
      if (code === 0) return resolve();
      reject(new Error(`${command} ${args.join(' ')} falhou com código ${code ?? 'null'}${signal ? ` (signal ${signal})` : ''}.`));
    });
  });
}

export async function runStep(label, command, args, options = {}) {
  console.log(`→ ${label}`);
  await runCommand(command, args, options);
}
