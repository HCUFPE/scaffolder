## Context

O AppStart depende de uma jornada inicial simples: instalar dependências, copiar variáveis, preparar o banco e iniciar os serviços locais. Essa jornada precisa funcionar de forma previsível e expor diagnósticos claros quando o ambiente estiver incorreto.

## Goals / Non-Goals

**Goals:**
- Validar versões mínimas de Node.js e pnpm.
- Garantir bootstrap reproduzível com `pnpm setup`.
- Padronizar scripts `dev`, `db:up`, `db:down` e `db:studio`.
- Documentar falhas comuns de Docker, portas e ambiente.

**Non-Goals:**
- Empacotar ambiente completo via VM.
- Suportar bancos alternativos no fluxo principal.

## Decisions

- Centralizar validação de ambiente em scripts de raiz do monorepo.
- Tratar `.env.example` como contrato operacional do ambiente local.
- Fazer `pnpm setup` orquestrar subida do banco, espera por saúde, migrations e seed.
- Manter scripts de banco explícitos para operação e troubleshooting.

## Risks / Trade-offs

- **Falhas específicas por sistema operacional** → Documentar variações e validar em ao menos uma máquina por família.
- **Acoplamento do bootstrap ao Docker** → Assumir Docker como pré-requisito obrigatório do template.
- **Mensagens de erro pouco úteis** → Padronizar saídas de falha e documentação de suporte.
