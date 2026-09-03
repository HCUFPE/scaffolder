## ADDED Requirements

### Requirement: The project must document testing practices
The system MUST provide a test guide that explains commands, scope, and examples for unit, integration, and end-to-end testing.

#### Scenario: Choosing how to test a change
- **WHEN** a contributor reads the test guide
- **THEN** the contributor can identify which test command and scope to use

### Requirement: Architectural decisions must be recorded
The system MUST record key architectural decisions as ADRs for topics such as the database, authentication, monorepo structure, and API contract.

#### Scenario: Reviewing a major technical decision
- **WHEN** a maintainer inspects the ADR collection
- **THEN** the maintainer can understand the rationale behind key architectural choices

### Requirement: Documentation must distinguish environments and audiences
The system MUST clearly distinguish development and production guidance and MUST provide support material for instructors and maintainers.

#### Scenario: Reading deployment-related guidance
- **WHEN** a maintainer reads operational documentation
- **THEN** development examples are clearly separated from production guidance
