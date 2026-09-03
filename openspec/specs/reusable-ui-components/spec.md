# reusable-ui-components Specification

## Purpose
Biblioteca modular de componentes React reutilizáveis no frontend (`apps/web/src/components/ui/`), encapsulando blocos de estatísticas em duas camadas, banners de cabeçalho com ações, dropdowns de perfil e campos de formulários acessíveis.

## Requirements

### Requirement: The application must provide modular, reusable React UI components
The frontend codebase MUST encapsulate common design patterns into reusable React components located in `apps/web/src/components/ui/`.

#### Scenario: Using StatCard for metrics
- **WHEN** a dashboard or module requires a two-layer metric card
- **THEN** the view uses the `<StatCard />` component with typed props for value, label, icon, colors, and action links

#### Scenario: Using PageHeader for banners
- **WHEN** a page renders its top title and action buttons
- **THEN** the view uses the `<PageHeader />` component for consistent typography, hierarchy, and action slots

#### Scenario: Using UserDropdown for user profile
- **WHEN** the authenticated layout displays the user profile
- **THEN** the layout uses the `<UserDropdown />` component for avatar popover and quick actions
