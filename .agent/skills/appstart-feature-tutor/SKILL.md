---
name: appstart-feature-tutor
description: Tutor interativo que ensina e conduz a criação de novas funcionalidades no AppStart passo a passo na ordem arquitetural correta, com checkpoints de validação e comandos de teste em cada etapa.
---

# AppStart Feature Tutor (Tutor de Aprendizado de Novas Funcionalidades)

Use esta skill quando o usuário ou aluno desejar aprender como criar uma nova funcionalidade completa (Full Stack) no AppStart ou precisar de orientação passo a passo durante a implementação.

---

## 🎯 Princípios Pedagógicos

1. **Ordem Arquitetural Correta:** Nunca pule etapas. A ordem obrigatória é:
   `1. Banco de Dados & Prisma` → `2. Backend NestJS & Regras de Negócio` → `3. Contrato OpenAPI & Cliente Orval` → `4. Interface Web React & UX` → `5. Validação Integrada`.
2. **Explicação do "Porquê":** Cada decisão arquitetural deve ser explicada brevemente (ex.: por que usamos soft delete, por que usamos DTOs, por que tipamos com Zod).
3. **Checkpoints de Validação:** Ao término de cada passo, forneça os comandos exatos para o aluno testar e validar o resultado antes de prosseguir para o próximo.

---

## 🪜 Roteiro Guiado Passo a Passo

### 📦 Passo 1: Modelagem Relacional & Migrações
* **O que ensinar:**
  - Como modelar a nova entidade no `apps/api/prisma/schema.prisma`.
  - Como incluir campos obrigatórios de governança (`id UUID`, `ownerId UUID`, `owner UserProfile`, `deletedAt DateTime?`, `createdAt`, `updatedAt`).
  - Como criar a migration SQL versionada em `apps/api/prisma/migrations/YYYYMMDD_<nome_modulo>/migration.sql` com consultas numeradas (`-- Consulta 001: ...`).
* **Comandos de Execução:**
  ```bash
  pnpm db:migrate
  pnpm --dir apps/api exec prisma generate --schema prisma/schema.prisma
  ```
* **Checkpoint de Validação do Passo 1:**
  ```bash
  PGPASSWORD=appstart_dev_password_change_me psql -h localhost -p 5432 -U appstart -d appstart -c "\d sua_tabela"
  ```
  *Critério:* A tabela deve existir no PostgreSQL com todos os índices e foreign keys.

---

### ⚙️ Passo 2: Backend NestJS (DTOs, Service, Controller & Testes)
* **O que ensinar:**
  - Criar DTOs com validação `class-validator` e Swagger `@ApiProperty()` em `apps/api/src/<modulo>/<modulo>.dto.ts`.
  - Implementar `<modulo>.service.ts` com regras de negócio e política de ownership (`ownerId: user.id` para `USER`, global para `ADMIN`).
  - Implementar `<modulo>.controller.ts` com decoradores de Swagger, `@CurrentUser()` e rotas REST.
  - Registrar no `<modulo>.module.ts` e importar no `apps/api/src/app.module.ts`.
  - Escrever testes unitários em `<modulo>.service.spec.ts`.
* **Comandos de Execução & Checkpoint do Passo 2:**
  ```bash
  pnpm --dir apps/api test
  ```
  *Critério:* Todos os testes unitários do backend devem passar com 100% de sucesso.

---

### 📡 Passo 3: Sincronização do Contrato OpenAPI & Cliente TypeScript
* **O que ensinar:**
  - Por que contratos estáticos evitam bugs entre backend e frontend.
  - Como a ferramenta Orval lê `openapi.json` e gera chamadas assíncronas tipadas em `apps/web/src/lib/api-client/`.
* **Comandos de Execução & Checkpoint do Passo 3:**
  ```bash
  pnpm api:generate
  pnpm api:check
  ```
  *Critério:* O script `pnpm api:check` deve relatar sucesso sem divergências.

---

### 🖥️ Passo 4: Interface Web React & Padrões de UX
* **O que ensinar:**
  - Como consumir o cliente gerado usando **TanStack React Query** (`useQuery` para listas/detalhes, `useMutation` para criação/edição/exclusão).
  - Como estruturar a página usando os componentes reutilizáveis padronizados do template:
    - `<PageHeader />` para cabeçalho e botões de ação rápida.
    - `<StatCard />` para cards de estatísticas em duas camadas.
    - `<FormField />` e `<Input />` para campos com validação integrada.
    - `<LoadingState />`, `<EmptyState />`, `<ErrorState />`, `<ActionFeedback />` para os 4 estados visuais fundamentais.
  - Como validar formulários declarativos com **React Hook Form** + **Zod** (`zodResolver`).
  - Adicionar a rota em `apps/web/src/App.tsx` e o link categorizado no menu lateral em `apps/web/src/components/layout/auth-layout.tsx`.
  - Escrever o teste de componente em `apps/web/src/pages/<modulo>-page.spec.tsx`.
* **Comandos de Execução & Checkpoint do Passo 4:**
  ```bash
  pnpm --dir apps/web test
  pnpm --dir apps/web build
  ```
  *Critério:* Os testes do frontend devem passar e o compilador TypeScript (`tsc -b`) não deve emitir nenhum erro de tipo.

---

### ✅ Passo 5: Validação Final Integrada
* **Comando Geral:**
  ```bash
  pnpm check:all
  ```
* **Critério de Conclusão:** A nova funcionalidade está 100% pronta, testada, documentada e integrada à arquitetura do AppStart.
