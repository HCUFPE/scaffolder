## Context

Autorização precisa ser simples de ensinar e difícil de contornar. O backend deve permanecer como fonte de verdade, enquanto o frontend melhora a experiência escondendo ações incompatíveis.

## Goals / Non-Goals

**Goals:**
- Proteger endpoints por padrão.
- Implementar RBAC inicial com `USER` e `ADMIN`.
- Ocultar ou desabilitar ações não permitidas na interface.
- Impedir autoelevação de papel.

**Non-Goals:**
- Implementar um motor completo de políticas granulares nesta fase.
- Confiar em validação somente do frontend.

## Decisions

- Aplicar guarda global de autenticação com exceção explícita para rotas públicas.
- Modelar papéis por decorator e guard específicos.
- Restringir campos sensíveis em DTOs de autoatendimento.
- Tratar o frontend como camada de conveniência, não de segurança.

## Risks / Trade-offs

- **Lógica de autorização espalhada** → Centralizar em guards, serviços e helpers de política.
- **Ações visíveis mas não permitidas** → Sincronizar estado de papel no frontend com endpoints protegidos.
- **Mass assignment** → Whitelist estrita e DTOs separados.
