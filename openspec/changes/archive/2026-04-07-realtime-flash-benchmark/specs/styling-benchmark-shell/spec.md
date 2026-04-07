## RENAMED Requirements

- **FROM:** `### Requirement: User can open both benchmark screens from the app shell`
- **TO:** `### Requirement: User can open benchmark screens from the app shell`

## MODIFIED Requirements

### Requirement: User can open benchmark screens from the app shell

The system SHALL expose navigation so the user can reach the static list benchmark screen, the realtime list benchmark screen, and the realtime flash benchmark screen from the running app (for example via tabs, a stack, or linked entries on a home screen).

#### Scenario: Navigate to static benchmark

- **WHEN** the user opens the app and chooses the static benchmark destination
- **THEN** the static list benchmark screen is displayed

#### Scenario: Navigate to realtime benchmark

- **WHEN** the user chooses the realtime benchmark destination
- **THEN** the realtime list benchmark screen is displayed

#### Scenario: Navigate to realtime flash benchmark

- **WHEN** the user chooses the realtime flash benchmark destination
- **THEN** the realtime flash benchmark screen is displayed

### Requirement: Styling selection applies per session while navigating

The system SHALL keep the last selected styling engine for the session when the user moves among the static, realtime, and realtime flash benchmark screens, unless the user changes the selection again.

#### Scenario: Selection persists across screens

- **WHEN** the user selects a styling engine on one benchmark screen and navigates to another benchmark screen
- **THEN** the same styling engine remains selected until the user changes it
