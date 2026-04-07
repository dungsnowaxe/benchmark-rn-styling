## Requirements

### Requirement: Realtime flash benchmark mirrors realtime list benchmark behavior

The system SHALL provide a benchmark screen that matches the realtime list benchmark’s core behavior: a scrollable list of financial-style rows driven by the same categories of data updates (mock generator with optional public feed for at least one row), a styling engine radio (React Native `StyleSheet`, `react-native-unistyles` v3, Uniwind), and a render time readout updated on tick-driven renders and when the styling engine changes.

#### Scenario: List updates and engine switch behave like realtime benchmark

- **WHEN** the user uses the realtime flash benchmark screen
- **THEN** the user can switch styling engines and observe updating row values and a render time display consistent with the realtime list benchmark screen’s intent

### Requirement: Directional flash applies only behind changing numeric text

When a row’s **price** or **change percentage** value changes compared to its immediately previous rendered value for that field, the system SHALL briefly apply a directional background on **only** the text (or its immediate text wrapper) for that field: **green-tinted background when the new value is greater than the old value**, and **red-tinted background when the new value is less than the old value**. The symbol label SHALL NOT receive directional flash. If both fields change in the same update, each field’s flash SHALL be independent.

#### Scenario: Price increases

- **WHEN** a row’s displayed price increases from its previous value
- **THEN** only the price value’s text area shows a brief green-tinted background flash

#### Scenario: Change percentage decreases

- **WHEN** a row’s displayed change percentage decreases from its previous value
- **THEN** only the change percentage value’s text area shows a brief red-tinted background flash

#### Scenario: No flash without prior value or without change

- **WHEN** a field is shown for the first time with no prior value for comparison, or the numeric value is unchanged since the last render
- **THEN** the system SHALL NOT apply a directional flash for that field solely due to that update

### Requirement: Directional flash animates background opacity only

The system SHALL present each directional flash with a **timed animation** on the **background fill** (for example opacity increasing then decreasing). The **numeric text** for price and change percentage SHALL **not** use that same opacity animation: the glyphs SHALL stay at **full, steady opacity** for the whole flash so the value remains easy to read while the tint fades in and out.

#### Scenario: Background fades while text stays solid

- **WHEN** a directional flash is active and the green or red background is fading out
- **THEN** the numeric text for that field remains visually opaque as when not flashing (no shared fade on the text node that would dim the digits)

#### Scenario: Flash is not a single hard step

- **WHEN** a value change triggers a directional flash
- **THEN** the directional background SHALL transition over time (fade in then fade out), not only an instantaneous color toggle with no transition

### Requirement: Flash colors maintain readable contrast

The system SHALL choose flash background and text colors such that the changing numeric text remains legible against the flash background and against the app’s default background in **light** and **dark** appearance modes.

#### Scenario: Legibility in light and dark

- **WHEN** the user views the realtime flash benchmark in light appearance or in dark appearance
- **THEN** directional flash styling maintains sufficient visual separation between text and background for the flashed text regions
