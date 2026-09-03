# Design: Layout & UX Inspirado no OneUI

## Contexto & Visão Geral
O OneUI é uma referência líder de design para painéis administrativos devido à sua arquitetura visual limpa e modular:
1. **Estrutura de Blocos (*Blocks*):** Toda informação é agrupada em contêineres com cabeçalho de seção claro e opções de ação.
2. **Separação de Navegação e Ações de Usuário:** A navegação principal fica na barra lateral esquerda categorizada por cabeçalhos, enquanto as ações do usuário (perfil, configurações de conta, logout e tema) residem no canto superior direito do Topbar.
3. **Cards de Métricas (*Stat Blocks*):** Blocos estatísticos com layout em duas partes: métrica + ícone em caixa destacada no topo e link de ação rápida no rodapé.

## Decisões de Arquitetura Visual

### 1. Barra Lateral (Sidebar)
- **Cabeçalho:** Logotipo com ícone de gradiente e texto institucional, acompanhado de um único botão de retração (`PanelLeftClose`/`PanelLeftOpen`).
- **Agrupamentos Categóricos:**
  - `VISÃO GERAL`: Início (`LayoutDashboard`).
  - `MÓDULOS & DADOS`: Tarefas CRUD (`ListTodo`), Gestão de Usuários (`Users` se ADMIN).
  - `MINHA CONTA`: Meu Perfil (`User`), Console Keycloak (`ExternalLink`).
- **Estados Visuais:**
  - Item Ativo: Gradiente `from-blue-600 to-indigo-600` com texto branco e sombra azul suave.
  - Item Inativo: Texto slate suave com transição de hover em fundo cinza claro / cinza escuro.
  - Modo Compacto: Ícones centralizados com tooltips nativos.

### 2. Cabeçalho Superior (Topbar)
- **Lado Esquerdo:** Botão mobile (apenas telas pequenas) e barra de busca global estilizada.
- **Lado Direito:**
  - Alternador de Tema Claro / Escuro / Sistema.
  - **User Dropdown Popover:**
    * Ao clicar no avatar/nome, exibe um menu suspenso com cabeçalho contendo o avatar em gradiente, nome completo, e-mail e badge de papel (`ADMIN`/`USER`).
    * Opções: Link para *Meu Perfil*, Link para *Central de Contas Keycloak*.
    * Divisor visual e botão de *Encerrar Sessão (Logout)* estilizado em vermelho suave.

### 3. Hero de Boas-Vindas & Métricas no Dashboard
- **Hero Section:** Mensagem acolhedora com o primeiro nome do usuário e resumo do status da sessão.
- **Stat Cards (OneUI Style):**
  - Card 1: Total de Tarefas Ativas com ícone em container arredondado e link *"Gerenciar Tarefas →"*.
  - Card 2: Tarefas Concluídas com badge verde e atalho.
  - Card 3: Usuários Cadastrados (visível para Admin) com link para `/users`.
  - Card 4: Status do Sistema e Sessão com indicador de integridade.

## Testabilidade e Compatibilidade
- Manutenção de 100% dos testes unitários do frontend (`vitest run`).
- Validação de acessibilidade com ARIA labels nos botões de dropdown e retração de menu.
- Suporte a tema claro e escuro sem quebra de contraste.
