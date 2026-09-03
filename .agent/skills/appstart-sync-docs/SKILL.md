---
name: appstart-sync-docs
description: Sincroniza e audita a documentação técnica, diagramas Mermaid, catálogo de rotas e ADRs do AppStart após alterações ou evolução da base de código.
---

# AppStart Sync Docs (Sincronizador e Auditor de Documentação)

Use esta skill sempre que a aplicação sofrer alterações arquiteturais, novos endpoints forem criados, novos modelos forem adicionados ao Prisma ou novas variáveis de ambiente forem introduzidas.

---

## 🔍 O que esta skill analisa e sincroniza

1. **Catálogo de Rotas e Endpoints:**
   - Lê `openapi.json` e compara com a tabela de rotas em [docs/architecture-overview.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/architecture-overview.md).
   - Se novos endpoints foram criados, atualiza a tabela com o método HTTP, path, proteção e papel mínimo.

2. **Diagramas ER e Modelos de Dados:**
   - Lê `apps/api/prisma/schema.prisma` e verifica se todas as entidades, enums e chaves estrangeiras estão representados no diagrama Mermaid ER em `docs/architecture-overview.md`.

3. **Decisões de Arquitetura (ADRs):**
   - Verifica se a alteração introduz um novo padrão que merece uma nova ADR em `docs/decisions/` ou se atualiza uma decisão existente.

4. **Integridade de Links e Scripts:**
   - Executa o script de integridade de documentação:
     ```bash
     pnpm docs:check
     ```
   - Corrige eventuais links quebrados ou referências desatualizadas.
