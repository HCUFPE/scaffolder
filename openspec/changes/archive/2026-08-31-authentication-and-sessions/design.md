## Context

O AppStart adotará o Keycloak como provedor de identidade e o backend NestJS como BFF. O navegador inicia o login pela aplicação, mas autentica no Keycloak; após o callback OIDC, o backend cria uma sessão local opaca em cookie `HttpOnly`. Tokens do provedor não são expostos ao frontend e a aplicação não armazena senhas nem hashes de senha.

## Goals / Non-Goals

**Goals:**
- Implementar Authorization Code Flow com client confidencial, `state`, `nonce` e PKCE `S256`.
- Validar callback, emissor, assinatura, audiência e artefatos de correlação antes de aceitar a identidade.
- Vincular o `sub` do Keycloak a um perfil local e mapear as roles `admin`/`user`.
- Criar e validar sessões locais opacas persistidas apenas por hash.
- Usar cookie `HttpOnly` com atributos seguros e oferecer revogação local e logout federado quando possível.
- Delegar senhas e gerenciamento de conta ao Keycloak.

**Non-Goals:**
- Implementar login local por e-mail e senha, hashing de senha ou recuperação de senha na aplicação.
- Entregar access token, ID token ou refresh token ao frontend.
- Implementar provedores sociais, federação institucional ou MFA nesta fase.

## Decisions

- O endpoint `/api/v1/auth/login` gera `state`, `nonce` e `code_verifier` criptograficamente aleatórios, envia `code_challenge` `S256` ao Keycloak e mantém os artefatos de correlação por curto prazo em cookie seguro, íntegro e `HttpOnly` ou armazenamento server-side equivalente.
- O callback exige correspondência de `state`, usa o `code_verifier` na troca do código e valida o ID token contra discovery/JWKS, incluindo `iss`, `aud`, expiração e `nonce`.
- Artefatos de correlação são de uso único e removidos após sucesso ou falha terminal do callback.
- O perfil local é localizado pelo `sub` do Keycloak (`keycloakUserId`); e-mail e nome podem ser sincronizados conforme as claims validadas.
- Roles de realm são mapeadas inicialmente como `admin -> ADMIN` e `user -> USER`, mantendo um snapshot local para autorização e auditoria.
- O token da sessão local possui alta entropia e somente seu hash é persistido. O valor original existe apenas no cookie.
- O cookie de sessão usa `HttpOnly`, `SameSite=Lax`, `Path=/` e `Secure` em produção, com duração alinhada à expiração absoluta da sessão.
- Tokens obtidos no callback não são enviados ao browser. Qualquer retenção futura de token do provedor exigirá armazenamento cifrado e uma decisão de design específica.
- Alteração e recuperação de senha são realizadas por fluxo do Keycloak, acessível por `/api/v1/auth/account`.
- Logout sempre revoga a sessão local e tenta encerrar a sessão federada sem tornar a revogação local dependente da disponibilidade do Keycloak.

## Risks / Trade-offs

- **Replay ou callback forjado** → Validar `state`, `nonce`, PKCE e tornar a correlação de uso único e curta duração.
- **Keycloak indisponível** → Falhar com erro diagnosticável sem criar sessão parcial.
- **Roubo de cookie** → Usar alta entropia, hash no banco, `HttpOnly`, `SameSite=Lax` e `Secure` em produção.
- **Divergência de perfil ou papel** → Sincronizar claims validadas no login e aplicar desativação local como bloqueio soberano.
- **Sessões órfãs crescerem no banco** → Executar limpeza periódica de expiradas.
