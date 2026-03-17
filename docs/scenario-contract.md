# Scenario Contract

## Purpose

The scenario contract is the source of truth for gc. The overlay, runtime, persistence layer, and future preview or test integrations must all consume the same scenario model.

## Scenario Shape

Each scenario is a serializable object with stable fields.

```ts
type GcScenario = {
  id: string
  label: string
  description?: string
  tags?: string[]
  identity?: {
    role?: string
    user?: Record<string, unknown> | null
    org?: Record<string, unknown> | null
    permissions?: string[]
    session?: Record<string, unknown> | null
  }
  flags?: Record<string, boolean | string | number | null>
  mocks?: Array<string | GcMockDefinition>
  route?: {
    initialPath?: string
    params?: Record<string, string>
    search?: Record<string, string | number | boolean | null>
  }
  seededState?: Record<string, unknown>
  metadata?: Record<string, string | number | boolean | null>
}

type GcMockDefinition = {
  id?: string
  url: string | RegExp
  method?: string
  status?: number
  delayMs?: number
  response?: unknown
  passthrough?: boolean
}
```

## Required Properties

- `id` must be stable and unique across the config
- `label` is user-facing and can change without breaking references

All other fields are optional so scenarios can be layered gradually.

## State Domains

### Identity

Identity is adapter-consumed state used to simulate client auth/session context.

- `role` is a convenience field for coarse state switching
- `user`, `org`, and `session` allow provider adapters to map richer state
- `permissions` is optional and app-specific

### Flags

Flags are named overrides consumed by a flag adapter.

- values must be serializable
- boolean flags are the common case
- non-boolean values are allowed for providers that support variants

### Mocks

Mocks define transport-level behavior for supported requests.

- named mocks are referenced by string
- inline mocks are stored as objects
- multiple mocks may be active under one scenario

### Route

Route data defines the preferred entrypoint when a scenario is activated.

- `initialPath` is the canonical field
- `params` and `search` are hints for router adapters that support typed navigation

### Seeded State

`seededState` is reserved for deterministic app bootstrapping where supported.

Examples:

- local storage keys
- session storage keys
- query cache seed data

## Precedence Rules

Runtime state must resolve in this order:

1. app defaults
2. gc config defaults
3. persisted user state from the previous session
4. selected scenario
5. temporary manual changes made through the overlay

This order keeps scenarios reproducible while still allowing temporary exploration.

## Persistence Rules

Persist only local, serializable values.

Initial storage keys:

- `gc_active_scenario`
- `gc_identity`
- `gc_flags`
- `gc_mocks`
- `gc_seeded_state`

Persisted state must never be treated as a source of truth outside development.

## Reset Semantics

The runtime must support two reset paths:

- `reset current session`
  - reapply the selected scenario from scratch
  - clear temporary toggles and transient overrides
- `clear all persisted state`
  - remove gc storage keys
  - detach active mocks
  - return adapters to baseline

## Contract Invariants

- scenarios must be declarative and serializable
- scenarios must not depend on application internals to remain valid
- unsupported fields must fail visibly, not silently
- the overlay must display unsupported scenario capabilities when adapters are missing

## Future Consumers

The same scenario contract is expected to power:

- the in-app overlay
- example apps
- future preview harnesses
- future Playwright or QA workflows
