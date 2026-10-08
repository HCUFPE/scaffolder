## MODIFIED Requirements

### Requirement: The application must provide modular, reusable React UI components
The frontend codebase MUST encapsulate common design patterns into reusable React components located in `apps/web/src/components/ui/`, and those components MUST consume semantic visual tokens instead of embedding page-specific brand colors.

#### Scenario: Using StatCard for metrics
- **WHEN** a dashboard or module requires a two-layer metric card
- **THEN** the view uses the `<StatCard />` component with typed props for value, label, icon, semantic tone, and action links

#### Scenario: Using PageHeader for banners
- **WHEN** a page renders its top title and action buttons
- **THEN** the view uses the `<PageHeader />` component for consistent branded typography, hierarchy, and action slots

#### Scenario: Using UserDropdown for user profile
- **WHEN** the authenticated layout displays the user profile
- **THEN** the layout uses the `<UserDropdown />` component for avatar popover and quick actions styled through semantic tokens

#### Scenario: Using a brand asset slot
- **WHEN** a page or layout needs a logo, compact icon, institutional lockup, or placeholder
- **THEN** it uses the shared typed brand slot component instead of declaring an independent image box
