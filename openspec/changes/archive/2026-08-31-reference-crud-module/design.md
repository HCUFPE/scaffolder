## Context

O módulo de referência deve ser pequeno o bastante para ser estudado, mas completo o bastante para servir de molde para outras funcionalidades.

## Goals / Non-Goals

**Goals:**
- Demonstrar CRUD completo ponta a ponta.
- Modelar paginação, busca, ordenação e ownership.
- Incluir ao menos uma regra de negócio não trivial.
- Provar a feature com testes em múltiplas camadas.

**Non-Goals:**
- Criar um domínio complexo.
- Cobrir casos de uso específicos de uma aplicação derivada.

## Decisions

- Usar `tasks` como domínio simples e neutro.
- Implementar remoção lógica em vez de exclusão física padrão.
- Aplicar política de proprietário com exceção administrativa documentada.
- Usar o módulo como exemplo oficial de arquitetura full stack do template.

## Risks / Trade-offs

- **Exemplo simples demais** → Incluir busca, paginação e uma regra de negócio real.
- **Exemplo complexo demais** → Limitar o domínio a um CRUD administrativo/transacional básico.
- **Remoção do módulo quebrar o template** → Documentar dependências e passos de remoção.
