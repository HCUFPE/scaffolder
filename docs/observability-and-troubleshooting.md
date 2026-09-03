# Guia de Operações, Observabilidade e Troubleshooting

Este documento descreve os mecanismos de saúde, correlação, logs e resolução de problemas da API do **AppStart**.

---

## 1. Verificações de Saúde (Health Checks)

A API expõe dois endpoints HTTP na raiz de infraestrutura (isentos do prefixo de negócio `/api/v1`):

### 1.1 Liveness (`GET /health/live`)
- **Finalidade:** Indica se o processo Node.js/NestJS está vivo e aceitando conexões HTTP.
- **Dependências externas:** Nenhuma (não consulta banco nem provedor de identidade).
- **Resposta:**
  ```json
  { "status": "live" }
  ```
- **Uso em orquestradores (Kubernetes / Docker Compose):** Configurar como `livenessProbe`.

### 1.2 Readiness (`GET /health/ready`)
- **Finalidade:** Indica se a API está pronta para receber tráfego de negócio, validando a conectividade com o banco de dados PostgreSQL via Prisma.
- **Resposta quando saudável (HTTP 200):**
  ```json
  {
    "status": "ready",
    "checks": {
      "database": "up"
    }
  }
  ```
- **Resposta quando não saudável (HTTP 503):**
  ```json
  {
    "type": "https://appstart.example/problems/database-unavailable",
    "title": "Serviço indisponível",
    "status": 503,
    "detail": "Não foi possível estabelecer comunicação com o banco de dados.",
    "instance": "/health/ready",
    "code": "DATABASE_UNAVAILABLE",
    "timestamp": "2026-08-31T20:00:00.000Z",
    "checks": {
      "database": "down"
    }
  }
  ```
- **Uso em orquestradores:** Configurar como `readinessProbe`.

---

## 2. Correlação de Requisições (`requestId`)

- Cada requisição HTTP processada recebe um identificador único de rastreamento (`requestId`).
- Se o cliente enviar o cabeçalho `x-request-id`, este valor será reutilizado; caso contrário, a API gera um UUID v4 automaticamente.
- O `requestId` é retornado no cabeçalho de resposta `x-request-id`, incluído em todos os logs e presente no envelope de erro *Problem Details* (`requestId: "..."`).

---

## 3. Logs Estruturados e Redação de Segredos

### 3.1 Formato por Ambiente
- **Desenvolvimento (`NODE_ENV=development`):** Logs coloridos e legíveis para humanos:
  ```text
  [HTTP] GET /api/v1/auth/me 200 +4ms [0a1b2c3d-...]
  ```
- **Produção (`NODE_ENV=production`):** Logs emitidos como linhas JSON estruturadas para ingestão automática (Datadog, Loki, CloudWatch):
  ```json
  {"level":"info","timestamp":"2026-08-31T20:00:00.000Z","requestId":"0a1b2c3d-...","method":"GET","url":"/api/v1/auth/me","statusCode":200,"durationMs":4,"ip":"127.0.0.1","userAgent":"..."}
  ```

### 3.2 Redação Automática de Dados Sensíveis
Todos os logs passam por filtro de higienização que substitui campos sensíveis por `[REDACTED]`:
- Senhas (`password`, `passwordHash`)
- Tokens e chaves (`token`, `accessToken`, `refreshToken`, `idToken`, `tokenHash`)
- Cookies e cabeçalhos de autorização (`cookie`, `authorization`)
- Segredos de clientes OIDC (`clientSecret`, `adminClientSecret`, `secret`)

---

## 4. Monitoramento de Erros Opcional

A API suporta integração opcional com plataformas de monitoramento de exceções (ex.: Sentry):
- **Variável de ambiente:** `ERROR_MONITORING_DSN`
- Quando definida, exceções não tratadas (HTTP 500) são enviadas com o contexto da requisição (`requestId`, método, URL).

---

## 5. Troubleshooting (Resolução de Problemas Comuns)

| Sintoma | Causa Provável | Solução |
| :--- | :--- | :--- |
| `/health/ready` retorna 503 | Banco de dados PostgreSQL parado ou inacessível | Execute `pnpm db:up` ou verifique `DATABASE_URL` no `.env`. |
| Erro OIDC no login (`/api/v1/auth/callback`) | Keycloak indisponível ou realm não importado | Execute `pnpm auth:up` e verifique `KEYCLOAK_BASE_URL`. |
| Erro 403 em mutações autenticadas | Falha na validação de origem (CSRF) | Verifique se `WEB_BASE_URL` coincide com a URL de onde o frontend faz as requisições. |
| Divergência de cliente na CI (`pnpm api:check`) | Contrato da API alterado sem atualizar o cliente | Execute `pnpm api:generate` localmente e comite as alterações geradas. |
