## ADDED Requirements

### Requirement: Remote data must follow shared frontend patterns
The system MUST use TanStack Query to manage remote data fetching, caching, and invalidation in the reference flows.

#### Scenario: Completing a CRUD mutation
- **WHEN** a mutation succeeds on a data-driven screen
- **THEN** the affected query state is refreshed without a full page reload

### Requirement: Reference forms must use shared validation tools
The system MUST use React Hook Form and Zod in the reference form flows.

#### Scenario: Validating a form before submission
- **WHEN** a user enters invalid data in a reference form
- **THEN** the interface blocks submission and shows field-level feedback

### Requirement: Screens must expose key user experience states
The system MUST provide loading, empty, error, and success states for data-driven screens and MUST provide contextual feedback for completed or rejected actions.

#### Scenario: Rendering a data list with no records
- **WHEN** a data-driven screen receives an empty successful response
- **THEN** the interface shows an empty state instead of a blank page

### Requirement: Theme and responsive behavior must be available
The system MUST support light and dark themes and MUST keep core flows usable on mobile and desktop layouts.

#### Scenario: Changing the UI theme
- **WHEN** a user selects a theme preference or follows the system preference
- **THEN** the application renders the chosen light or dark theme consistently
