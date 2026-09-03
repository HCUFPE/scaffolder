## ADDED Requirements

### Requirement: The API must expose a liveness endpoint
The system MUST expose a liveness endpoint that confirms the process is running without depending on optional external services.

#### Scenario: Checking process liveness
- **WHEN** an operator calls the liveness endpoint
- **THEN** the system reports the process is alive if the API process is running

### Requirement: The API must expose a readiness endpoint
The system MUST expose a readiness endpoint that includes verification of the database dependency.

#### Scenario: Database unavailable during readiness check
- **WHEN** the database dependency is unavailable
- **THEN** the readiness endpoint reports the service as not ready
