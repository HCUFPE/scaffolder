# Banco de dados e migrations

## Desenvolvimento local

O PostgreSQL é iniciado pelo `compose.yaml` e persiste dados no volume nomeado `postgres_data`.

```bash
pnpm db:up
pnpm db:migrate
pnpm db:seed
```

`pnpm db:down` interrompe o PostgreSQL sem remover o volume. Para inspecionar dados localmente, use `pnpm db:studio`.

## Alterações estruturais

Toda alteração em `apps/api/prisma/schema.prisma` deve possuir uma migration versionada em `apps/api/prisma/migrations/`. A CI executa `pnpm db:check` contra um PostgreSQL temporário e falha quando o schema e o histórico de migrations divergem.

Para executar a mesma validação localmente, informe um banco temporário e exclusivo, com nome terminado em `_shadow`:

```bash
SHADOW_DATABASE_URL="postgresql://usuario:senha@localhost:5432/appstart_shadow" pnpm db:check
```

O banco de shadow é descartável e jamais deve conter dados reais.

## Deploy em produção

A release deve fornecer `DATABASE_URL` por secret do ambiente e executar:

```bash
NODE_ENV=production DATABASE_URL="postgresql://..." pnpm db:deploy
```

`pnpm db:deploy` usa exclusivamente `prisma migrate deploy`, que é não interativo e aplica somente migrations já versionadas. Não use `prisma migrate dev`, `prisma db push` nem comandos de reset em produção. Faça backup e valide o plano de recuperação conforme os requisitos operacionais da aplicação derivada.

## Reset destrutivo de desenvolvimento

Para reconstruir integralmente PostgreSQL e Keycloak no ambiente local:

```bash
docker compose down -v
pnpm setup
```

Esse procedimento remove os bancos e sessões locais. Ele deve ser usado somente em desenvolvimento.
