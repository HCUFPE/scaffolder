## Why

O projeto precisa de uma experiência inicial consistente e reproduzível para reduzir o tempo gasto com configuração manual e permitir que alunos e mantenedores iniciem o ambiente com poucos comandos. Sem isso, a base perde seu valor pedagógico e operacional.

## What Changes

- Definir requisitos verificáveis para versões suportadas de runtime e package manager.
- Padronizar o fluxo de bootstrap com `.env.example`, `pnpm setup` e `pnpm dev`.
- Formalizar scripts para subir, parar e inspecionar o banco durante o desenvolvimento.
- Documentar diagnósticos mínimos para falhas comuns de ambiente, portas e Docker.
- Cobrir compatibilidade básica entre Linux, macOS e Windows/WSL2.

## Capabilities

### New Capabilities
- `developer-setup`: fluxo de instalação, validação de ambiente e scripts iniciais para desenvolvimento local.
- `developer-database-operations`: comandos operacionais de banco para uso local durante setup e desenvolvimento.

### Modified Capabilities

## Impact

- Scripts de raiz do monorepo.
- Documentação de onboarding e troubleshooting.
- Compose e integração local com PostgreSQL.
- Fluxo de execução de API e frontend em modo desenvolvimento.
