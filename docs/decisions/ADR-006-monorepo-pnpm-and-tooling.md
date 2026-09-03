# ADR-006: Estrutura Monorepo com PNPM Workspaces, NestJS e Vite

## Status
Aceito

## Contexto
O template precisa fornecer tanto a API backend quanto a aplicação frontend em um único repositório para facilitar o ciclo de desenvolvimento, setup inicial e avaliação docente, mantendo clareza de fronteiras e compartilhamento de scripts.

## Decisão
Adotamos:
1. **PNPM Workspaces:** Gerenciador de pacotes rápido, com link simbólico estrito e economia de espaço em disco via *content-addressable store*.
2. **Workspaces Organizados:**
   - `apps/api`: Aplicação backend construída com **NestJS**, **Prisma ORM** e **Swagger**.
   - `apps/web`: Aplicação frontend construída com **React 19**, **Vite 8**, **Tailwind CSS** e **Lucide React**.
3. **Scripts Unificados na Raiz:**
   - `pnpm dev`, `pnpm setup`, `pnpm test`, `pnpm api:generate`, `pnpm api:check`, `pnpm docs:check`, `pnpm check:all`.

## Consequências
### Positivas
- **Comando Único de Instalação e Execução:** Com `pnpm setup` e `pnpm dev`, aluno sobe todo o ecossistema (PostgreSQL, Keycloak, Backend e Frontend).
- **Sem Divergência de Versões:** Tipos e contratos gerados pelo backend são consumidos diretamente pelo frontend sem publicação externa em NPM registries.

### Negativas / Mitigações
- Necessidade de instalar o `pnpm` globalmente, documentada e verificada pelo script de pré-requisitos (`pnpm check:runtime`).
