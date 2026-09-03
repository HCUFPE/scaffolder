## Context

A comunicação entre frontend e backend deve ser guiada por um contrato único. O AppStart também precisa padronizar erros, paginação e proteção de mutações autenticadas por cookie.

## Goals / Non-Goals

**Goals:**
- Expor API versionada e documentada por OpenAPI.
- Validar entradas globalmente com whitelist.
- Gerar cliente TypeScript a partir do contrato.
- Garantir paginação e serialização consistentes.
- Exigir proteção CSRF para mutações autenticadas por cookie.

**Non-Goals:**
- Substituir REST por GraphQL.
- Manter clientes manuais duplicando tipos.

## Decisions

- Usar `/api/v1` como prefixo obrigatório.
- Aplicar validação global de DTOs e envelope de erro inspirado em Problem Details.
- Gerar o cliente automaticamente e falhar CI quando houver diff.
- Tratar datas em ISO 8601 UTC.
- Proteger mutações com token CSRF e validação de origem.

## Risks / Trade-offs

- **OpenAPI incompleto** → Cobrir endpoints protegidos e respostas relevantes com testes/checagem.
- **Cliente desatualizado** → Adicionar verificação dedicada na CI.
- **CSRF mal configurado** → Definir política explícita e testar fluxo mutável.
