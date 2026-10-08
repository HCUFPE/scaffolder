## ADDED Requirements

### Requirement: The application must expose the Clínica Digital UFPE visual tokens
The frontend MUST define and consume semantic tokens for the official colors `#4D0C74`, `#69139D`, `#331549`, `#0A7C90`, `#3FBFD1`, `#58595B`, `#E9E9EC`, and `#FFFFFF`, and MUST use Arial as the current interface typeface.

#### Scenario: Rendering a branded interface control
- **WHEN** a shared interface control is rendered
- **THEN** its institutional colors and typography are resolved through semantic visual tokens rather than page-specific blue, slate, or indigo values

### Requirement: Brand assets must use exact replaceable slots
The frontend MUST provide reusable brand slots with content areas of 160 x 56 px for the expanded header, 240 x 84 px for login, 32 x 32 px for compact use, 120 x 42 px for reduced use, 220 x 48 px for the institutional lockup, and 32 x 32 px for the favicon source.

#### Scenario: Rendering before official assets are available
- **WHEN** a configured brand asset has no official source file
- **THEN** the application renders an identified placeholder at the exact dimensions of the requested variant

#### Scenario: Replacing a placeholder with an official asset
- **WHEN** an official SVG or PNG source is configured for a brand slot
- **THEN** the application renders it inside the existing slot without changing the slot dimensions or surrounding layout

### Requirement: Brand images must preserve their original proportions
The frontend MUST contain official brand images within their slots without cropping, stretching, rotating, recoloring, or reconstructing the image from separate visual elements.

#### Scenario: Asset aspect ratio differs from slot aspect ratio
- **WHEN** an official image has an aspect ratio different from its configured slot
- **THEN** the complete image remains visible with its original proportion and any unused slot area remains empty

### Requirement: Brand variants must follow their intended contexts
The frontend MUST use the complete or reduced logotype for product identification, the isolated cross only for compact support uses, and the combined NUTES/UFPE lockup in the institutional footer.

#### Scenario: Collapsing the authenticated sidebar
- **WHEN** the sidebar changes from expanded to compact mode
- **THEN** the complete header slot is replaced by the 32 x 32 px compact icon slot rather than shrinking the complete logotype

#### Scenario: Rendering the institutional footer
- **WHEN** the authenticated shell footer is visible
- **THEN** it contains the 220 x 48 px institutional lockup slot

### Requirement: Visual meaning must remain accessible
The frontend MUST preserve readable contrast and MUST NOT communicate status, maturity, validation, or navigation state through color alone.

#### Scenario: Rendering a status or maturity indicator
- **WHEN** the interface displays a status or digital maturity level
- **THEN** the indicator includes a textual label or accessible name in addition to its color

### Requirement: Maturity colors must be scoped to maturity data
The frontend MUST expose distinct tokens for Baixo (`#9E9E9E`), Inicial (`#C0392B`), Em desenvolvimento (`#E08E0B`), Intermediário (`#0A7C90`), and Avançado (`#4D0C74`) and MUST use them only when the represented value is a digital maturity level.

#### Scenario: Rendering generic application feedback
- **WHEN** the interface displays loading, success, warning, error, or informational feedback unrelated to digital maturity
- **THEN** it uses the corresponding operational feedback variant and does not label or style the value as a maturity level

### Requirement: Product surfaces must identify Clínica Digital UFPE
The login, authenticated navigation, footer, document title, and favicon configuration MUST identify Clínica Digital UFPE and MUST NOT present `AS` or `AppStart` as the visible product brand.

#### Scenario: Opening the application before official images are installed
- **WHEN** a user opens the login page or authenticated shell
- **THEN** the visible textual identity is Clínica Digital UFPE and missing images are represented by the configured placeholders
