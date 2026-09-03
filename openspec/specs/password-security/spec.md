# password-security Specification

## Purpose
TBD - created by archiving change authentication-and-sessions. Update Purpose after archive.
## Requirements
### Requirement: Application password storage is prohibited
The system MUST delegate password storage and verification to Keycloak and MUST NOT persist passwords, password hashes, password reset tokens, or other reusable credentials in the application database.

#### Scenario: Authenticating a user
- **WHEN** a visitor needs to authenticate
- **THEN** the application redirects the visitor to Keycloak instead of collecting or verifying a password locally

### Requirement: The identity provider must enforce the password policy
The system MUST provision a configurable minimum password length in Keycloak and MUST allow long passphrases, spaces, and Unicode characters without artificial composition rules imposed by the application.

#### Scenario: Configuring the development realm
- **WHEN** the Keycloak realm configuration is rendered
- **THEN** it contains the configured minimum password length policy

### Requirement: Password management must be delegated to the identity provider
The system MUST direct authenticated users to a Keycloak-managed account or password flow and MUST NOT implement a parallel local password-change mechanism.

#### Scenario: Requesting password management
- **WHEN** an authenticated user requests the account management endpoint
- **THEN** the system redirects the user to the configured Keycloak account management flow

