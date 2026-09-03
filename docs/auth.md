# Autenticação e autorização

Este documento descreve a arquitetura de identidade implementada e sua evolução planejada, conforme o `SRD.md`.

## Princípio

O AppStart adota:
- **Keycloak** como provedor de identidade;
- **NestJS** como camada mediadora do login;
- **sessão local por cookie `HttpOnly`** para simplificar o frontend;
- **papéis básicos** (`admin` e `user`) mapeados para autorização da aplicação.

O aluno não deve precisar entender OIDC em profundidade para começar a implementar regras de domínio.

## Fluxo implementado

```text
1. Browser acessa rota protegida
2. AppStart inicia login
3. Keycloak autentica o usuário
4. Keycloak redireciona para callback da aplicação
5. Backend valida callback e troca code por tokens
6. Backend cria sessão local
7. Frontend usa a sessão da aplicação
```

## Por que não usar token direto no frontend como caminho principal

Porque isso expõe cedo demais conceitos como:
- PKCE;
- callback handling;
- refresh token;
- storage e renovação de token;
- diferenças entre access token e id token.

O modelo alvo do AppStart é **BFF-first**.

## O que o Keycloak deve fornecer

- realm padrão da aplicação;
- client da aplicação;
- roles básicas;
- usuários demo;
- política de senha mínima;
- páginas de login e gerenciamento de conta.

## O que a aplicação deve continuar controlando

- sessão local;
- `/api/v1/auth/me`;
- decorators e guards de autorização;
- regras de ownership;
- perfil local vinculado ao `keycloakUserId`.

## Papéis

Fonte de verdade inicial:
- Keycloak entrega roles;
- aplicação mapeia essas roles para papéis efetivos.

Mapa inicial recomendado:
- `admin` -> `ADMIN`
- `user` -> `USER`

## O que o aluno deve usar no dia a dia

- sessão já pronta;
- usuário atual;
- `@CurrentUser()`;
- `@Roles()`;
- regras de domínio.

O aluno não deve precisar:
- criar realm manualmente;
- abrir o console do Keycloak para começar;
- modelar a infraestrutura de login do zero.

## Status

A infraestrutura local já provisiona automaticamente:
- Keycloak;
- realm e client confidencial;
- roles `admin` e `user`;
- usuários demo.

A mediação BFF, as sessões locais opacas e as rotas `/api/v1/auth/*` estão implementadas. A integração visual do frontend e as operações administrativas completas de usuários permanecem como entregas incrementais da baseline.
