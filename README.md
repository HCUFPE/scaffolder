# AppStart

Template pedagógico **high-opinionated** full stack para ensino e construção de aplicações web modernas com **NestJS**, **React**, **PostgreSQL (Prisma ORM)** e autenticação federada **Keycloak (OIDC)** via **Backend for Frontend (BFF)**.

---

## Destaques do Template

- **Arquitetura BFF Segura:** O frontend nunca manipula credenciais ou tokens JWT; a comunicação é protegida por cookies `HttpOnly` com sessões opacas salvas no banco e proteção contra CSRF.
- **Tipagem Estrita Ponta a Ponta:** Contrato exportado em **OpenAPI 3.0** com geração automática de cliente TypeScript via **Orval** (`@/lib/api-client`).
- **Interface React Moderna:** React 19, Vite 8, Tailwind CSS, tema claro/escuro com prevenção de *flicker*, gerenciamento de dados remotos com **TanStack Query** e formulários com **React Hook Form + Zod**.
- **Governança de Dados:** Migrações versionadas, controle de propriedade (*ownership*) e remoção lógica (*soft delete*).
- **Módulo CRUD de Referência:** Módulo `tasks` demonstrando fluxo ponta a ponta, regras de negócio e testes automatizados.
- **Tutor de IA Integrado:** Skills pedagógicas em `.agent/skills/` que orientam o aluno passo a passo na criação de novos módulos.

---

## Início Rápido (Setup em 1 Comando)

### Pré-requisitos
- **Node.js:** Versão 24 ou superior (`node -v`).
- **PNPM:** Versão 9 ou superior (`pnpm -v`).
- **Docker & Docker Compose:** Em execução (`docker info`).

### 1. Clonar e Instalar
```bash
# 1. Copiar variáveis de ambiente
cp .env.example .env

# 2. Executar setup completo (PostgreSQL + Keycloak + Migrations + Seed + Contratos)
pnpm setup

# 3. Iniciar servidores de desenvolvimento (API + Web)
pnpm dev
```

Acesse a aplicação em: **[http://localhost:5173](http://localhost:5173)**  
Documentação da API Swagger em: **[http://localhost:3100/api/v1/docs](http://localhost:3100/api/v1/docs)**

---

## Credenciais Padrão de Desenvolvimento

| Usuário | E-mail | Senha | Papel | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| **Administrador** | `admin@appstart.local` | `admin` (ou `ChangeMe123456!`) | `ADMIN` | Gestão de usuários e visão global |
| **Aluno / Usuário** | `user@appstart.local` | `aluno` (ou `ChangeMe123456!`) | `USER` | Autoatendimento e módulo de tarefas |

---

## Arquitetura do Sistema

```text
Browser (React SPA) <--- Cookies HttpOnly ---> NestJS API (BFF) <--- OIDC PKCE ---> Keycloak IdP
                                                     |
                                                     v
                                             PostgreSQL (Prisma)
                                        (Perfis, Sessões, Tasks)
```

---

## Documentação Técnica e Decisões (ADRs)

| Documento | Descrição |
| :--- | :--- |
| [docs/architecture-overview.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/architecture-overview.md) | Visão geral da arquitetura, topologia, diagramas Mermaid e catálogo de rotas |
| [docs/feature-development-guide.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/feature-development-guide.md) | Guia prático passo a passo para criar novas funcionalidades |
| [docs/testing-strategy-guide.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/testing-strategy-guide.md) | Pirâmide de testes, comandos, escopos e exemplos |
| [docs/educator-guide.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/educator-guide.md) | Manual para professores, preparação de turmas e exercícios práticos |
| [docs/reference-module-guidance.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/reference-module-guidance.md) | Guia do módulo de referência `tasks`, como renomear ou remover |
| [docs/observability-and-troubleshooting.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/observability-and-troubleshooting.md) | Logs estruturados, correlação `requestId` e health checks |
| [docs/glossary-and-concepts.md](file:///home/filipe/Documentos/Projetos/scaffolder/docs/glossary-and-concepts.md) | Glossário com explicações didáticas sobre BFF, OIDC, PKCE, CSRF e Soft Delete |
| [docs/decisions/](file:///home/filipe/Documentos/Projetos/scaffolder/docs/decisions/) | Registros de Decisão de Arquitetura (ADR-001 a ADR-006) |

---

## Skills de Apoio ao Desenvolvedor (AI Agents)

O repositório inclui skills pedagógicas prontas em `.agent/skills/`:
- **`appstart-feature-tutor`:** Tutor interativo que conduz o aluno passo a passo na criação de novas funcionalidades com checkpoints de validação.
- **`appstart-sync-docs`:** Sincronizador que audita e atualiza diagramas e documentações após alterações no código.
- **`appstart-architecture-review`:** Auditor de conformidade arquitetural e segurança.

---

## Mapa de Comandos do Repositório

```bash
# Desenvolvimento & Setup
pnpm setup          # Executa o provisionamento inicial completo
pnpm dev            # Inicia API (3100) e Web (5173) em paralelo
pnpm scaffold       # Scaffolding interativo para criar novos projetos derivados

# Banco de Dados & Migrations
pnpm db:up          # Sobe o PostgreSQL via Docker
pnpm db:down        # Para o PostgreSQL mantendo os volumes
pnpm db:migrate     # Aplica migrations do Prisma
pnpm db:seed        # Executa o seed de dados
pnpm db:studio      # Abre a interface visual do Prisma Studio

# Autenticação (Keycloak)
pnpm auth:up        # Sobe o Keycloak e PostgreSQL
pnpm auth:down      # Para o Keycloak

# Contrato & Type-Safety
pnpm api:generate   # Gera openapi.json e o cliente TypeScript via Orval
pnpm api:check      # Valida se o cliente gerado está sincronizado com a API

# Qualidade & Testes
pnpm test           # Executa os testes do backend e frontend
pnpm docs:check     # Valida a integridade dos guias, ADRs, rotas e modelos
pnpm check:all      # Validação completa (testes + build + api:check + docs:check)
```
