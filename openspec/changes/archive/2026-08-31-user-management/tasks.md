## 1. Perfil local e vínculo de identidade

- [x] 1.1 Definir perfil com UUID, `keycloakUserId` único, nome, e-mail normalizado único, `roleSnapshot` e `isActiveLocal`, sem `passwordHash`.
- [x] 1.2 Implementar criação/atualização idempotente do perfil a partir de claims OIDC validadas.
- [x] 1.3 Implementar mapeamento de roles `admin`/`user` e serialização sem credenciais ou tokens do provedor.

## 2. Operações administrativas

- [x] 2.1 Implementar listagem paginada e filtrável de perfis para `ADMIN`.
- [x] 2.2 Implementar criação de conta via Keycloak Admin API e criação coordenada do perfil local.
- [x] 2.3 Implementar atualização coordenada de nome, e-mail e papel com tratamento de falhas parciais.
- [x] 2.4 Implementar ativação/desativação no provedor e localmente, revogando sessões locais na desativação.

## 3. Autoatendimento e segurança

- [x] 3.1 Implementar consulta do próprio perfil.
- [x] 3.2 Implementar atualização somente dos campos permitidos, impedindo alteração de vínculo, papel e estado.
- [x] 3.3 Manter cadastro público desabilitado e delegar credenciais e gerenciamento de conta ao Keycloak.

## 4. Verificação

- [x] 4.1 Cobrir unicidade de `keycloakUserId`/e-mail, sincronização, autorização administrativa e falhas parciais com testes.
