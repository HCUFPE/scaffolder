import { execFileSync } from 'node:child_process';

function getPnpmVersion() {
  const userAgent = process.env.npm_config_user_agent ?? '';
  const match = userAgent.match(/pnpm\/(\d+\.\d+\.\d+)/);
  if (match) return match[1];

  try {
    return execFileSync('pnpm', ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    throw new Error('pnpm não foi encontrado. Execute `corepack enable` e instale a versão suportada do pnpm.');
  }
}

export function validateRuntime() {
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 24) {
    throw new Error(`Versão incompatível do Node.js: ${process.versions.node}. Use Node.js >= 24.x.`);
  }

  const pnpmVersion = getPnpmVersion();
  const pnpmMajor = Number(pnpmVersion.split('.')[0]);
  if (pnpmMajor !== 9) {
    throw new Error(`Versão incompatível do pnpm: ${pnpmVersion}. Use pnpm 9.x.`);
  }

  return { node: process.versions.node, pnpm: pnpmVersion };
}
