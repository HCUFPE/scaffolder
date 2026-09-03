# ADR-002: Sessões Opacas Persistidas em Banco de Dados (PostgreSQL)

## Status
Aceito

## Contexto
Após a autenticação federada com o Keycloak, a aplicação precisa manter a sessão do usuário ativa entre requisições HTTP sucessivas. Poderíamos usar:
1. **JWT Assinado em Cookie:** Sessão stateless sem armazenamento no servidor.
2. **Sessões em Memória (ex.: Redis/In-Memory):** Rápido, mas adiciona mais uma dependência de infraestrutura na máquina do aluno.
3. **Sessões Opacas no PostgreSQL (Prisma):** Identificador criptográfico aleatório armazenado em tabela relacional com hash do token, TTL e expiração.

## Decisão
Adotamos **Sessões Opacas persistidas no PostgreSQL** através do modelo `Session` do Prisma:
- O cookie `appstart_session` contém apenas um identificador opaco aleatório de 64 bytes hexadecimais.
- O backend armazena o hash SHA-256 desse identificador (`tokenHash`), associado ao `userProfileId`, `expiresAt` e `lastUsedAt`.
- No logout ou desativação de usuário, a sessão é revogada instantaneamente no banco (`DELETE FROM sessions WHERE ...`), garantindo encerramento imediato.

## Consequências
### Positivas
- **Revogação Instantânea:** Diferente de JWTs stateless, se um administrador desativar uma conta ou se o usuário fizer logout, o acesso é cancelado no exato milissegundo.
- **Simplicidade de Infraestrutura:** Reutiliza o mesmo PostgreSQL que já é necessário para a aplicação, sem exigir Redis ou serviços adicionais em ambiente didático.
- **Auditoria de Sessões:** Facilita visualizar sessões ativas por usuário e implementar rotas como `/api/v1/auth/logout-all`.

### Negativas / Mitigações
- Requer uma consulta ao banco para validar a sessão em requisições autenticadas. Mitigada pelo índice btree em `sessions.tokenHash` e `sessions.expiresAt`, gerando tempo de resposta sub-milissegundo.
- Necessidade de limpeza periódica de sessões expiradas, tratada pelo serviço de expiração e agendador.
