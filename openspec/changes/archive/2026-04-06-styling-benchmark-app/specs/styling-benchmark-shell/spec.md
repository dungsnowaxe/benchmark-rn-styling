## ADDED Requirements

### Requirement: User can open both benchmark screens from the app shell

The system SHALL expose navigation so the user can reach the static list benchmark screen and the realtime list benchmark screen from the running app (for example via tabs, a stack, or linked entries on a home screen).

#### Scenario: Navigate to static benchmark

- **WHEN** the user opens the app and chooses the static benchmark destination
- **THEN** the static list benchmark screen is displayed

#### Scenario: Navigate to realtime benchmark

- **WHEN** the user chooses the realtime benchmark destination
- **THEN** the realtime list benchmark screen is displayed

### Requirement: User can select a styling engine with a radio control

The system SHALL provide a radio button group (or platform-equivalent single-select control) on each benchmark screen to choose exactly one of: React Native core `StyleSheet`, `react-native-unistyles` v3, or Uniwind.

#### Scenario: Select StyleSheet

- **WHEN** the user selects the StyleSheet option on a benchmark screen
- **THEN** the visible list on that screen uses StyleSheet-based styling for its rows

#### Scenario: Select Unistyles

- **WHEN** the user selects the Unistyles option on a benchmark screen
- **THEN** the visible list on that screen uses Unistyles v3-based styling for its rows

#### Scenario: Select Uniwind

- **WHEN** the user selects the Uniwind option on a benchmark screen
- **THEN** the visible list on that screen uses Uniwind-based styling for its rows

### Requirement: Styling selection applies per session while navigating

The system SHALL keep the last selected styling engine for the session when the user moves between the static and realtime benchmark screens, unless the user changes the selection again.

#### Scenario: Selection persists across screens

- **WHEN** the user selects a styling engine on one benchmark screen and navigates to the other benchmark screen
- **THEN** the same styling engine remains selected until the user changes it
