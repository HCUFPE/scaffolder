## Why

O template depende de um banco próximo de produção e de um fluxo consistente de evolução de schema. Sem requisitos claros para PostgreSQL, migrations e seed, a base fica frágil e difícil de operar em desenvolvimento e produção.

## What Changes

- Definir o PostgreSQL de desenvolvimento como serviço padrão via Compose.
- Formalizar volume persistente, configuração por variáveis de ambiente e health check.
- Padronizar o fluxo Prisma para migrations de desenvolvimento e deploy em produção.
- Tornar o seed idempotente para dados estruturais da aplicação, mantendo identidades e credenciais de desenvolvimento no provisionamento do Keycloak.
- Documentar reset destrutivo apenas para desenvolvimento.

## Capabilities

### New Capabilities
- `development-postgres`: provisionamento e operação do PostgreSQL local para desenvolvimento.
- `prisma-migrations-and-seed`: fluxo de migrations, seed e deploy do schema com Prisma.

### Modified Capabilities

## Impact

- `compose.yaml`.
- Configuração Prisma.
- Scripts de banco e release.
- Seed de desenvolvimento.
