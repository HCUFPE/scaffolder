# authenticated-web-shell Specification

## Purpose
Estrutura base da aplicação web com início de autenticação federada (OIDC) via backend, proteção de rotas privadas por verificação de sessão e redirecionamento seguro pós-login preservando o destino solicitado.

## Requirements

### Requirement: The web application must initiate federated login
The system MUST provide a login entrypoint that redirects visitors through the backend OIDC login endpoint and MUST NOT collect or store Keycloak passwords or tokens in frontend code.

#### Scenario: Starting login from the web application
- **WHEN** a visitor chooses to sign in
- **THEN** the browser navigates to `/api/v1/auth/login` and continues authentication at Keycloak

#### Scenario: Authentication provider reports an error
- **WHEN** the visitor returns from an unsuccessful authentication attempt
- **THEN** the interface displays generic, actionable feedback without exposing provider details or account existence

### Requirement: Protected routes must require a valid local session
The system MUST verify the current session through the backend before rendering protected content and MUST redirect unauthenticated visitors to the login entrypoint.

#### Scenario: Visiting a protected route without a valid session
- **WHEN** a visitor navigates to a private route without a valid session
- **THEN** the application redirects the visitor to the login screen

### Requirement: Post-login redirect must be safe
The system MUST return the user to the originally requested internal route after login and MUST reject unsafe external redirects.

#### Scenario: Completing login after requesting a private route
- **WHEN** a user completes Keycloak authentication after requesting a protected internal route
- **THEN** the application navigates the user back to that internal route
