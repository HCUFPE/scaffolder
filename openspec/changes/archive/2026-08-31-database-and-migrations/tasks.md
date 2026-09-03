## 1. Banco local

- [x] 1.1 Configurar PostgreSQL em `compose.yaml` com health check e volume nomeado.
- [x] 1.2 Expor credenciais, porta e nome do banco via ambiente.
- [x] 1.3 Documentar operação local do banco e persistência de dados.

## 2. Migrations e seed

- [x] 2.1 Configurar fluxo Prisma com migrations versionadas.
- [x] 2.2 Implementar validação na CI para mudanças de schema sem migration.
- [x] 2.3 Implementar seed idempotente para dados estruturais, deixando usuários, roles e credenciais demo a cargo do provisionamento do Keycloak.

## 3. Produção e reset

- [x] 3.1 Documentar e automatizar uso de `prisma migrate deploy` em produção.
- [x] 3.2 Criar procedimento de reset destrutivo apenas para desenvolvimento.
