## ADDED Requirements

### Requirement: Static benchmark shows a scrollable list of heterogeneous rows

The system SHALL render a scrollable list of multiple rows containing static labels and values. Rows SHALL use varied presentation (for example different font weights, colors, or spacing) so the benchmark reflects diverse styles, not a single repeated class.

#### Scenario: List displays static content

- **WHEN** the user opens the static list benchmark screen
- **THEN** the user sees a list of rows with non-empty static text or numeric fields

#### Scenario: Styles follow selected engine

- **WHEN** the user changes the styling engine via the radio control
- **THEN** the list re-renders using that engine’s styling approach for the rows

### Requirement: Static benchmark shows render time

The system SHALL display a **render time** in milliseconds on the static list benchmark screen, updated after the list completes a render triggered by switching the styling engine and on initial mount of the benchmark content.

#### Scenario: Render time visible after engine change

- **WHEN** the user selects a different styling engine on the static benchmark screen
- **THEN** the screen shows a numeric render time in milliseconds reflecting the last measured render for that change

#### Scenario: Render time on first paint

- **WHEN** the user opens the static list benchmark screen
- **THEN** the screen shows a numeric render time in milliseconds for the initial render of the benchmark list

### Requirement: Static benchmark does not depend on network data

The system SHALL populate the static list without requiring network requests for core functionality.

#### Scenario: Offline static list

- **WHEN** the device has no network connectivity
- **THEN** the static list benchmark screen still shows the full static list
