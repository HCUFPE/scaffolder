# user-administration Specification

## Purpose
Administração de contas e perfis de usuários com provisionamento sincronizado no Keycloak, listagem paginada, ativação/desativação com revogação de sessões e autoatendimento protegido contra elevação de privilégios.

## Requirements

### Requirement: Administrators must manage provisioned user accounts
The system MUST allow administrators to list users with pagination and filtering, create accounts through the Keycloak integration, and activate or deactivate accounts while maintaining the corresponding local profile.

#### Scenario: Creating a user as an administrator
- **WHEN** an administrator submits a valid new-user request
- **THEN** the system provisions the Keycloak identity, creates the linked local profile, and returns no credential or provider token

#### Scenario: Listing users as an administrator
- **WHEN** an administrator requests the user list with pagination parameters
- **THEN** the system returns a paginated and filtered result set of safe local profile data

### Requirement: Administrative identity changes must remain consistent
The system MUST coordinate supported role, status, name, and email changes between Keycloak and the local profile and MUST NOT report success when only an unreconciled partial change occurred.

#### Scenario: Keycloak rejects an administrative change
- **WHEN** the provider rejects a requested identity change
- **THEN** the system returns a diagnostic failure and does not present the local profile as fully updated

### Requirement: Local deactivation must revoke application access
The system MUST reject authentication for an inactive local profile and MUST revoke that profile's local sessions when it is deactivated.

#### Scenario: Deactivating an active user
- **WHEN** an administrator deactivates a user
- **THEN** the local profile is marked inactive, existing local sessions are revoked, and the corresponding provider account is updated when configured by the operation

### Requirement: Users must access their own profile safely
The system MUST allow an authenticated user to retrieve the user's own profile and update allowed profile fields without changing the Keycloak linkage, role, or active state.

#### Scenario: Attempting privilege escalation through profile update
- **WHEN** an authenticated user submits `keycloakUserId`, role, or active-state changes in a self-service request
- **THEN** the system rejects the protected fields and preserves the existing values

### Requirement: Public registration must remain disabled
The system MUST keep public self-registration disabled in the baseline realm and MUST require account creation through an administrator or a separately specified external provisioning process.

#### Scenario: Visitor requests public registration
- **WHEN** a visitor attempts to access a public registration flow
- **THEN** the system does not offer local registration and does not collect a password
