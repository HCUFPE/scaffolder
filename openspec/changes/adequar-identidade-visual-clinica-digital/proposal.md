## Why

A interface web ainda apresenta a identidade genérica AppStart, com marca temporária, tipografia de sistema e predominância de azul/slate, enquanto o produto precisa refletir de forma consistente o Manual de Identidade Visual da Clínica Digital UFPE. A adequação deve começar antes da chegada dos arquivos oficiais, reservando espaços dimensionais estáveis que permitam substituir placeholders por logotipos definitivos sem retrabalho de layout.

## What Changes

- Introduzir uma identidade visual da Clínica Digital UFPE baseada na paleta, tipografia, hierarquia, iconografia e regras de contraste do manual.
- Criar slots de marca com dimensões explícitas para logótipo completo, versão reduzida, ícone-cruz, lockup NUTES/UFPE e favicon.
- Exibir placeholders identificados nesses slots até que os ativos oficiais sejam fornecidos, preservando tamanho, área de proteção e proporção durante a substituição.
- Substituir referências visíveis a `AS` e `AppStart` pela identidade da Clínica Digital UFPE nas superfícies destinadas ao produto, incluindo login, navegação, rodapé e metadados do navegador.
- Centralizar cores, tipografia e estados visuais em tokens semânticos, reduzindo o uso de classes de cor diretamente nas telas e componentes.
- Adequar botões, links, campos, cards, badges, tabelas, feedbacks e indicadores ao sistema visual institucional e aos requisitos de acessibilidade.
- Manter os fluxos responsivos e os temas existentes, condicionando o tema escuro a uma composição aprovada e baseada nas cores oficiais.
- Separar cores de feedback operacional das cores de maturidade digital, evitando que níveis de maturidade sejam usados como estados genéricos da aplicação.
- Adicionar validações automatizadas e visuais para dimensões dos slots, variantes de marca, contraste, responsividade e ausência da marca temporária.

## Capabilities

### New Capabilities

- `clinica-digital-visual-identity`: Define tokens institucionais, tipografia, slots dimensionais, placeholders substituíveis, variantes de marca, regras de aplicação e critérios de acessibilidade da identidade Clínica Digital UFPE.

### Modified Capabilities

- `reusable-ui-components`: Os componentes compartilhados passam a consumir tokens semânticos da marca e a oferecer variantes visuais institucionais consistentes.
- `oneui-dashboard-layout`: A estrutura de sidebar, cabeçalho, dashboard e rodapé mantém seu comportamento, mas passa a apresentar a marca Clínica Digital UFPE e os slots oficiais nos contextos responsivos.
- `web-data-and-feedback-patterns`: Os temas e estados de feedback passam a obedecer aos tokens institucionais, preservar contraste e distinguir feedback operacional de maturidade digital.

## Impact

- Frontend React em `apps/web`, especialmente estilos globais, metadados, contexto de tema, layout autenticado, login, dashboard e componentes de UI.
- Novos componentes e testes para slots, placeholders e futuras imagens oficiais.
- Inclusão futura de arquivos SVG/PNG oficiais sem alteração das APIs dos componentes consumidores.
- Nenhuma mudança prevista na API NestJS, banco de dados, autenticação ou contratos OpenAPI.
- A substituição dos ativos temporários dependerá do fornecimento dos arquivos oficiais pelo NUTES/UFPE e de validação visual pela coordenação da marca.
