## ADDED Requirements

### Requirement: The template must include a reference CRUD module
The system MUST include a reference module named `tasks` or an equivalent neutral domain that works immediately after the development seed.

#### Scenario: Exploring the seeded application
- **WHEN** a developer starts the application after setup
- **THEN** the reference CRUD module is available without additional configuration

### Requirement: The reference module must demonstrate a full CRUD lifecycle
The system MUST allow creation, listing, retrieval, update, and logical removal of reference records through the API and the web interface.

#### Scenario: Managing a reference record end to end
- **WHEN** an authenticated user creates, edits, and removes a reference record
- **THEN** the API and interface complete the full CRUD lifecycle consistently

### Requirement: The reference module must demonstrate list behavior and business validation
The system MUST support pagination, search, ordering, DTO validation, and at least one non-trivial business rule in the reference module.

#### Scenario: Listing reference records with search and ordering
- **WHEN** a user requests the reference list with paging, search, and ordering parameters
- **THEN** the system returns the filtered and ordered paginated result

### Requirement: Reference records must enforce ownership rules
The system MUST associate each reference record with an owner and MUST restrict unauthorized changes to other users' records according to the defined policy.

#### Scenario: Editing another user's record without permission
- **WHEN** a regular user attempts to update a record owned by someone else
- **THEN** the system rejects the change
