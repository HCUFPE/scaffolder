## 1. Backend Headless Authentication

- [x] 1.1 Criar DTOs de login direto (`LoginRequestDto`) em `apps/api/src/auth/auth.dto.ts`.
- [x] 1.2 Implementar método `loginWithCredentials` no `apps/api/src/auth/oidc.service.ts` usando Direct Access Grants.
- [x] 1.3 Adicionar endpoint `POST /api/v1/auth/login` no `apps/api/src/auth/auth.controller.ts` para autenticação headless e emissão de cookie de sessão.
- [x] 1.4 Adicionar testes unitários para login direto no backend (`apps/api/src/auth/`).

## 2. Componentes UI Reutilizáveis em React

- [x] 2.1 Criar componente `<StatCard />` em `apps/web/src/components/ui/stat-card.tsx`.
- [x] 2.2 Criar componente `<PageHeader />` em `apps/web/src/components/ui/page-header.tsx`.
- [x] 2.3 Criar componente `<UserDropdown />` em `apps/web/src/components/ui/user-dropdown.tsx`.
- [x] 2.4 Criar componente `<FormField />` em `apps/web/src/components/ui/form-field.tsx`.

## 3. Frontend Headless Login & Refatoração Modular

- [x] 3.1 Criar formulário nativo de login em React com Zod e `react-hook-form` em `apps/web/src/pages/login-page.tsx`.
- [x] 3.2 Atualizar `auth-context.tsx` para suportar `login(credentials)` direto.
- [x] 3.3 Refatorar `dashboard-page.tsx` e `auth-layout.tsx` para utilizar os novos componentes reutilizáveis (`<StatCard />`, `<PageHeader />`, `<UserDropdown />`).
- [x] 3.4 Atualizar testes do frontend (`login-page.spec.tsx`, `auth-layout.spec.tsx`).

## 4. Verificação & Integridade

- [x] 4.1 Gerar contratos OpenAPI atualizados (`pnpm api:generate`).
- [x] 4.2 Executar suíte completa (`pnpm check:all`).
