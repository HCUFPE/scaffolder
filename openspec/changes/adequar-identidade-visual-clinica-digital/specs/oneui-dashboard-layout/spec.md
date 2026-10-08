## MODIFIED Requirements

### Requirement: The application must provide a categorized collapsible sidebar
The system MUST organize sidebar navigation into named section headings, support single-click collapse/expand with persistence, display icon-only mode when collapsed, and present the appropriate Clínica Digital UFPE brand slot for each sidebar state.

#### Scenario: Navigating through categorized sections
- **WHEN** an authenticated user opens the sidebar
- **THEN** navigation links are organized under clear category headings with distinctive active state highlights based on semantic brand tokens

#### Scenario: Collapsing the sidebar
- **WHEN** the user clicks the collapse button
- **THEN** the sidebar shrinks to compact icon mode, replaces the 160 x 56 px header brand slot with the 32 x 32 px compact slot, and remembers the user's preference across reloads

## ADDED Requirements

### Requirement: The authenticated shell must place institutional branding consistently
The authenticated shell MUST reserve the configured brand slots in navigation and footer without allowing surrounding controls or text to overlap their protected areas.

#### Scenario: Rendering the expanded authenticated shell
- **WHEN** the authenticated shell is displayed with an expanded sidebar
- **THEN** it shows the 160 x 56 px Clínica Digital UFPE header slot and the 220 x 48 px NUTES/UFPE lockup slot in the footer

#### Scenario: Rendering the shell on a narrow viewport
- **WHEN** the available width cannot accommodate the complete header brand slot
- **THEN** the shell uses the reduced or compact brand variant instead of scaling the complete logotype below its configured dimensions
