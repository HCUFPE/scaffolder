## MODIFIED Requirements

### Requirement: Screens must expose key user experience states
The system MUST provide loading, empty, error, and success states for data-driven screens, MUST provide contextual feedback for completed or rejected actions, and MUST render those states through shared semantic feedback variants that combine color with text or iconography.

#### Scenario: Rendering a data list with no records
- **WHEN** a data-driven screen receives an empty successful response
- **THEN** the interface shows a branded empty state instead of a blank page

#### Scenario: Rendering operational feedback
- **WHEN** a data-driven action is loading, completed, rejected, or requires attention
- **THEN** the feedback uses the corresponding operational variant with a textual or accessible indication and does not reuse a digital maturity level as its meaning

### Requirement: Theme and responsive behavior must be available
The system MUST support light and dark themes, MUST resolve both themes through the approved semantic visual tokens, and MUST keep core flows and brand slots usable on mobile and desktop layouts.

#### Scenario: Changing the UI theme
- **WHEN** a user selects a theme preference or follows the system preference
- **THEN** the application renders the chosen light or dark theme consistently with the Clínica Digital UFPE tokens and readable contrast

#### Scenario: Rendering brand identity responsively
- **WHEN** a viewport cannot fit the complete brand variant at its configured dimensions
- **THEN** the interface selects a reduced or compact slot without cropping or compressing the complete asset
