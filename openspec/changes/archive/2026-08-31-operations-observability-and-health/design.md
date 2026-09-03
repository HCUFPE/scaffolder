## Context

Observabilidade é necessária tanto para produção quanto para ensino. O AppStart deve demonstrar a diferença entre processo vivo, serviço pronto, logs correlacionáveis e proteção de dados sensíveis.

## Goals / Non-Goals

**Goals:**
- Expor endpoints distintos de liveness e readiness.
- Incluir `requestId` em logs e respostas de erro.
- Produzir logs JSON em produção e legíveis localmente.
- Redigir credenciais, cookies, tokens e hashes.

**Non-Goals:**
- Implementar uma plataforma completa de tracing distribuído nesta fase.
- Tornar serviços externos obrigatórios para observabilidade básica.

## Decisions

- Separar health check de processo e health check dependente de banco.
- Introduzir correlação de requisições desde a borda HTTP.
- Adequar formato de log ao ambiente.
- Tratar integração com monitoramento como opcional e configurável.

## Risks / Trade-offs

- **Health check mascarar falhas reais** → Readiness consulta dependências essenciais.
- **Logs vazarem segredos** → Aplicar filtros/redaction automáticos.
- **Ruído excessivo em desenvolvimento** → Usar formato humano localmente.
