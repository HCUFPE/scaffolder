# Guia do docente para o AppStart

## Objetivo

Permitir que docentes e monitores preparem rapidamente projetos derivados para equipes ou turmas, mantendo a base do template intacta e reduzindo variações de infraestrutura entre grupos.

## Diretriz central

O AppStart é **high-opinionated**. Isso significa que a equipe docente decide previamente:
- banco;
- autenticação;
- organização estrutural;
- scripts de setup;
- convenções básicas.

A intenção é deslocar o foco do aluno para análise, domínio, testes e evolução do software.

## Estratégia recomendada

- mantenha um clone limpo do template;
- gere um projeto derivado por equipe ou grupo;
- use nomes previsíveis para diretórios e bancos;
- padronize portas e credenciais demo quando necessário;
- trate o Keycloak como infraestrutura do template, não como conteúdo obrigatório de aprendizagem inicial.

## Exemplo por equipe

```bash
./setup.sh \
  --name equipe-alpha \
  --dir ../equipe-alpha \
  --description "Projeto da equipe Alpha" \
  --db-name equipe_alpha \
  --admin-email admin@equipe-alpha.local \
  --skip-install
```

Depois, cada equipe pode executar:

```bash
cd ../equipe-alpha
corepack enable
pnpm install
pnpm setup
pnpm dev
```

O `pnpm setup` prepara PostgreSQL, renderiza o realm e sobe o Keycloak com os usuários demo.

## Papel do docente na baseline alvo com Keycloak

Na arquitetura definida pelo SRD:
- o Keycloak deve vir pré-configurado;
- realm, clients, roles e usuários demo devem nascer automaticamente;
- o aluno não deve precisar acessar o console administrativo para iniciar o desenvolvimento do domínio.

O docente deve intervir no Keycloak apenas quando:
- quiser demonstrar conceitos de identidade e federação;
- precisar ajustar usuários demo para a turma;
- estiver validando a infraestrutura do template.

## Sugestões para laboratório

- prefira Linux ou WSL2 quando possível;
- valide Docker, Node.js e pnpm antes da aula;
- distribua um padrão de portas se os alunos compartilharem a mesma máquina;
- se o laboratório tiver rede lenta, considere rodar o scaffolding com `--skip-install` e instalar depois.

## Troubleshooting rápido

### Diretório não vazio
Escolha outro diretório ou remova os arquivos antigos antes de rodar o script.

### Falta de dependências
Peça ao aluno para executar `bash ./check_dependencies.sh` e corrigir os itens faltantes.

### Erro no bootstrap
Confirme se o `.env` foi gerado corretamente e se o Docker está saudável antes de rodar `pnpm setup`.

### Diferença entre infraestrutura e fluxo BFF
A infraestrutura, o provisionamento inicial do Keycloak, as rotas BFF e a sessão local já fazem parte da baseline. A integração visual do frontend permanece como entrega incremental. O aluno não deve reinventar essa camada por conta própria.
