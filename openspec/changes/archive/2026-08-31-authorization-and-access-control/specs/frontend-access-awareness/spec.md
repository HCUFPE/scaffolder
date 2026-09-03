## ADDED Requirements

### Requirement: The interface must reflect access restrictions
The system MUST hide or disable actions in the user interface when the current user does not have permission to perform them.

#### Scenario: Rendering an administrator action for a regular user
- **WHEN** the frontend renders a screen for a user without administrator privileges
- **THEN** administrator-only actions are hidden or disabled

### Requirement: Backend validation must remain authoritative
The system MUST not rely on frontend visibility rules as the sole authorization mechanism.

#### Scenario: Direct HTTP call bypassing the UI
- **WHEN** a user calls a restricted endpoint directly outside the interface
- **THEN** the backend still enforces the authorization rule
