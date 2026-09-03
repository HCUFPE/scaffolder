## ADDED Requirements

### Requirement: Endpoints must be protected by default
The system MUST require authentication for every endpoint unless the endpoint is explicitly marked as public.

#### Scenario: Accessing a protected endpoint without a session
- **WHEN** a visitor calls a protected endpoint without authentication
- **THEN** the system rejects the request with an authentication error

### Requirement: Role-based access must be enforceable on the backend
The system MUST provide a backend mechanism to restrict endpoints by role and MUST reject authenticated users without the required role.

#### Scenario: Accessing an administrator endpoint as a regular user
- **WHEN** an authenticated user with the `USER` role calls an administrator-only endpoint
- **THEN** the system rejects the request with an authorization error

### Requirement: Self-service input must not allow privilege escalation
The system MUST ignore or reject role changes and other protected privilege fields in self-service operations.

#### Scenario: Attempting to elevate role through profile update
- **WHEN** an authenticated user submits a self-service payload containing a role change
- **THEN** the system rejects or ignores the protected field and preserves the original role
