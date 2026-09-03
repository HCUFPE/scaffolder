import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const rootDir = resolve(import.meta.dirname, '..');

function getDirectorySnapshots(dir) {
  const snapshots = new Map();
  if (!existsSync(dir)) return snapshots;

  function scan(current) {
    const entries = readdirSync(current);
    for (const entry of entries) {
      const fullPath = join(current, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scan(fullPath);
      } else if (stat.isFile()) {
        const content = readFileSync(fullPath);
        const hash = createHash('sha256').update(content).digest('hex');
        snapshots.set(fullPath, hash);
      }
    }
  }

  scan(dir);
  return snapshots;
}

function getFileHash(filePath) {
  if (!existsSync(filePath)) return null;
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

console.log('[api:check] Coletando estado atual dos contratos e cliente gerado...');
const openapiPath = resolve(rootDir, 'openapi.json');
const clientDir = resolve(rootDir, 'apps/web/src/lib/api-client');

const initialOpenApiHash = getFileHash(openapiPath);
const initialClientSnapshots = getDirectorySnapshots(clientDir);

console.log('[api:check] Executando geração do contrato e cliente...');
execSync('node scripts/generate-api.mjs', { stdio: 'inherit', cwd: rootDir });

const newOpenApiHash = getFileHash(openapiPath);
const newClientSnapshots = getDirectorySnapshots(clientDir);

const differences = [];

if (initialOpenApiHash !== newOpenApiHash) {
  differences.push('openapi.json (especificação OpenAPI desatualizada)');
}

for (const [file, hash] of newClientSnapshots) {
  if (initialClientSnapshots.get(file) !== hash) {
    differences.push(`${file} (alterado ou novo)`);
  }
}

for (const [file] of initialClientSnapshots) {
  if (!newClientSnapshots.has(file)) {
    differences.push(`${file} (removido)`);
  }
}

if (differences.length > 0) {
  console.error('\n❌ [api:check] FALHA: Foi detectada divergência entre a API e o cliente gerado:');
  for (const diff of differences) {
    console.error(` - ${diff}`);
  }
  console.error('\nExecute `pnpm api:generate` localmente e comite as alterações antes de enviar para a CI.\n');
  process.exit(1);
}

console.log('\n✓ [api:check] SUCESSO: Contrato OpenAPI e cliente gerado estão 100% sincronizados!\n');
