## Context

O frontend React usa uma composição visual inspirada no OneUI, com cores Tailwind aplicadas diretamente nos componentes, tipografia de sistema e a identidade temporária `AS/AppStart`. O Manual de Identidade Visual da Clínica Digital UFPE define a paleta institucional, Arial para sistemas, aplicações permitidas da marca e tamanhos mínimos digitais, mas os arquivos oficiais ainda não estão disponíveis no repositório.

A mudança atravessa estilos globais, componentes compartilhados, login, shell autenticado, dashboard, metadados do navegador e testes. O layout precisa ficar pronto antes dos ativos finais e deve permitir que a troca de um placeholder pelo arquivo oficial não altere dimensões, alinhamento ou responsividade.

## Goals / Non-Goals

**Goals:**

- Aplicar a identidade Clínica Digital UFPE por meio de tokens semânticos reutilizáveis.
- Reservar slots de marca com largura e altura explícitas em cada contexto da interface.
- Exibir placeholders neutros e identificados enquanto os ativos oficiais estiverem ausentes.
- Permitir a substituição dos placeholders por SVG/PNG oficiais sem modificar os consumidores nem provocar reflow.
- Preservar os comportamentos existentes de navegação, autenticação, responsividade e tema.
- Tornar contraste, dimensão, variante e uso da marca verificáveis por testes e revisão visual.

**Non-Goals:**

- Recriar o logótipo, o ícone-cruz, o brasão da UFPE ou o lockup do NUTES com HTML, CSS ou ícones genéricos.
- Extrair imagens do PDF do manual para uso como ativos de produção.
- Alterar API, autenticação, banco de dados ou regras de autorização.
- Redesenhar os fluxos funcionais de tarefas, usuários ou perfil.
- Definir uma nova convenção institucional sem aprovação para cores de feedback que não estejam cobertas pelo manual.

## Decisions

### 1. Tokens semânticos serão a única fonte de cores institucionais

Os estilos globais definirão tokens para roxo profundo (`#4D0C74`), roxo principal (`#69139D`), roxo escuro (`#331549`), ciano escuro (`#0A7C90`), ciano claro (`#3FBFD1`), cinza de texto (`#58595B`), cinza claro (`#E9E9EC`) e branco (`#FFFFFF`). Componentes usarão nomes semânticos, como `brand-primary`, `surface-muted`, `text-secondary` e `focus-ring`, em vez de classes `blue-*`, `slate-*` ou `indigo-*`.

Isso concentra ajustes de contraste e tema em um único lugar. A alternativa de substituir classes cor a cor manteria decisões visuais dispersas e dificultaria governança futura.

### 2. Arial será a fonte corrente da aplicação

O `body`, controles e componentes herdarão Arial com fallback sans-serif. Nenhuma fonte externa será adicionada nesta mudança, porque o manual já determina Arial para sistemas e a fonte de destaque não está confirmada.

### 3. Um componente de slot desacoplará layout e arquivo de marca

Será criado um componente tipado, provisoriamente denominado `BrandAssetSlot`, com variantes `header`, `login`, `compact`, `reduced`, `institutional-lockup` e `favicon`. Cada variante resolve:

| Variante | Área de conteúdo | Uso |
|---|---:|---|
| `header` | 160 x 56 px | Sidebar expandida ou cabeçalho autenticado |
| `login` | 240 x 84 px | Identidade central da tela de login |
| `compact` | 32 x 32 px | Sidebar recolhida e avatar de marca |
| `reduced` | 120 x 42 px | Cabeçalhos em telas estreitas |
| `institutional-lockup` | 220 x 48 px | Rodapé NUTES/UFPE |
| `favicon` | 32 x 32 px | Ativo-base do favicon |

As dimensões são decisões de layout da aplicação. A área de proteção fica fora da área de conteúdo e será aplicada pelo contêiner do componente, sem permitir sobreposição por texto, borda ou ícone adjacente.

O componente receberá uma origem opcional por meio de um registro central de ativos. Sem origem, renderizará um placeholder com contorno neutro, nome do ativo e dimensão esperada. Com origem, renderizará a imagem usando `object-fit: contain`, largura e altura de 100%, sem corte, deformação ou alteração do slot.

A alternativa de espalhar `<img>` e placeholders por cada tela foi rejeitada porque duplicaria regras dimensionais e tornaria a substituição dos arquivos propensa a divergências.

### 4. O registro de ativos permitirá uma troca localizada

Um módulo único mapeará cada variante para um arquivo opcional. Inicialmente, as entradas ficarão sem arquivo oficial e o componente usará placeholders. Quando os ativos forem recebidos, a implementação deverá adicionar os arquivos à área de assets e atualizar somente esse registro.

