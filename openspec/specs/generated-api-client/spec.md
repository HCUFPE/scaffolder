# generated-api-client Specification

## Purpose
Geração automatizada de especificação OpenAPI e cliente TypeScript tipado para manter o frontend e backend sincronizados.

## Requirements

### Requirement: OpenAPI documentation must be generated from the API
The system MUST generate a valid OpenAPI document that describes protected operations, request DTOs, and relevant responses.

#### Scenario: Generating API documentation
- **WHEN** the OpenAPI generation command runs
- **THEN** it produces a valid contract document for the current API

### Requirement: TypeScript clients must be generated from the contract
The system MUST generate the frontend TypeScript API client from the OpenAPI document rather than maintaining duplicate manual types.

#### Scenario: Building the frontend after API changes
- **WHEN** the generated client is up to date
- **THEN** the frontend compiles using the generated API types and operations

### Requirement: CI must detect stale generated clients
The system MUST fail automated verification when the API contract changes and the generated client was not refreshed.

#### Scenario: Contract changed without regenerating the client
- **WHEN** CI checks the API contract and generated client
- **THEN** the verification fails and reports the generated artifacts are outdated
