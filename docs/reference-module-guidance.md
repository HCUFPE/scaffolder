# Guia do Módulo de Referência (Tasks) e Criação de Novos Módulos

Este documento explica como o módulo de referência pedagógica `tasks` está estruturado e fornece instruções detalhadas sobre como **estudar**, **renomear**, **remover** ou **criar novos módulos** sobre o template AppStart.

---

## 🏛️ Arquitetura do Módulo de Referência

O módulo `tasks` implementa um ciclo CRUD completo ponta a ponta com padrões de produção:

1. **Persistência (Prisma ORM & PostgreSQL):**
   - Entidade `Task` com chaves estrangeiras, índices e tipos enumerados (`TaskStatus`, `TaskPriority`).
   - Suporte a **Remoção Lógica (*Soft Delete*)** através do campo `deletedAt`.
   - Relação de propriedade com o perfil do usuário (`UserProfile`).

2. **Regras de Negócio e Autorização:**
   - **Controle de Propriedade (*Ownership*):** Usuários comuns (`USER`) só podem consultar, editar e excluir suas próprias tarefas. Usuários administradores (`ADMIN`) possuem visão global.
   - **Validação de Prazos:** A data limite (`dueDate`) não pode ser definida no passado na criação ou alteração.
   - **Transição de Estados:** Tarefas com status `COMPLETED` não podem ter títulos ou descrições alteradas sem antes serem reabertas (`PENDING` ou `IN_PROGRESS`).

3. **Contrato OpenAPI & Cliente Tipado:**
   - DTOs anotados com `@ApiProperty()` e `class-validator` em `apps/api/src/tasks/task.dto.ts`.
   - Geração automática de endpoints no cliente frontend via `pnpm api:generate` (Orval).

4. **Interface Web (React + TanStack Query):**
   - Listagem paginada com busca por texto, filtros de status/prioridade e ordenação sincronizados na URL.
   - Formulários com validação rigorosa usando **React Hook Form** e **Zod**.
   - Estados visuais completos: Carregamento (*Loading*), Vazio (*Empty*), Erro (*Error*) e Sucesso (*ActionFeedback*).

---

## 🔄 Como Renomear o Módulo

Caso deseje transformar o módulo `tasks` em outro domínio (ex.: `projects`, `products`, `orders`):

1. **Renomear Entidade no Prisma:**
   - No arquivo `apps/api/prisma/schema.prisma`, renomeie o modelo `model Task` para `model Project`.
   - Crie uma migration versionada e aplique com `pnpm db:migrate`.
   - Execute `pnpm --dir apps/api exec prisma generate --schema prisma/schema.prisma`.

2. **Renomear Módulo no Backend:**
   - Renomeie o diretório `apps/api/src/tasks/` para `apps/api/src/projects/`.
   - Atualize os nomes das classes (`ProjectsModule`, `ProjectsController`, `ProjectsService`, `CreateProjectDto`).
   - Atualize a importação em `apps/api/src/app.module.ts`.

3. **Regenerar Contrato e Cliente:**
   - Execute `pnpm api:generate`.

4. **Renomear Página no Frontend:**
   - Renomeie `apps/web/src/pages/tasks-page.tsx` para `apps/web/src/pages/projects-page.tsx`.
   - Atualize as rotas em `apps/web/src/App.tsx` e o menu em `apps/web/src/components/layout/auth-layout.tsx`.

---

## 🗑️ Como Remover o Módulo Limpamente

Se você preferir iniciar sua aplicação a partir de uma base totalmente limpa:

1. **Remover no Backend:**
   - Exclua o diretório `apps/api/src/tasks/`.
   - Em `apps/api/src/app.module.ts`, remova a importação e o módulo `TasksModule` do array `imports`.
   - No `apps/api/prisma/schema.prisma`, remova o `model Task`, os enums `TaskStatus`/`TaskPriority` e o campo `tasks Task[]` em `UserProfile`.
   - Crie uma migration de exclusão ou reset com `pnpm db:migrate`.

2. **Remover no Frontend:**
   - Exclua `apps/web/src/pages/tasks-page.tsx` e `apps/web/src/pages/tasks-page.spec.tsx`.
   - Remova a rota `/tasks` em `apps/web/src/App.tsx`.
   - Remova o link de Tarefas em `apps/web/src/components/layout/auth-layout.tsx`.

3. **Regenerar e Validar:**
   - Execute `pnpm api:generate`.
   - Execute `pnpm --dir apps/api test && pnpm --dir apps/web test && pnpm --dir apps/web build && pnpm api:check`.
