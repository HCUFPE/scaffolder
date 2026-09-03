# development-postgres Specification

## Purpose
TBD - created by archiving change database-and-migrations. Update Purpose after archive.
## Requirements
### Requirement: Development PostgreSQL must run from Compose
The system MUST provide a PostgreSQL service in `compose.yaml` that can be started in development and exposes a health state.

#### Scenario: Starting the local database service
- **WHEN** a developer starts the PostgreSQL service with Docker Compose
- **THEN** the service reaches a healthy state and becomes available for the application

### Requirement: Development data must persist across restarts
The system MUST use a named volume so that development data survives container restarts.

#### Scenario: Restarting the PostgreSQL container
- **WHEN** the database container is stopped and started again
- **THEN** previously stored development data remains available

### Requirement: Database connection settings must be externally configurable
The system MUST allow database credentials, port, and database name to be configured through environment variables.

#### Scenario: Changing database settings
- **WHEN** a developer changes the database-related environment variables
- **THEN** the application and Compose configuration use the new values without source changes

