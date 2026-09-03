## ADDED Requirements

### Requirement: The application must provide a categorized collapsible sidebar
The system MUST organize sidebar navigation into named section headings, support single-click collapse/expand with persistence, and display icon-only mode when collapsed.

#### Scenario: Navigating through categorized sections
- **WHEN** an authenticated user opens the sidebar
- **THEN** navigation links are organized under clear category headings with distinctive active state highlights

#### Scenario: Collapsing the sidebar
- **WHEN** the user clicks the collapse button
- **THEN** the sidebar shrinks to compact icon mode and remembers the user's preference across reloads

### Requirement: The top bar must include a user profile dropdown
The system MUST provide a user profile menu in the top navigation bar with a summary card and direct action links.

#### Scenario: Opening user dropdown menu
- **WHEN** an authenticated user clicks their profile avatar in the header
- **THEN** a dropdown appears displaying user identity, role badge, account management link, and logout option

### Requirement: The dashboard must feature welcome hero and segmented stat cards
The system MUST render a greeting hero section with contextual summary and stat cards with dual-layer layout (metrics on top, action link on bottom footer).

#### Scenario: Viewing the dashboard page
- **WHEN** an authenticated user lands on the dashboard
- **THEN** the page displays the personalized welcome message and stat blocks with quick-navigation links
