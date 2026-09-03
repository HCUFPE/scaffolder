## Context

O AppStart pretende reduzir esforço incidental no início de projetos acadêmicos. Hoje, alunos ainda podem errar ao copiar o template, editar placeholders, criar `.env`, inicializar git e instalar dependências. O scaffolding guiado formaliza esse fluxo como parte do produto, em vez de tratá-lo como etapa informal.

## Goals / Non-Goals

**Goals:**
- Oferecer criação guiada de projeto derivado com um único comando.
- Manter o template original intacto.
- Solicitar os dados mínimos do novo projeto e aplicá-los automaticamente.
- Gerar `.env` inicial, instalar dependências e orientar próximos passos.
- Permitir futura execução em modo não interativo.

**Non-Goals:**
- Substituir todo o bootstrap do ambiente por completo dentro do scaffolding.
- Virar um gerador genérico para qualquer stack.
- Implementar interface gráfica para criação de projetos.

## Decisions

- Tratar o scaffolding como recurso oficial do template, não como script auxiliar.
- Adotar um fluxo de cópia do template para diretório de destino, evitando mutação do boilerplate base.
- Separar três responsabilidades: coleta de parâmetros, materialização do projeto e instruções pós-criação.
- Exigir mensagens pedagógicas e validações amigáveis para pré-requisitos e erros comuns.
- Projetar a interface do comando para aceitar prompts e, futuramente, flags não interativas.

## Risks / Trade-offs

- **Fluxo excessivamente rígido** → manter conjunto mínimo de perguntas e permitir expansão futura por flags.
- **Dependência de placeholders espalhados** → concentrar os pontos de substituição e documentá-los.
- **Falha em ambientes heterogêneos** → validar pré-requisitos antes da cópia e documentar troubleshooting por plataforma.
- **Expectativa de automação total** → deixar explícito o que o scaffolding cobre e o que continua sob `pnpm setup`.

## Migration Plan

1. Definir o contrato do scaffolding no SRD e na documentação.
2. Implementar `setup.sh` ou comando equivalente no template.
3. Integrar geração de `.env`, inicialização de git e instalação de dependências.
4. Atualizar README, jornada inicial e guia docente.
5. Adicionar testes básicos do fluxo e validação dos cenários principais.

## Open Questions

- O comando oficial permanecerá como `./setup.sh` ou também haverá alias via package manager?
- O bootstrap inicial do banco deverá ser opcionalmente executado dentro do scaffolding?
- Quais parâmetros devem ser obrigatórios em modo não interativo na primeira versão?
