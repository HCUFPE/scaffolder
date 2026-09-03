## Why

O AppStart precisa evitar divergência entre backend e frontend. Um contrato de API consistente, validado e gerador de cliente é essencial para manter tipos, rotas e erros alinhados.

## What Changes

- Padronizar a API REST sob `/api/v1`.
- Validar DTOs globalmente e rejeitar propriedades indevidas.
- Gerar especificação OpenAPI válida e completa.
- Gerar cliente TypeScript automaticamente e verificar divergência na CI.
- Padronizar paginação, serialização temporal, erros e proteção CSRF.

## Capabilities

### New Capabilities
- `versioned-rest-contract`: contrato REST versionado com validação e convenções de resposta.
- `generated-api-client`: geração e verificação do cliente TypeScript a partir do OpenAPI.

### Modified Capabilities

## Impact

- Bootstrap da API NestJS.
- DTOs e filtros globais.
- Pipeline de CI para OpenAPI e cliente.
- Consumo de API no frontend.
