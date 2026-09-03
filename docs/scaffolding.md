# Scaffolding guiado do AppStart

O AppStart fornece um fluxo oficial para criar projetos derivados a partir do template sem editar manualmente arquivos estruturais.

## Objetivo pedagógico

O scaffolding existe para que alunos e docentes não precisem:
- copiar arquivos manualmente;
- ajustar nomes básicos do projeto em vários pontos;
- preparar o `.env` do zero;
- inicializar Git manualmente;
- lembrar a ordem dos primeiros comandos.

## Uso interativo

```bash
./setup.sh
```

O script solicita:
- nome do projeto em kebab-case;
- diretório de destino;
- descrição do projeto;
- nome do banco em snake_case;
- portas iniciais da API, frontend, PostgreSQL e Keycloak;
- e-mail e nome do administrador inicial;
- remote Git opcional.

## Uso não interativo

```bash
./setup.sh \
  --name meu-projeto \
  --dir ../meu-projeto \
  --description "Projeto da disciplina" \
  --db-name meu_projeto \
  --api-port 3000 \
  --web-port 5173 \
  --db-port 5432 \
  --keycloak-port 8080 \
  --admin-email admin@meu-projeto.local \
  --admin-name "Administrador"
```

## Flags úteis

- `--skip-install`: não roda `pnpm install`
- `--skip-git`: não executa `git init`
- `--bootstrap`: roda `pnpm setup` ao final
- `--git-remote <url>`: configura `origin`
- `--help`: mostra a ajuda

## O que o script faz hoje

1. valida pré-requisitos básicos do ambiente;
2. copia o template para o diretório escolhido sem alterar a base original;
3. gera `.env` a partir de `.env.example`;
4. aplica os dados informados nos arquivos principais do projeto gerado;
5. inicializa Git;
6. instala dependências;
7. informa os próximos passos.

## Integração com Keycloak

O projeto derivado recebe automaticamente:
- banco da aplicação;
- nome do banco do Keycloak;
- nome do realm e do client;
- credenciais dos usuários demo (`admin` e `user`);
- variáveis `KEYCLOAK_*` no `.env`;
- porta independente configurável por `--keycloak-port`.

Com `--bootstrap`, o scaffolding também executa `pnpm setup`, que renderiza o realm e sobe PostgreSQL + Keycloak.

## O que o script não faz automaticamente

- não substitui o estudo da arquitetura do template;
- não configura produção;
- não remove a necessidade de revisar o `.env`;
- não elimina a necessidade de `pnpm setup`, exceto quando `--bootstrap` é usado;
- não implementa as rotas BFF da aplicação; ele prepara a infraestrutura de identidade.
