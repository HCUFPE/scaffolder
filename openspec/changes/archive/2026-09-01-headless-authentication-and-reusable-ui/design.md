# Design: Autenticação Headless & Componentes React Reutilizáveis

## 1. Arquitetura de Autenticação Headless

### Fluxo de Autenticação
1. O usuário digita seu `email` (ou username) e `password` no formulário nativo em React na rota `/login`.
2. O formulário valida as entradas localmente via schema Zod e submete via `POST /api/v1/auth/login`.
3. O controller NestJS recebe o payload tipado `LoginRequestDto` e invoca `OidcService.loginWithCredentials(email, password)`.
4. O `OidcService` requisita o token do Keycloak via `POST /protocol/openid-connect/token` com `grant_type: 'password'`.
5. Ao receber a resposta positiva, o backend valida a assinatura JWT do `id_token` usando o conjunto de chaves públicas JWKS do Keycloak.
6. A identidade é serializada com segurança e passada para `AuthService.completeLogin(identity)`.
7. O backend grava a sessão opaca na tabela `sessions` do PostgreSQL e anexa o cookie seguro `appstart_session` (`HttpOnly`, `SameSite=Lax`, `Path=/`).
8. O frontend recebe `{ user }` com status 200 e redireciona o usuário para o Dashboard (`/`) ou a rota protegida original.

### Tratamento de Falhas
- Credenciais inválidas retornam status `401 Unauthorized` com `ProblemDetailsDto` amigável: *"E-mail ou senha incorretos."*
- Provedor Keycloak indisponível retorna `502 Bad Gateway` com mensagem de indisponibilidade temporária.

## 2. Componentes UI Reutilizáveis em React (`apps/web/src/components/ui/`)

### 1. `StatCard` (`stat-card.tsx`)
- **Props:** `title: string`, `value: string | number`, `icon: LucideIcon`, `iconBgClass?: string`, `iconColorClass?: string`, `actionText?: string`, `actionHref?: string`, `badge?: string`.
- **Renderização:** Bloco dividido em parte superior (métrica + ícone em caixa destacada) e parte inferior (link de atalho estilizado).

### 2. `PageHeader` (`page-header.tsx`)
- **Props:** `title: string`, `subtitle?: string`, `category?: string`, `badgeText?: string`, `badgeVariant?: BadgeVariant`, `children?: ReactNode` (para botões de ação).
- **Renderização:** Banner acolhedor estilizado com tipografia hierárquica e slot de ações flexível.

### 3. `UserDropdown` (`user-dropdown.tsx`)
- **Props:** `user: SafeUserProfile | null`, `isAdmin: boolean`, `onLogout: () => void`, `onManageAccount: () => void`.
- **Renderização:** Botão com avatar e dropdown popover com resumo do usuário, links de navegação e logout.

### 4. `FormField` (`form-field.tsx`)
- **Props:** `label: string`, `error?: string`, `description?: string`, `required?: boolean`, `children: ReactNode`.
- **Renderização:** Wrapper de campo de formulário com rótulo acessível, espaçamento e mensagem de erro em vermelho suave.

## 3. Segurança e Compatibilidade
- Zero exposição de tokens do Keycloak no navegador.
- Preservação da auditoria e suporte a provedores externos (LDAP/Active Directory) via Keycloak.
- Validação automática de contrato OpenAPI (`pnpm api:check`) e suíte completa de testes (`pnpm check:all`).
