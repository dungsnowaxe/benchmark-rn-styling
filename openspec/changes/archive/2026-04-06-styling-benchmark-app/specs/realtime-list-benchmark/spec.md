## ADDED Requirements

### Requirement: Realtime benchmark shows updating financial-style rows

The system SHALL render a scrollable list of rows representing instruments (stocks or cryptocurrencies) with fields that update over time (for example symbol, price, and change).

#### Scenario: Values change over time

- **WHEN** the user stays on the realtime list benchmark screen
- **THEN** at least one visible field per row updates periodically without requiring manual refresh

#### Scenario: Styles follow selected engine

- **WHEN** the user changes the styling engine via the radio control
- **THEN** the list re-renders using that engine’s styling approach for the rows

### Requirement: Realtime benchmark shows render time

The system SHALL display a **render time** in milliseconds on the realtime list benchmark screen, updated when row data updates from the mock ticker and when the styling engine changes.

#### Scenario: Render time visible on tick updates

- **WHEN** the mock or WebSocket-driven data updates the list
- **THEN** the screen shows a numeric render time in milliseconds for the last such update

#### Scenario: Render time visible after engine change

- **WHEN** the user selects a different styling engine on the realtime benchmark screen
- **THEN** the screen shows a numeric render time in milliseconds reflecting the last measured render for that change

### Requirement: Realtime data source supports mock mode

The system SHALL provide a mock data generator that drives row updates without external services so the demo works reliably.

#### Scenario: Mock updates without WebSocket

- **WHEN** no external realtime feed is available or configured
- **THEN** the list still receives periodic mock price updates

### Requirement: Optional public WebSocket feed

The system MAY connect to a public WebSocket endpoint for live quotes when connectivity allows, and SHALL fall back to mock updates if the connection fails or is disabled.

#### Scenario: Fallback on connection failure

- **WHEN** the optional WebSocket connection cannot be established or drops
- **THEN** the screen continues to show updating data using the mock generator
