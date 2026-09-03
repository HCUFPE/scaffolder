## Context

A aplicação web é a face do template para alunos e usuários finais. Ela precisa demonstrar um fluxo autenticado coerente e reutilizar padrões de fetch, formulários e feedback visual.

## Goals / Non-Goals

**Goals:**
- Iniciar o login federado pelo backend e proteger rotas com a sessão local.
- Fornecer shell autenticado com navegação consistente.
- Padronizar formulários e dados remotos.
- Cobrir estados de tela e feedback de ações.
- Oferecer tema claro/escuro e responsividade básica.

**Non-Goals:**
- Construir uma biblioteca de design enterprise completa.
- Implementar i18n total nesta fase.

## Decisions

- Proteger navegação consultando `/api/v1/auth/me` antes de renderizar conteúdo sensível.
- A página de login não coleta credenciais; ela inicia o fluxo em `/api/v1/auth/login` e deixa a autenticação a cargo do Keycloak.
- Usar TanStack Query para cache, invalidação e tratamento de 401.
- Usar React Hook Form e Zod nos formulários de referência.
- Centralizar consumo HTTP no cliente gerado.

## Risks / Trade-offs

- **Estados inconsistentes após expiração de sessão** → Limpar estado autenticado e redirecionar ao login em 401.
- **Formulários divergentes** → Padronizar schemas e helpers.
- **Baixa usabilidade mobile** → Garantir responsividade mínima nos fluxos principais.
