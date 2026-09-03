# ADR-003: Contrato OpenAPI 3.0 e Geração de Cliente TypeScript via Orval

## Status
Aceito

## Contexto
Em projetos full stack com múltiplos desenvolvedores ou alunos em equipe, a divergência de contratos de API (nomes de campos, tipos primitivos vs nulos, rotas desatualizadas) é uma das maiores fontes de bugs e retrabalho.

## Decisão
Adotamos a abordagem **Code-First com Export Estático OpenAPI 3.0** no NestJS e **Geração Automática de Cliente Tipado** via **Orval**:
1. O backend documenta todos os endpoints e DTOs com decoradores `@ApiProperty()`, `@ApiOperation()` e `@ApiResponse()`.
2. Um script de build estático (`generate-openapi.ts`) compila a aplicação NestJS offline e emite o arquivo `openapi.json` canônico.
3. O gerador **Orval** consome `openapi.json` e gera modelos TypeScript e funções assíncronas em `apps/web/src/lib/api-client/`.
4. Um script de CI (`pnpm api:check`) garante que nenhum código backend seja mesclado sem que o contrato e o cliente frontend estejam 100% sincronizados.

## Consequências
### Positivas
- **Type Safety Ponta a Ponta:** Qualquer alteração em DTOs do backend reflete instantaneamente em erros de compilação TypeScript no frontend (`tsc -b`).
- **Eliminação de `fetch` Manual:** O frontend não precisa escrever strings de URLs ou tipar manualmente respostas de requisições.
- **Documentação Interativa Swagger:** Rota `/api/docs` acessível diretamente para testes exploratórios.

### Negativas / Mitigações
- Necessidade de rodar `pnpm api:generate` após criar ou alterar controllers/DTOs. Mitigada pelo script automatizado e mensagem clara do `api:check`.
