# Governança de Arquitetura e Documentação do AppStart

Qualquer desenvolvedor ou agente IA que trabalhe no repositório AppStart deve seguir rigorosamente as seguintes diretrizes:

---

## 1. Preservação de Padrões Arquiteturais
- **Segurança BFF:** Nunca armazene ou processe tokens JWT do Keycloak no frontend. Mantenha a autenticação por cookies `HttpOnly` e sessões opacas salvas no PostgreSQL.
- **CSRF:** Todas as rotas de mutação (`POST`, `PUT`, `PATCH`, `DELETE`) com autenticação por cookie devem ser protegidas contra CSRF com validação de origem.
- **Governança de Dados:** Todas as novas entidades do Prisma devem conter `ownerId`, controle de propriedade e suporte a remoção lógica (*Soft Delete* com `deletedAt`).
- **Respostas de Erro:** Todas as exceções da API devem ser formatadas conforme a RFC 7807 (`application/problem+json`).

---

## 2. Sincronização Obrigatória de Contratos e Documentação
- Sempre que um controller ou DTO for criado/alterado, execute `pnpm api:generate` para sincronizar o `openapi.json` e o cliente TypeScript em `apps/web/src/lib/api-client/`.
- Sempre que uma nova entidade, rota ou decisão de design for introduzida, atualize os documentos correspondentes em `docs/` (`docs/architecture-overview.md` e crie uma nova ADR em `docs/decisions/` se for um novo padrão).
- Sempre execute o comando `pnpm check:all` antes de submeter alterações.
