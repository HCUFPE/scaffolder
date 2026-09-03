# Arquitetura alvo do AppStart

## Visão geral

O AppStart é um template acadêmico high-opinionated. Ele existe para remover decisões estruturais dos alunos e manter o foco em domínio, testes e evolução do sistema.

## Componentes principais

```text
apps/
├── api/     -> NestJS + Prisma + BFF de autenticação
└── web/     -> React/Vite

infra local:
- PostgreSQL
- Keycloak
```

## Diagrama alvo

```text
┌────────────┐
│  Browser   │
└─────┬──────┘
      │
      ▼
┌────────────┐
│ React Web  │
└─────┬──────┘
      │ /api
      ▼
┌─────────────────────┐
│ NestJS API / BFF    │
│ - sessão local      │
│ - RBAC              │
│ - ownership         │
└─────┬─────────┬─────┘
      │         │
      ▼         ▼
┌──────────┐  ┌────────────┐
│Keycloak  │  │ PostgreSQL │
└──────────┘  └────────────┘
```

## Decisões estruturais

### Banco
- PostgreSQL é o único banco padrão da baseline principal.
- O aluno não escolhe SQLite no fluxo principal.

### Persistência
- Prisma é a camada padrão da aplicação.
- Migrations são versionadas e executadas por script do template.

### Identidade
- Keycloak é o provedor padrão.
- O backend medeia o fluxo de autenticação.
- O frontend não depende de armazenar tokens OIDC.

### Sessão
- A aplicação mantém sessão local opaca por cookie `HttpOnly`.
- O cookie é a interface principal de autenticação usada pelo frontend.

### Autorização
- Papéis básicos vêm do provedor de identidade.
- Regras finas continuam no domínio da aplicação.

## Princípio pedagógico

O aluno deve conseguir responder estas perguntas rapidamente:
- onde fica a regra de negócio?
- onde fica a validação?
- onde fica a autorização?
- como o usuário autenticado chega ao service?

O aluno não precisa responder logo no início:
- como configurar um realm OIDC do zero?
- como desenhar toda a infraestrutura de autenticação?
- qual banco relacional escolher?

## Estado da implementação

A infraestrutura Docker de PostgreSQL + Keycloak, o provisionamento inicial de identidade, a API/BFF OIDC e a sessão local opaca já estão disponíveis. A integração visual do frontend e os módulos funcionais restantes continuam como partes incrementais da arquitetura alvo.
