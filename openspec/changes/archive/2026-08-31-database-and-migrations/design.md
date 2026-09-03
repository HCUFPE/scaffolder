## Context

O banco é um componente central do AppStart e precisa refletir uma experiência próxima de produção. O fluxo de schema também deve ser rastreável, reprodutível e seguro para deploy.

## Goals / Non-Goals

**Goals:**
- Provisionar PostgreSQL por Compose com persistência.
- Permitir configuração por variáveis ambientais.
- Exigir migration versionada para toda mudança estrutural.
- Garantir seed idempotente para dados estruturais sem duplicar o provisionamento de identidades do Keycloak.
- Usar `prisma migrate deploy` em produção.

**Non-Goals:**
- Alternar automaticamente entre PostgreSQL e SQLite.
- Executar reset destrutivo em produção.

## Decisions

- Fixar PostgreSQL como banco padrão do template.
- Usar volume nomeado para persistência local.
- Separar claramente migrations de desenvolvimento e deploy de produção.
- Tornar o seed reexecutável sem duplicação de registros estruturais.
- Manter usuários, roles e credenciais de desenvolvimento no import/provisionamento do Keycloak; o seed Prisma não armazena senhas nem cria uma identidade local paralela.

## Risks / Trade-offs

- **Migrations inconsistentes** → Validar mudanças de schema na CI.
- **Seed não idempotente** → Tratar criação/atualização por chave única.
- **Diferenças entre dev e produção** → Reutilizar o mesmo provedor e comando de deploy do Prisma.
