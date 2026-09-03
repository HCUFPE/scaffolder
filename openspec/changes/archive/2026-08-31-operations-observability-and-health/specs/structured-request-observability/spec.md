## ADDED Requirements

### Requirement: Requests must be correlatable
The system MUST assign a request identifier to each HTTP request and MUST include it in logs and standardized error responses.

#### Scenario: Investigating a failing request
- **WHEN** a request produces an error response
- **THEN** the response and logs share the same request identifier

### Requirement: Log output must fit the runtime environment
The system MUST emit human-readable local logs for development and structured JSON logs for production.

#### Scenario: Running the API in production mode
- **WHEN** the API handles requests in production mode
- **THEN** log entries are emitted in structured JSON format

### Requirement: Sensitive data must be redacted from logs
The system MUST not log passwords, cookies, authorization credentials, session tokens, or token hashes.

#### Scenario: Logging an authenticated request
- **WHEN** the system logs a request or authentication event
- **THEN** sensitive credential material is absent or redacted
