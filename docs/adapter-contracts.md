# Adapter Contracts

## Purpose

Adapters are the compatibility model for mok. They bridge the gap between generic scenario state and real application boundaries.

Without adapters, mok can only offer a limited local runtime. With adapters, it can drive real auth, flags, routing, and transport behavior in a documented way.

Adapters should prefer honest partial support over hidden emulation. If a boundary can only be influenced locally, it must report that clearly.

## Global Adapter Requirements

Every adapter must:

- declare its name and capability type
- report whether it is active
- report unsupported capabilities explicitly
- apply scenario state deterministically
- support reset and teardown
- avoid undocumented monkeypatching as a supported mechanism

## Common Shape

```ts
type MokAdapter = {
  name: string
  kind: "auth" | "flags" | "router" | "transport"
  isAvailable(): boolean
  getStatus(): {
    ready: boolean
    supportedFeatures: string[]
    unsupportedFeatures: string[]
    message?: string
  }
  setup?(): void | Promise<void>
  applyScenario?(scenario: MokScenario): void | Promise<void>
  reset?(): void | Promise<void>
  teardown?(): void | Promise<void>
}
```

## Auth Adapter

An auth adapter translates scenario identity into the client auth model used by the app or provider.

Expected capabilities:

- read current auth-related client state
- apply scenario identity fields
- clear simulated identity
- report whether the app is using unsupported server-enforced auth flows

Auth v1 boundary:

- client-state simulation only
- `/me` or equivalent transport mocking where applicable
- no server session forgery
- no middleware bypass guarantee
- unsupported server-enforced flows must surface as partial support

## Flag Adapter

A flag adapter maps scenario flags into the app's feature flag surface.

Expected capabilities:

- enumerate known flags when possible
- read current resolved values
- apply overrides
- clear overrides

Supported strategies:

- local in-memory flag store
- OpenFeature-style provider integration
- provider-specific adapters later

## Router Adapter

A router adapter lets mok navigate and, where possible, enumerate routes.

Expected capabilities:

- report the current route
- navigate to a target path or route descriptor
- expose a navigable route list when the router provides one
- surface when only manual route registration is available

Router boundary:

- no universal route discovery guarantee
- adapter-backed listing where stable route definitions exist
- manual route registration is a first-class fallback
- TanStack Router should use the router instance directly as the primary integration point
- route-manifest fallback is valid when route-tree introspection is not stable enough for support

## Transport Adapter

A transport adapter owns supported network interception.

Expected capabilities:

- register deterministic mocks
- pass through unmatched requests by default
- reset all active mocks
- report unsupported traffic classes

Initial support:

- browser `fetch`

Transport adapter behavior should be explicit about what is mocked versus what is still real. The default posture is passthrough, not full virtualization.

Explicitly not guaranteed in v1:

- XHR
- websockets
- server fetches
- server actions
- opaque provider SDK traffic

## Lifecycle

Adapters are expected to operate within this lifecycle:

1. `setup`
2. `status check`
3. `apply scenario`
4. `incremental manual updates`
5. `reset`
6. `teardown`

## Failure Model

Adapter failures must be visible.

Required behavior:

- surface status in the overlay/runtime
- identify missing dependencies or unsupported usage
- never pretend a scenario was fully applied when it was only partially applied
- distinguish real, simulated, mocked, and partial states in the status model

## Support Tiers

Adapters can exist at different trust levels:

- official
- community
- app-local

Only official adapters can move an integration path into the supported category in the compatibility matrix.
