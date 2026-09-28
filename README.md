# Vivian Projeto

Adicionar defuncionalidade nova

Projeto gerado a partir do template AppStart.

## Primeiro uso

```bash
corepack enable
pnpm install
pnpm run setup
pnpm dev
```

## Rodando no GitHub Codespaces

O Codespaces expõe cada serviço em uma URL pública diferente de `localhost`.
Após abrir o projeto no Codespaces, execute:

```bash
bash scripts/codespaces-setup.sh
```

O script detecta automaticamente o `CODESPACE_NAME` e atualiza as variáveis
`API_BASE_URL`, `WEB_BASE_URL` e `KEYCLOAK_BASE_URL` no `.env` com as URLs
públicas corretas. Em seguida, torne as portas públicas no painel de **Portas**
do Codespaces e reinicie com `pnpm dev`.

## Scripts principais

- `pnpm run setup`: sobe PostgreSQL e Keycloak, aplica migrations e executa o seed
- `pnpm dev`: inicia API e frontend em paralelo
- `pnpm db:up`: sobe o PostgreSQL local
- `pnpm db:down`: para o PostgreSQL sem remover o volume
- `pnpm auth:up`: provisiona e sobe o Keycloak local
- `pnpm auth:down`: para o Keycloak sem remover dados
- `pnpm db:migrate`: aplica migrations Prisma no ambiente local
- `pnpm db:check`: valida schema e migrations com um banco de shadow
- `pnpm db:deploy`: aplica migrations em produção com prisma migrate deploy
- `pnpm db:seed`: executa o seed de desenvolvimento
- `pnpm db:studio`: abre o Prisma Studio

## Configuração inicial

Revise o arquivo `.env` gerado automaticamente antes de compartilhar o projeto.

## Usuários de desenvolvimento

As credenciais são definidas pelas variáveis `DEV_ADMIN_*` e `DEV_USER_*` no `.env`.
