## ADDED Requirements

### Requirement: Business routes must use a versioned API prefix
The system MUST expose business API routes under the `/api/v1` prefix.

#### Scenario: Calling a business endpoint
- **WHEN** a client accesses a business API route
- **THEN** the route path begins with `/api/v1`

### Requirement: Input validation must be enforced globally
The system MUST validate request DTOs globally and MUST reject unauthorized extra properties.

#### Scenario: Sending a payload with unknown fields
- **WHEN** a client submits a request body containing fields not allowed by the DTO
- **THEN** the system rejects the request and does not apply the unknown fields

### Requirement: API responses must use shared conventions
The system MUST provide standardized error envelopes, paginated list responses, UTC ISO 8601 timestamps, and safe response serialization.

#### Scenario: Receiving a validation error
- **WHEN** a request fails validation
- **THEN** the API returns a structured error payload with stable machine-readable fields

### Requirement: Cookie-authenticated mutations must be protected against CSRF
The system MUST require CSRF protection and origin validation for mutable authenticated requests that use cookies.

#### Scenario: Sending a mutable authenticated request without CSRF protection
- **WHEN** a client sends a mutable cookie-authenticated request without valid CSRF protection
- **THEN** the system rejects the request
