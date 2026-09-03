## ADDED Requirements

### Requirement: Supported runtime versions must be declared
The system MUST declare the supported versions of Node.js and pnpm and MUST fail clearly when an unsupported version is used.

#### Scenario: Unsupported runtime version
- **WHEN** a developer runs an installation or startup command with an unsupported Node.js or pnpm version
- **THEN** the system returns a clear error describing the supported versions

### Requirement: Environment template must define required variables
The system MUST provide a `.env.example` file containing every required environment variable with safe example values and explanatory comments.

#### Scenario: Creating a local environment file
- **WHEN** a developer copies `.env.example` to `.env`
- **THEN** all mandatory variables needed for local startup are present

### Requirement: Local setup must bootstrap the full development environment
The system MUST provide a `pnpm setup` command that starts PostgreSQL, waits for readiness, applies migrations, and runs the development seed.

#### Scenario: Preparing a fresh clone
- **WHEN** a developer runs `pnpm setup` in a fresh clone
- **THEN** the local database is prepared and the development administrator account is available

### Requirement: Development mode must start the main applications together
The system MUST provide a `pnpm dev` command that starts the API and web application in development mode.

#### Scenario: Starting the development environment
- **WHEN** a developer runs `pnpm dev`
- **THEN** the API and frontend start together and reflect source changes without manual rebuild

### Requirement: Setup failures must be diagnosable
The system MUST provide actionable diagnostics for missing Docker access, unavailable services, occupied ports, and invalid environment configuration.

#### Scenario: Docker is unavailable
- **WHEN** a developer runs setup without a working Docker environment
- **THEN** the system reports the likely cause and the corrective action
