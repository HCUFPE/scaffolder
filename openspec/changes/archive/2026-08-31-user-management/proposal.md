## Why

A base precisa oferecer perfis locais consistentes sem duplicar as responsabilidades do provedor de identidade. Cada usuário da aplicação deve estar vinculado de forma inequívoca ao Keycloak, enquanto estado local, dados de domínio e operações administrativas permanecem acessíveis pela aplicação.

## What Changes

- Definir o perfil local com UUID, `keycloakUserId`, nome, e-mail, snapshot de papel e estado ativo local.
- Padronizar normalização e unicidade de e-mail e unicidade do vínculo com o `sub` do Keycloak.
- Adicionar operações administrativas de listagem, criação e ativação/desativação com provisionamento correspondente no Keycloak.
- Mapear roles `admin` e `user` do Keycloak para `ADMIN` e `USER` na aplicação.
- Adicionar consulta e atualização segura do próprio perfil.
- Manter o cadastro público desabilitado e delegar credenciais e gerenciamento de conta ao Keycloak.

## Capabilities

### New Capabilities
- `user-identity-model`: perfil local vinculado à identidade do Keycloak e suas regras de integridade.
- `user-administration`: operações administrativas e de autoatendimento coordenadas com o provedor de identidade.

### Modified Capabilities

## Impact

- Schema Prisma de perfis de usuário.
- Integração com a Keycloak Admin API.
- Endpoints administrativos e de perfil.
- Normalização de e-mail, mapeamento de roles e serialização segura.
