# session-authentication Specification

## Purpose
TBD - created by archiving change authentication-and-sessions. Update Purpose after archive.
## Requirements
### Requirement: Login must use a correlated OIDC Authorization Code Flow
The system MUST initiate authentication through the Keycloak Authorization Code Flow and MUST protect the flow with cryptographically random `state`, `nonce`, and PKCE using the `S256` challenge method.

#### Scenario: Starting login
- **WHEN** a visitor requests the login endpoint
- **THEN** the system stores short-lived correlation artifacts and redirects the visitor to the configured Keycloak authorization endpoint with `state`, `nonce`, and a PKCE `S256` challenge

### Requirement: The OIDC callback must validate identity before creating a session
The system MUST reject the callback unless `state` matches, the authorization code is exchanged with the original PKCE verifier, and the returned identity token passes issuer, signature, audience, expiration, and nonce validation.

#### Scenario: Callback with invalid state
- **WHEN** the callback contains a missing, expired, reused, or mismatched `state`
- **THEN** the system rejects the callback without creating a local user session

#### Scenario: Successful callback
- **WHEN** the callback and returned identity are valid
- **THEN** the system links or updates the local profile by the Keycloak subject and creates a local session

### Requirement: Authentication must create an opaque server-side session
The system MUST generate a cryptographically random local session token, persist only its hash, and MUST NOT expose Keycloak tokens to frontend code.

#### Scenario: Completing login
- **WHEN** a valid OIDC callback is completed
- **THEN** the system persists only the local session token hash and returns the original token solely in the session cookie

### Requirement: Session cookies must use secure attributes
The system MUST send the session token in an `HttpOnly` cookie with `SameSite=Lax`, `Path=/`, and `Secure` enabled in production.

#### Scenario: Inspecting the callback response cookie
- **WHEN** a successful callback response is received
- **THEN** the session cookie includes the required security attributes

### Requirement: Session state must be queryable and revocable
The system MUST provide endpoints to inspect the current session, end the current session, and end all local sessions for the authenticated user.

#### Scenario: Logging out of the current session
- **WHEN** an authenticated user calls the logout endpoint
- **THEN** the current local session is revoked, the cookie is expired, and the system attempts federated logout without depending on it for local revocation

### Requirement: Session expiration and local account state must be enforced
The system MUST enforce absolute session expiration and MUST reject sessions belonging to a locally disabled profile.

#### Scenario: Using an expired session
- **WHEN** a request is made with an expired session
- **THEN** the system rejects the request with an authentication error

#### Scenario: Using a session after local deactivation
- **WHEN** a request is made with a session whose local profile is inactive
- **THEN** the system rejects the request and the session is no longer accepted

