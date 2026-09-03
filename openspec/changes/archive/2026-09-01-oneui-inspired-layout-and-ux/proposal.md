## Why

Para elevar o nível de acabamento profissional e a usabilidade pedagógica do AppStart, o layout visual da aplicação web precisa evoluir para o padrão consolidado por frameworks como o OneUI: organização categórica na barra lateral, dropdown sofisticado de perfil e ações no cabeçalho superior, blocos de estatísticas em duas partes com ícones em containers arredondados e seções de hero acolhedoras.

## What Changes

- **Sidebar Categórica com Seções:** Agrupamento de itens de menu com títulos de seção em caixa alta (`GERAL`, `CADASTROS`, `SISTEMA`), estado ativo com realce e modo compacto com tooltips.
- **Header Superior Estilo OneUI:**
  - Dropdown de perfil de usuário com mini-card contendo avatar, nome, e-mail, badge de papel e ações rápidas (Perfil, Console Keycloak e Logout destacado).
  - Barra de busca global rápida no topo com foco intuitivo.
  - Indicador de tema e notificações contextuais.
- **Hero de Boas-Vindas no Dashboard:** Saudação personalizada ao usuário logado com métricas rápidas e atalhos contextuais.
- **Cards de Métricas e Estatísticas em Dois Níveis:**
  - Nível superior com número em destaque, rótulo e ícone temático em container arredondado com fundo suave.
  - Faixa inferior com link de ação rápida para a visualização completa.
- **Padronização de Componentes de Bloco:** Harmonização de bordas, sombras sutis (`shadow-xs`), tipografia e espaçamentos consistentes em modo claro e escuro.

## Capabilities

### New Capabilities
- `oneui-dashboard-layout`: Padrões de layout, sidebar categorizada, header com user dropdown e blocos de estatísticas inspirados no OneUI.

### Modified Capabilities
- `authenticated-web-shell`: O cabeçalho e a barra lateral do shell autenticado passam a incorporar o dropdown de perfil e agrupamentos visuais refinados.

## Impact

- `apps/web/src/components/layout/auth-layout.tsx`
- `apps/web/src/components/ui/` (novos componentes de bloco/stats ou dropdown)
- `apps/web/src/pages/dashboard-page.tsx`
- Testes unitários do frontend em `apps/web/src/`
- Documentação de arquitetura e integridade
