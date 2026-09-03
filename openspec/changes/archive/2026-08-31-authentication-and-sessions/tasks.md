## 1. Fluxo OIDC

- [x] 1.1 Configurar discovery/JWKS, issuer, client confidencial, callback e validação das variáveis do Keycloak.
- [x] 1.2 Implementar `/api/v1/auth/login` com `state`, `nonce`, PKCE `S256` e retorno interno seguro.
- [x] 1.3 Implementar `/api/v1/auth/callback` com correlação de uso único, troca do código e validação completa do ID token.

## 2. Identidade e sessão local

- [x] 2.1 Vincular ou atualizar o perfil local pelo `sub` do Keycloak e mapear roles de realm.
- [x] 2.2 Gerar token opaco de alta entropia e persistir somente seu hash com criação, último uso e expiração.
- [x] 2.3 Emitir cookie de sessão com atributos seguros e garantir que tokens OIDC não sejam expostos ao frontend.

## 3. Ciclo de vida e conta

- [x] 3.1 Implementar `/api/v1/auth/me` e resolução da sessão com verificação de expiração e ativação local.
- [x] 3.2 Implementar logout atual com revogação local obrigatória, expiração do cookie e tentativa de logout federado.
- [x] 3.3 Implementar logout-all e limpeza periódica de sessões expiradas.
- [x] 3.4 Implementar `/api/v1/auth/account` como redirecionamento ao gerenciamento de conta e senha do Keycloak.

## 4. Verificação

- [x] 4.1 Cobrir login, callback, sessão, logout e falhas de correlação OIDC com testes de integração/E2E.
- [x] 4.2 Verificar que nenhuma senha, hash de senha ou token do Keycloak seja persistido indevidamente ou entregue ao frontend.
