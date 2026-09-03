# headless-direct-login Specification

## Purpose
Autenticação de credenciais direta de forma headless, onde o Keycloak atua como motor de identidade nos bastidores sem jamais redirecionar o usuário para telas externas, emitindo sessão opaca local em cookie HTTP-only.

## Requirements

### Requirement: The application must support headless direct login via backend
The system MUST provide a backend login endpoint `POST /api/v1/auth/login` accepting credentials, authenticating directly against Keycloak via Direct Access Grants, and establishing an opaque local session cookie.

#### Scenario: Successful headless login
- **WHEN** a user submits valid email and password in the native login form
- **THEN** the backend authenticates against Keycloak, creates a local session in Postgres, sets the HTTP-only session cookie, and returns the user identity

#### Scenario: Invalid credentials submission
- **WHEN** a user submits incorrect email or password
- **THEN** the system rejects the request with HTTP 401 Problem Details and does not create a session

### Requirement: The frontend must provide a native React login form
The frontend application MUST render a native login form with field validation, show/hide password toggle, loading feedback, and clear error notifications without navigating outside the application.

#### Scenario: Submitting native login form
- **WHEN** an unauthenticated visitor accesses `/login` and fills the credentials
- **THEN** the form validates inputs, sends credentials directly to the backend API, and transitions to the dashboard upon success
