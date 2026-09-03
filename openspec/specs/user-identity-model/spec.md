# user-identity-model Specification

## Purpose
Modelo de identidade e perfil local vinculado à conta do Keycloak por keycloakUserId único, garantindo normalização de e-mails, integridade relacional e ausência de senhas no perfil local.

## Requirements

### Requirement: Local profiles must be linked to Keycloak identities
The system MUST store each local user profile with a UUID identifier, unique `keycloakUserId` derived from the validated OIDC `sub`, name, normalized unique email, role snapshot, and local active state.

#### Scenario: Creating a profile after first authentication
- **WHEN** a validated Keycloak identity has no linked local profile
- **THEN** the system creates a profile containing the required identity, access, and local state fields without storing credentials

### Requirement: Provider identity linkage must be unique
The system MUST prevent more than one local profile from referencing the same Keycloak subject.

#### Scenario: Linking an already used Keycloak subject
- **WHEN** the system attempts to associate a second profile with an existing `keycloakUserId`
- **THEN** the operation is rejected as a conflict

### Requirement: Email identity must be normalized and unique
The system MUST normalize email addresses before persistence and comparison and MUST reject local duplicates.

#### Scenario: Duplicate email with different casing
- **WHEN** an identity or administrative operation uses an email that differs from an existing one only by letter casing
- **THEN** the system rejects or reconciles the operation without creating a duplicate profile

### Requirement: Credentials must not belong to the local profile
The system MUST NOT include password hashes, password reset tokens, or reusable Keycloak credentials in the local user profile.

#### Scenario: Serializing or persisting a profile
- **WHEN** a profile is stored or returned by the API
- **THEN** it contains no password material or provider token
