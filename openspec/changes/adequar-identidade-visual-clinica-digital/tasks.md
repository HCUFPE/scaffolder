## 1. Fundação visual

- [x] 1.1 Definir em `apps/web/src/index.css` os tokens semânticos da paleta institucional, da paleta de maturidade e dos estados operacionais isolados
- [x] 1.2 Aplicar Arial como tipografia corrente do documento, controles e componentes, mantendo fallback sans-serif
- [x] 1.3 Reconfigurar os tokens de tema claro e escuro para usar a identidade Clínica Digital UFPE sem alterar o comportamento do seletor de tema
- [x] 1.4 Adicionar testes ou verificações estáticas que detectem o retorno de cores de marca `blue-*`, `slate-*` e `indigo-*` nos componentes migrados

## 2. Slots e placeholders de marca

- [x] 2.1 Criar o registro central tipado de ativos oficiais, inicialmente sem origens configuradas
- [x] 2.2 Implementar o componente `BrandAssetSlot` com as variantes header 160 x 56, login 240 x 84, compact 32 x 32, reduced 120 x 42, institutional-lockup 220 x 48 e favicon 32 x 32
- [x] 2.3 Implementar o fallback provisório identificado, com dimensão visível, texto alternativo e área de proteção sem imitar a marca oficial
- [x] 2.4 Implementar a renderização de SVG/PNG com `object-fit: contain`, sem corte, deformação ou alteração das dimensões do slot
- [x] 2.5 Criar o placeholder de favicon e documentar a substituição futura de cada entrada do registro por um arquivo oficial
- [x] 2.6 Adicionar testes do `BrandAssetSlot` cobrindo dimensões, variantes, fallback, imagem configurada e preservação da área reservada

## 3. Identidade no shell da aplicação

- [x] 3.1 Substituir `AS/AppStart` no login pelo slot de 240 x 84 px e pela identificação textual Clínica Digital UFPE
- [x] 3.2 Substituir a marca da sidebar pelo slot de 160 x 56 px quando expandida e 32 x 32 px quando recolhida
- [x] 3.3 Aplicar as variantes reduced ou compact nos breakpoints que não comportarem a marca completa
- [x] 3.4 Adicionar o slot de lockup NUTES/UFPE de 220 x 48 px ao rodapé autenticado
- [x] 3.5 Atualizar título, metadados e favicon do documento para Clínica Digital UFPE sem alterar nomes técnicos internos desnecessariamente
- [x] 3.6 Preservar preferências existentes de tema e sidebar ao migrar ou introduzir novas chaves de armazenamento local

## 4. Componentes e páginas

- [x] 4.1 Migrar `Button`, `Input`, `FormField`, `Card` e links para tokens e variantes institucionais
- [x] 4.2 Migrar `Badge` e componentes de feedback para tons semânticos que combinem cor com texto ou ícone
- [x] 4.3 Migrar `PageHeader`, `StatCard`, `UserDropdown` e `ThemeToggle` para os tokens compartilhados
- [x] 4.4 Adequar dashboard, tarefas, usuários e perfil, removendo cores de marca aplicadas diretamente pelas páginas
- [x] 4.5 Aplicar cabeçalhos de tabela, superfícies, foco e hierarquia tipográfica conforme o manual, sem alterar os fluxos funcionais
- [x] 4.6 Garantir que tokens de maturidade só sejam usados por dados de maturidade e não por status genéricos da aplicação

## 5. Testes automatizados

- [x] 5.1 Atualizar testes de login e layout autenticado para a identificação Clínica Digital UFPE e os slots responsivos
- [x] 5.2 Atualizar testes de componentes afetados para as novas variantes semânticas e estados acessíveis
- [x] 5.3 Adicionar uma verificação de que superfícies do produto não exibem mais `AS` ou `AppStart` como marca visível
- [x] 5.4 Executar a suíte do frontend e corrigir regressões funcionais
- [x] 5.5 Executar o build de produção e confirmar que placeholders e metadados são incluídos corretamente

## 6. Validação visual e entrega

- [x] 6.1 Inspecionar login, dashboard, tarefas, usuários e perfil nos viewports de 360, 768 e 1440 px
- [x] 6.2 Verificar temas claro e escuro, contraste, foco por teclado e comunicação de estados sem dependência exclusiva de cor
- [x] 6.3 Confirmar que todos os placeholders mantêm dimensões exatas e não sofrem compressão, corte ou sobreposição
- [x] 6.4 Registrar capturas de homologação e conferir os resultados contra o checklist do Manual de Identidade Visual
- [x] 6.5 Documentar as questões pendentes de aprovação: ativos oficiais, tema escuro, cor de sucesso operacional e uso do slogan
- [x] 6.6 Validar a mudança OpenSpec e entregar a implementação pronta para futura troca localizada dos placeholders pelos ativos oficiais
