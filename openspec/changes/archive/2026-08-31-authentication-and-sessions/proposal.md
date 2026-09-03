## Why

Autenticação e sessões são o núcleo de segurança do template. A base precisa mediar o login OIDC com o Keycloak, manter tokens do provedor fora do frontend e oferecer uma sessão local opaca, revogável e segura.

## What Changes

- Implementar Authorization Code Flow entre o backend e o Keycloak com validação de `state`, `nonce` e PKCE (`S256`).
- Implementar `/auth/login`, `/auth/callback`, `/auth/me`, logout local, logout global e tentativa de logout federado.
- Vincular a identidade autenticada a um perfil local pelo `sub` do Keycloak.
- Persistir sessões opacas armazenando apenas o hash do token e expiração configurável.
- Delegar política, criação, alteração e recuperação de senhas ao Keycloak, sem persistir credenciais na aplicação.
- Revogar sessões em desativação local da conta e remover periodicamente sessões expiradas.

## Capabilities

### New Capabilities
- `password-security`: gestão de credenciais delegada ao Keycloak e ausência de senhas na aplicação.
- `session-authentication`: login OIDC mediado pelo BFF, cookies, sessão opaca e revogação.

### Modified Capabilities

## Impact

- Módulos de autenticação, identidade e sessão da API.
- Integração OIDC com o Keycloak.
- Persistência de perfis locais e sessões no PostgreSQL.
- Endpoints `/api/v1/auth/*` e testes de segurança/E2E.
