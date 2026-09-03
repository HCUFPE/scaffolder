## Why

A base full stack precisa entregar uma aplicação web utilizável desde o primeiro dia. Isso inclui login, shell autenticado, navegação protegida, feedback de interface e padrões mínimos de UX.

## What Changes

- Criar entrypoint de login por redirecionamento ao Keycloak e rotas privadas.
- Definir shell autenticado com navegação e menu do usuário.
- Integrar dados remotos com TanStack Query e formulários com React Hook Form + Zod.
- Tratar estados de carregamento, vazio, erro e sucesso.
- Adicionar tema claro/escuro, responsividade básica e elementos de contexto.

## Capabilities

### New Capabilities
- `authenticated-web-shell`: início do login federado, rotas privadas e estrutura principal da aplicação autenticada.
- `web-data-and-feedback-patterns`: padrões de carregamento, formulários, feedback e preferências de UI.

### Modified Capabilities

## Impact

- Rotas e layout do frontend.
- Estado autenticado e navegação.
- Biblioteca de formulários e query cache.
- Sistema de tema e componentes básicos de UX.
