# Product Definition

## Thesis

mok is a dev-only scenario orchestration runtime for client-side app exploration. It combines a scenario contract, provider-aware adapters, local persistence, and a minimal overlay to make realistic UI states easy to reach without replacing the real backend by default.

## Problem

Developers need to validate states such as:

- authenticated versus guest UX
- feature flag combinations
- loading, empty, error, and success responses
- role-based access views
- route-specific flows

In most apps, these states are controlled by backend responses, auth providers, feature-flag SDKs, and router state. That makes quick UI exploration slow, brittle, and dependent on environment setup.

The intended answer is not "mock everything." It is a hybrid runtime:

- keep live backend traffic as the default path
- override only the requests or client state needed to reach a target scenario
- surface unsupported or partially applied behavior clearly

## Product Position

mok is not a general-purpose browser hack. It is an app-aware development runtime with explicit contracts:

- scenarios define the target state
- adapters bridge real app boundaries such as auth, flags, routing, and transport
- the overlay is a control surface, not the source of truth
- transport passthrough is the default, not an exception

## Core Outcomes

A successful mok setup should let a developer:

1. install a dev-only runtime
2. register scenarios and adapters
3. run the app locally
4. switch state combinations quickly
5. navigate supported routes
6. selectively replace supported network responses while passing through the rest
7. reset the app to a known baseline

## Non-Goals

These are explicitly out of scope for v1:

- production runtime support
- server-auth impersonation or secure session forgery
- SSR or React Server Component parity
- server action interception
- universal route discovery across all frameworks
- universal no-integration auth or flag simulation
- silent monkeypatching of undocumented provider internals

## What "Supported" Means

A framework, provider, or integration path can only be called supported when all of the following are true:

- an official adapter or official manual path exists
- a documented setup guide exists
- an example app exists in the repository
- the behavior is covered by acceptance scenarios

Anything short of that must be labeled as either manual fallback or out of scope.

For user-facing status, mok must also distinguish:

- `real` behavior that flows through to the app or backend
- `simulated` behavior that mok applies locally
- `mocked` behavior that mok overrides deterministically
- `partial` support when a scenario cannot fully control a boundary

## What "No Business-Logic Rewrites" Means

mok aims to avoid feature rewrites and state-management refactors. That does not mean zero setup.

Allowed setup:

- one dev-only client mount or import
- adapter registration
- scenario registration
- optional manual route registration

Disallowed assumption:

- claiming that arbitrary apps will respond correctly with no adapter or wiring at all

## v1 Product Shape

The first implementation slice is intentionally narrow:

- Vite + React
- TanStack Router adapter
- browser `fetch` passthrough with selective mocking
- scenario persistence and reset
- local or OpenFeature-style flag adapter
- generic client auth/session adapter shape
- minimal overlay for scenario switching and state controls
- `apps/demo` as the first official example app

## Success Criteria

The first coded slice is successful when a developer can:

1. install mok in a Vite + React app
2. mount it in development
3. load a scenario
4. navigate through the router adapter
5. see flag and auth state reflected through supported adapters
6. mock deterministic network responses without blocking live backend passthrough
7. fully reset back to baseline

## Product Principles

- scenario-first, not overlay-first
- explicit support boundaries
- visible failure over silent degradation
- adapter contracts over runtime guesswork
- narrow initial scope over broad but unreliable claims
