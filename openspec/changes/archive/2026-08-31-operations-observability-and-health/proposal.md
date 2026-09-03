## Why

Um template utilizável em ambientes reais precisa expor saúde, logs e diagnósticos consistentes. Esses recursos também ajudam alunos a entender operação, monitoração e troubleshooting desde o início.

## What Changes

- Adicionar health checks de liveness e readiness.
- Padronizar `requestId` por requisição.
- Definir logs locais legíveis e logs de produção em JSON.
- Redigir segredos em logs.
- Prever integração opcional com monitoramento de erros.

## Capabilities

### New Capabilities
- `service-health-endpoints`: health checks separados para liveness e readiness.
- `structured-request-observability`: correlação de requisições, logging estruturado e redação de segredos.

### Modified Capabilities

## Impact

- Bootstrap HTTP da API.
- Middleware/interceptors de logging.
- Endpoints `/health/*`.
- Configuração opcional de monitoramento.
