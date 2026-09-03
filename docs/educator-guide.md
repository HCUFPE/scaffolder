# Guia do Educador (Docentes e Monitores)

O **AppStart** foi desenvolvido especificamente para apoiar cursos, disciplinas e workshops de desenvolvimento de software full stack moderno. Este guia orienta professores e monitores sobre como preparar turmas, avaliar projetos e propor atividades práticas.

---

## 👨‍🏫 1. Objetivos Pedagógicos do Template

Ao utilizar o AppStart, os alunos aprendem:
1. **Arquitetura em Camadas e Separação de Responsabilidades:** Compreensão do papel de cada camada (Banco -> ORM -> Service -> Controller -> Contrato -> Cliente Gerado -> UI React).
2. **Segurança de Identidade Moderna:** Uso do padrão BFF com Keycloak OIDC sem vazamento de tokens para a camada de visualização.
3. **Tipagem Estrita Ponta a Ponta:** Eliminação de erros de contrato através de DTOs e geração estática OpenAPI + Orval.
4. **Governança de Dados:** Uso de migrações versionadas, controle de propriedade (*ownership*) e remoção lógica (*soft delete*).
5. **Padrões de Interface:** Gerenciamento de estado de servidor com TanStack Query e formulários declarativos com Zod.

---

## 🛠️ 2. Preparação de Turmas e Instalação

### Requisitos Mínimos para Alunos
- **Node.js:** Versão 24 ou superior.
- **PNPM:** Versão 9 ou superior (`npm install -g pnpm`).
- **Docker & Docker Compose:** Para execução local do PostgreSQL e Keycloak.

### Script de Inicialização Rápida (1 Comando)
Os alunos devem clonar o template e rodar na raiz:
```bash
pnpm setup
```
O script `setup.mjs`:
- Valida o ambiente do sistema operacional e versões instaladas.
- Cria o `.env` inicial a partir do `.env.example`.
- Sobe o contêiner do PostgreSQL (`pnpm db:up`).
- Renderiza e sobe o Keycloak com o Realm configurado (`pnpm auth:up`).
- Aplica as migrations do Prisma (`pnpm db:migrate`).
- Executa o seed de dados (`pnpm db:seed`).
- Gera a especificação OpenAPI e o cliente frontend (`pnpm api:generate`).

Para iniciar os servidores de desenvolvimento:
```bash
pnpm dev
```
Acesse a aplicação em `http://localhost:5173`.

---

## 📝 3. Exercícios Práticos Sugeridos para Alunos

### Exercício 1: Criação de um Novo Módulo Completo
- **Desafio:** Implementar um módulo de *Projetos*, *Cursos* ou *Produtos*.
- **Critérios de Aceite:**
  - Modelo Prisma com `ownerId` e `deletedAt`.
  - Migration versionada com consultas SQL numeradas.
  - Endpoints REST com `TasksService` e `TasksController` protegidos por autenticação.
  - Geração do cliente Orval e exibição em tela React com paginação, busca e filtros.
  - Testes unitários cobrindo o serviço e a página.

### Exercício 2: Extensão de Regras de Negócio
- **Desafio:** No módulo `tasks`, implementar a regra: *"Tarefas com prioridade URGENTE devem obrigatoriamente possuir uma data limite (dueDate) definida para até no máximo 7 dias no futuro."*
- **Critérios de Aceite:**
  - Validação no `TasksService` lançando `BadRequestException`.
  - Teste unitário correspondente em `tasks.service.spec.ts`.
  - Mensagem de feedback visível na interface do usuário.

---

## 📊 4. Checklist de Avaliação e Correção Automática

Você pode rodar uma verificação rápida e objetiva no repositório de qualquer aluno:
```bash
pnpm check:all
```
O script verifica automaticamente:
1. Se todos os testes unitários do aluno estão passando (`apps/api test` e `apps/web test`).
2. Se o build do frontend compila sem erros de tipos TypeScript (`apps/web build`).
3. Se os contratos OpenAPI estão sincronizados com a API (`api:check`).
4. Se a integridade documental foi mantida (`docs:check`).
