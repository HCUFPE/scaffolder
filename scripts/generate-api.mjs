import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');

console.log('[api:generate] 1/2 Construindo API e gerando openapi.json...');
execSync('pnpm --dir apps/api build', { stdio: 'inherit', cwd: rootDir });
execSync('node --env-file=.env apps/api/dist/generate-openapi.js', { stdio: 'inherit', cwd: rootDir });

console.log('[api:generate] 2/2 Gerando cliente TypeScript via Orval...');
execSync('npx orval --config orval.config.cjs', { stdio: 'inherit', cwd: rootDir });

console.log('[api:generate] ✓ Contrato OpenAPI e cliente TypeScript gerados com sucesso!');
