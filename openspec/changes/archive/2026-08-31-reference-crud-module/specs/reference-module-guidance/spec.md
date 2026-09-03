## ADDED Requirements

### Requirement: The reference module must be backed by tests in multiple layers
The system MUST provide unit, integration, and end-to-end tests that exercise the reference module.

#### Scenario: Running the project test suites
- **WHEN** the relevant automated test suites run
- **THEN** the reference module behavior is verified across unit, integration, and end-to-end layers

### Requirement: The template must explain how to remove or rename the reference module
The system MUST document the steps required to remove or rename the reference module without breaking the remaining project build or tests.

#### Scenario: Following the reference module removal guide
- **WHEN** a maintainer follows the documented removal or rename procedure
- **THEN** the remaining template continues to build and test successfully
