## Why

A base precisa adotar segurança por padrão no acesso às rotas e às ações de interface. Sem uma política explícita de proteção, os times correm o risco de introduzir brechas de autorização logo no início do projeto.

## What Changes

- Tornar endpoints privados por padrão.
- Definir guard e decorator para papéis.
- Validar autorização exclusivamente no backend.
- Restringir ações administrativas na interface.
- Impedir elevação de privilégio por payload de autoatendimento.

## Capabilities

### New Capabilities
- `backend-access-control`: proteção padrão, papéis e validação de autorização no backend.
- `frontend-access-awareness`: adaptação da interface ao contexto de autenticação e papel do usuário.

### Modified Capabilities

## Impact

- Guards e decorators do NestJS.
- DTOs de entrada e regras de mass assignment.
- Navegação e ações do frontend.
