# guided-project-scaffolding Specification

## Purpose
TBD - created by archiving change guided-project-scaffolding. Update Purpose after archive.
## Requirements
### Requirement: The template must provide a guided scaffolding command
The system MUST provide an official guided scaffolding command that creates a new derived project from the template using a single entrypoint.

#### Scenario: Creating a project from the template
- **WHEN** a user runs the scaffolding command in the template root
- **THEN** the system starts a guided flow to create a new derived project

### Requirement: The scaffolding flow must preserve the source template
The system MUST create the derived project in a target directory without modifying the original template repository.

#### Scenario: Generating a derived project
- **WHEN** a user completes the scaffolding flow successfully
- **THEN** the template repository remains unchanged and the new project is created in the chosen destination

### Requirement: The scaffolding flow must collect and apply minimum project metadata
The system MUST collect, or accept by flags, the minimum metadata needed to materialize a new project and MUST apply that data to the generated project files.

#### Scenario: Providing initial project metadata
- **WHEN** a user informs the project name, destination, description, and initial configuration values
- **THEN** the generated project reflects those values without requiring mandatory manual structural edits

### Requirement: The scaffolding flow must generate initial local configuration
The system MUST create a `.env` file from `.env.example` with coherent initial values for the generated project.

#### Scenario: Creating the local environment file
- **WHEN** the scaffolding flow completes successfully
- **THEN** the derived project includes a `.env` file ready for local review

### Requirement: The scaffolding flow must initialize the derived repository and dependencies
The system MUST initialize a Git repository for the generated project, install dependencies, and present the next setup steps.

#### Scenario: Finalizing project generation
- **WHEN** the scaffolding flow finishes
- **THEN** the user receives a generated project with initialized version control, installed dependencies, and clear next-step instructions

### Requirement: The scaffolding flow must be friendly to novice users
The system MUST validate required prerequisites and MUST report common failures with clear, actionable messages suitable for beginner users.

#### Scenario: Missing prerequisite before generation
- **WHEN** a required dependency such as Git, Docker, Node.js, or the configured package manager is unavailable
- **THEN** the scaffolding flow stops early and explains the missing prerequisite and the corrective action

### Requirement: The scaffolding flow must support non-interactive automation
The system MUST support a non-interactive mode using flags for the minimum required parameters.

#### Scenario: Running scaffolding in automation mode
- **WHEN** a user or instructor provides the required parameters via flags
- **THEN** the project is generated without interactive prompts

