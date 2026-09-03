# ADR-001: Autenticação Federada OIDC com Backend for Frontend (BFF)

## Status
Aceito

## Contexto
Aplicações web modernas frequentemente lidam com autenticação delegando a responsabilidade a Provedores de Identidade (IdP) compatíveis com OpenID Connect (OIDC) e OAuth 2.0, como o **Keycloak**. 

Existem duas abordagens principais para aplicações SPA (Single Page Application):
1. **SPA com Tokens no Navegador (Cliente Público):** O frontend recebe `access_token` e `refresh_token` diretamente no navegador e os armazena em `localStorage` ou memória.
2. **Backend for Frontend (BFF):** O backend atua como cliente confidencial (com `client_secret`), realiza a troca de código de autorização com PKCE, armazena os tokens do IdP no servidor e emite para o navegador apenas um identificador de sessão opaco em cookie seguro (`HttpOnly`, `SameSite=Lax`).

## Decisão
Adotamos o padrão **Backend for Frontend (BFF)** com **Keycloak** para o AppStart:
- O frontend jamais recebe ou armazena credenciais, senhas, `access_tokens` ou `refresh_tokens` do Keycloak.
- O fluxo de login é iniciado navegando para `/api/v1/auth/login`, que gera o estado OIDC com PKCE e redireciona o usuário para o Keycloak.
- O callback em `/api/v1/auth/callback` valida o `state`, troca o `code` no Keycloak, cria ou sincroniza o perfil local do usuário no PostgreSQL e emite uma sessão opaca via cookie `HttpOnly`.

## Consequências
### Positivas
- **Segurança Robusta:** Proteção contra vazamento de tokens via ataques XSS, pois scripts maliciosos não conseguem ler cookies `HttpOnly`.
- **Didática Clara:** Demonstra aos alunos o padrão recomendado pela IETF (*OAuth 2.0 for Browser-Based Applications*) e OWASP.
- **Isolamento de Credenciais:** Centralização da política de senhas, MFA e federação no Keycloak, mantendo a aplicação desacoplada.

### Negativas / Mitigações
- Necessidade de proteção contra CSRF em requisições de mutação (`POST`, `PUT`, `DELETE`), mitigada pela inclusão do `CsrfGuard` e cookies `SameSite=Lax`.
- Dependência da infraestrutura do Keycloak para autenticação, mitigada pelo script de inicialização local via Docker Compose (`pnpm auth:up`).
