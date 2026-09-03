import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();

console.log('[docs:check] Iniciando validação de integridade da documentação...');

const requiredDocs = [
  'README.md',
  'docs/architecture-overview.md',
  'docs/feature-development-guide.md',
  'docs/testing-strategy-guide.md',
  'docs/educator-guide.md',
  'docs/glossary-and-concepts.md',
  'docs/reference-module-guidance.md',
  'docs/observability-and-troubleshooting.md',
];

const requiredAdrs = [
  'docs/decisions/ADR-001-bff-keycloak-oidc.md',
  'docs/decisions/ADR-002-opaque-database-sessions.md',
  'docs/decisions/ADR-003-openapi-contract-and-orval-client.md',
  'docs/decisions/ADR-004-tanstack-query-and-zod-forms.md',
  'docs/decisions/ADR-005-soft-delete-and-ownership-policies.md',
  'docs/decisions/ADR-006-monorepo-pnpm-and-tooling.md',
];

const errors = [];

// 1. Validar existência dos arquivos obrigatórios
for (const file of [...requiredDocs, ...requiredAdrs]) {
  const fullPath = resolve(rootDir, file);
  if (!existsSync(fullPath)) {
    errors.push(`Arquivo de documentação obrigatório não encontrado: ${file}`);
  }
}

// 2. Validar que entidades do Prisma estão documentadas no architecture-overview
const prismaPath = resolve(rootDir, 'apps/api/prisma/schema.prisma');
const archPath = resolve(rootDir, 'docs/architecture-overview.md');

if (existsSync(prismaPath) && existsSync(archPath)) {
  const prismaContent = readFileSync(prismaPath, 'utf-8');
  const archContent = readFileSync(archPath, 'utf-8');

  const modelMatches = [...prismaContent.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]);
  for (const model of modelMatches) {
    if (!archContent.includes(model)) {
      errors.push(`Entidade do Prisma "${model}" não está documentada em docs/architecture-overview.md`);
    }
  }
}

// 3. Validar que rotas do OpenAPI estão documentadas no catálogo de endpoints
const openapiPath = resolve(rootDir, 'openapi.json');
if (existsSync(openapiPath) && existsSync(archPath)) {
  const openapi = JSON.parse(readFileSync(openapiPath, 'utf-8'));
  const archContent = readFileSync(archPath, 'utf-8');

  for (const path of Object.keys(openapi.paths || {})) {
    // normalizar paths com parâmetros (ex.: /api/v1/users/{id} -> /api/v1/users/:id)
    const normalized = path.replace(/{(\w+)}/g, ':$1');
    if (!archContent.includes(normalized) && !archContent.includes(path)) {
      errors.push(`Rota do OpenAPI "${path}" não está catalogada em docs/architecture-overview.md`);
    }
  }
}

// 4. Validar skills pedagógicas
const requiredSkills = [
  '.agent/skills/appstart-feature-tutor/SKILL.md',
  '.agent/skills/appstart-sync-docs/SKILL.md',
  '.agent/skills/appstart-architecture-review/SKILL.md',
];

for (const skill of requiredSkills) {
  const fullPath = resolve(rootDir, skill);
  if (!existsSync(fullPath)) {
    errors.push(`Skill obrigatória do template não encontrada: ${skill}`);
  }
}

if (errors.length > 0) {
  console.error('\n❌ [docs:check] Falhas encontradas na documentação:');
  for (const err of errors) {
    console.error(`  • ${err}`);
  }
  process.exit(1);
} else {
  console.log('✓ [docs:check] SUCESSO: Todos os guias, ADRs, rotas e modelos estão 100% íntegros e documentados!\n');
}
