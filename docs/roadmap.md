# Roadmap

## Phase 0: Documentation Foundation

Goal:

- lock the product definition, support boundaries, scenario contract, adapter contracts, and roadmap criteria before and during coding

Deliverables:

- product definition
- scenario contract
- adapter contracts
- compatibility matrix
- guardrails
- setup and support guide

Exit criteria:

- first implementation slice is unambiguous
- unsupported claims have been removed from product language
- support labels are consistent across all docs
- hybrid passthrough-by-default behavior is documented clearly

## Phase 1: Core Runtime And Demo

Goal:

- prove the hybrid scenario runtime on one reliable stack and one official demo app

Scope:

- Vite + React
- TanStack Router adapter
- browser `fetch` transport adapter with passthrough by default
- scenario persistence and reset
- local or OpenFeature-style flags
- generic client auth/session adapter shape
- minimal overlay
- `apps/demo` as the first official support target

Exit criteria:

- installation path is documented and works in `apps/demo`
- scenario switching is deterministic
- route navigation works through the router adapter
- transport overrides are deterministic and reset correctly
- unsupported capabilities surface clearly
- real backend passthrough remains the default unless a scenario overrides it
- overlay status distinguishes real, simulated, mocked, and partial behavior

## Phase 2: Adapter Expansion

Goal:

- expand compatibility through contracts, not guesswork

Likely targets:

- React Router adapter
- first real auth provider adapter
- first real feature flag provider adapter
- richer scenario authoring ergonomics

Admission criteria for each target:

- documented adapter contract mapping
- example app
- acceptance cases
- setup guide
- the target cannot be promoted to supported without example-backed proof

## Phase 3: Broader Tooling Reuse

Goal:

- reuse the scenario contract beyond the overlay

Likely targets:

- preview harness integration
- automated QA or Playwright flows
- scenario sharing across docs, examples, and tests

Constraint:

- no new consumer may fork the scenario model

## Phase 4: Server-Aware Exploration

Goal:

- evaluate deeper server-aware capabilities only after the client-first model is proven

Possible research areas:

- SSR-aware setup patterns
- server-auth simulation boundaries
- richer transport coverage

Constraint:

- none of this is part of the initial support promise

## Roadmap Rules

- roadmap items are not support commitments
- supported claims require documentation, examples, and acceptance coverage
- broad framework expansion cannot outrun the scenario and adapter model
- demo and product runtime remain separate concerns in the monorepo