O placeholder não tentará imitar a marca. Ele será claramente identificado como provisório e terá texto alternativo apropriado ao contexto.

### 5. A aplicação da marca seguirá o contexto responsivo

- A tela de login usará o slot `login`.
- A sidebar expandida usará `header`; a recolhida usará `compact`.
- Em largura insuficiente, o shell usará `reduced` ou `compact`, sem comprimir a marca completa.
- O rodapé usará `institutional-lockup`.
- O documento HTML usará o nome Clínica Digital UFPE e um placeholder de favicon até a chegada do ícone oficial.

Referências visíveis a AppStart serão removidas das superfícies do produto. Nomes internos de pacote e compatibilidade de chaves de armazenamento poderão permanecer temporariamente quando sua troca causar migração desnecessária; qualquer nova chave deverá preservar a preferência anterior do usuário.

### 6. Feedback operacional e maturidade digital serão domínios distintos

Os cinco níveis de maturidade terão tokens próprios e só poderão ser usados quando o dado representar maturidade. Loading, erro, aviso, sucesso e informação continuarão como variantes de feedback, sempre combinando texto e/ou ícone com cor. Cores operacionais não explicitamente aprovadas serão isoladas em tokens para futura revisão, sem serem apresentadas como parte da paleta de maturidade.

### 7. O tema escuro será preservado por tokens

O comportamento de seleção claro/escuro/sistema permanecerá. O tema claro será a referência principal do manual. O tema escuro usará superfícies e contraste derivados apenas dos tokens aprovados, priorizando roxo escuro, branco, cinza e ciano. A aprovação visual do tema escuro será um critério de aceite, não uma nova variação livre da marca.

### 8. A verificação combinará testes automatizados e revisão visual

Testes de componente verificarão dimensões, variante, fallback de placeholder, renderização de imagem, texto alternativo e ausência de deformação. Testes existentes serão atualizados para a nova identidade. A revisão visual cobrirá login, dashboard, tarefas, usuários e perfil em 360, 768 e 1440 px, nos temas aplicáveis.

## Risks / Trade-offs

- [As proporções dos ativos oficiais podem diferir dos slots] → Usar `object-fit: contain`, preservar o slot e aceitar espaço interno vazio em vez de cortar ou deformar a marca.
- [Os placeholders podem ser confundidos com ativos finais] → Exibir rótulo explícito de placeholder somente enquanto a origem oficial estiver ausente e documentar o registro de substituição.
- [A paleta oficial não cobre todos os estados operacionais atuais] → Isolar estados em tokens próprios, exigir texto/ícone e submeter sua composição à validação da coordenação.
- [O tema escuro pode ficar visualmente denso com poucos neutros aprovados] → Fazer do tema claro a referência, limitar o escuro às cores oficiais e validar todas as telas antes da entrega.
- [Remover AppStart pode afetar exemplos pedagógicos] → Alterar apenas superfícies destinadas ao produto; manter nomes técnicos internos quando não forem visíveis ou quando forem necessários à compatibilidade.
- [Mudanças amplas em classes visuais podem causar regressões] → Migrar primeiro os componentes compartilhados, depois as páginas, executando testes e inspeção responsiva a cada etapa.

## Migration Plan

1. Criar os tokens institucionais e a tipografia global sem remover os estilos antigos ainda usados.
2. Implementar o registro de ativos e `BrandAssetSlot` com testes de dimensões e fallback.
3. Migrar login, sidebar, cabeçalho, rodapé e metadados para a nova identidade e placeholders.
4. Migrar componentes compartilhados e, em seguida, as páginas, eliminando classes de cor não institucionais do caminho principal.
5. Validar testes, build, responsividade, contraste e temas.
6. Quando os ativos oficiais chegarem, adicioná-los ao registro, repetir a revisão visual e remover apenas os rótulos provisórios.

Rollback: os commits devem separar fundação, slots, componentes e páginas, permitindo reverter a aplicação visual sem afetar contratos de API ou dados. A ausência de um arquivo oficial nunca deve impedir a renderização, pois o placeholder é o fallback previsto.

## Open Questions

- Quais serão os arquivos e proporções finais das variantes completa, reduzida, monocromática, ícone-cruz e lockup institucional?
- A coordenação aprova o tema escuro composto apenas com os tokens oficiais ou prefere limitar a primeira entrega ao tema claro?
- Qual token será aprovado para sucesso operacional, já que a paleta de maturidade não deve ser reutilizada como feedback genérico?
- O slogan institucional deve aparecer na tela de login ou permanecer restrito a materiais de comunicação?
