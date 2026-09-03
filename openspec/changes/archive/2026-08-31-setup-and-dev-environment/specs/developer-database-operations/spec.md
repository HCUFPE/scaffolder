## ADDED Requirements

### Requirement: Local database operations must be scriptable
The system MUST expose separate commands to start, stop, and inspect the local PostgreSQL instance used for development.

#### Scenario: Managing the local database lifecycle
- **WHEN** a developer runs `db:up`, `db:down`, or `db:studio`
- **THEN** the corresponding database operation is executed successfully or fails with a clear diagnostic

### Requirement: Setup guidance must cover supported platforms
The system MUST document the setup flow for Linux, macOS, and Windows environments using Docker Desktop or WSL2 where applicable.

#### Scenario: Reading setup documentation on a supported platform
- **WHEN** a developer follows the platform-specific setup guide
- **THEN** the developer can understand the expected prerequisites and known adjustments for that platform
