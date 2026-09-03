# ADR-005: Políticas de Propriedade (Ownership) e Remoção Lógica (Soft Delete)

## Status
Aceito

## Contexto
Em sistemas corporativos e educacionais, duas práticas de governança de dados são cruciais:
1. **Segregação de Dados por Usuário:** Garantir que usuários comuns acessem somente registros sob sua responsabilidade, enquanto administradores possuem visão de governança.
2. **Preservação de Histórico e Auditoria:** Evitar perda acidental irreversível de dados causada por exclusões físicas (`DELETE FROM ...`) acidentais.

## Decisão
Adotamos como padrão para entidades de domínio:
1. **Controle de Propriedade (*Ownership*):**
   - Toda entidade transacional referencia `ownerId` apontando para `user_profiles(id)`.
   - O `TasksService` filtra por `ownerId === user.id` para usuários comuns (`USER`), e permite visão global para administradores (`ADMIN`).
   - Tentativas de acesso ou alteração em registros de outros usuários por perfis não-admin retornam `403 Forbidden`.
2. **Remoção Lógica (*Soft Delete*):**
   - Utilização da coluna `deletedAt TIMESTAMP(3)` com índice de busca dedicado.
   - Exclusões executam `UPDATE ... SET deletedAt = NOW()` e queries ativas sempre filtram por `where: { deletedAt: null }`.

## Consequências
### Positivas
- **Prevenção de Perda de Dados:** Registros excluídos podem ser recuperados ou auditados facilmente.
- **Segurança Reforçada:** Aplicação de RBAC estrito e autorização no nível de linha (*Row-Level Security* no nível da aplicação).

### Negativas / Mitigações
- Necessidade de sempre incluir `deletedAt: null` nas queries Prisma, mitigada por centralizar a lógica no Service da entidade.
