## Why

Para proporcionar uma experiência de usuário contínua e sem fricção, a autenticação com Keycloak deve ocorrer de forma invisível (*Headless IAM*), onde o usuário interage unicamente com formulários nativos em React sem jamais ser redirecionado para telas externas. Adicionalmente, para garantir alta manutenibilidade e consistência pedagógica no frontend React, todos os elementos visuais de layout, cards, cabeçalhos de página e formulários devem ser desacoplados em componentes React modulares e reutilizáveis em `apps/web/src/components/ui/`.

## What Changes

- **Autenticação Nativa Headless (Keycloak Invisível):**
  - Adição de endpoint `POST /api/v1/auth/login` no backend NestJS aceitando `{ email, password }`.
  - O `OidcService` executa a troca direta de credenciais (*Direct Access Grant*) junto ao endpoint de token do Keycloak nos bastidores, valida o `id_token` assinado e cria a sessão opaca em cookie HTTP-only no PostgreSQL.
  - A tela de login (`/login`) no React passa a renderizar um formulário nativo completo com validação de campos via `react-hook-form` + `zod`, feedback de erro suave e loading states.
- **Biblioteca de Componentes UI Reutilizáveis (`apps/web/src/components/ui/`):**
  - `StatCard`: Componente de métrica em duas camadas (métrica + ícone em container arredondado + rodapé com atalho de navegação).
  - `PageHeader`: Componente de cabeçalho de página com título, subtítulo, badge de categoria/papel e slot de botões de ação rápida.
  - `UserDropdown`: Menu suspenso de perfil do usuário com resumo de identidade e atalhos.
  - `FormField`: Campo de formulário tipado com rótulo, input e mensagens de erro integradas.

## Capabilities

### New Capabilities
- `headless-direct-login`: Autenticação direta de credenciais via backend com Keycloak atuando como motor de identidade invisível e emissão de sessão opaca em cookie.
- `reusable-ui-components`: Conjunto modular de componentes React reutilizáveis para estatísticas, cabeçalhos, formulários e controles de usuário.

### Modified Capabilities
- `authenticated-web-shell`: A tela e o fluxo de login passam a ser nativos do frontend React.

## Impact

- `apps/api/src/auth/` (DTOs, `OidcService.loginWithCredentials`, `AuthController.login`)
- `apps/web/src/components/ui/` (novos componentes `stat-card.tsx`, `page-header.tsx`, `form-field.tsx`, `user-dropdown.tsx`)
- `apps/web/src/pages/login-page.tsx`, `apps/web/src/pages/dashboard-page.tsx`, `apps/web/src/components/layout/auth-layout.tsx`
- Contratos OpenAPI (`openapi.json`) e cliente tipado gerado (`@/lib/api-client`)
