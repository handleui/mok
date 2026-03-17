# Setup And Support

## Philosophy

mok aims for low setup, not fake zero setup. The baseline integration should be small and explicit so the resulting behavior is predictable.

## Intended Installation Story

The primary installation shape is:

```ts
import "mok/dev"
```

Apps that need richer behavior will also register config and adapters:

```ts
import "mok/dev"
import { defineMok } from "mok"

defineMok({
  scenarios: [],
  adapters: [],
})
```

The exact API can be refined during implementation, but the setup tiers below are fixed product expectations.

## Setup Tiers

### Tier 1: Core Runtime

Purpose:

- mount the dev runtime
- show the overlay
- support local scenario state and reset

Guarantees:

- dev-only mounting
- local persistence
- overlay controls

Non-guarantees:

- no provider-aware auth behavior
- no provider-aware flags behavior
- no automatic route list

### Tier 2: Core Runtime Plus Manual Manifest

Purpose:

- define scenarios, routes, and mocks explicitly

Guarantees:

- deterministic scenario switching
- manual route navigation targets
- deterministic transport mocks on supported transports

Non-guarantees:

- no automatic provider sync unless an adapter exists

### Tier 3: Core Runtime Plus Official Adapters

Purpose:

- bridge mok scenarios to actual app/provider boundaries

Guarantees:

- behavior defined by the adapter contract
- support visibility in the overlay/runtime
- higher-fidelity auth, flags, and routing integration

Non-guarantees:

- anything outside the documented adapter scope

## Support Model

Each support path must be documented as one of:

- Guaranteed
- Supported with official adapter
- Manual fallback
- Out of scope

The compatibility matrix is the source of truth for those labels.

## Troubleshooting Expectations

If a setup fails, mok should guide diagnosis through explicit status:

- adapter missing
- adapter installed but unavailable
- scenario field unsupported by current adapters
- route listing unavailable, manual registration required
- transport class unsupported

## Example Setup Targets

The first documentation-backed setup targets are:

- Vite + React
- TanStack Router adapter
- browser `fetch` mocking
- generic client auth/session simulation
- local or OpenFeature-style flags

## Setup Boundaries

- Next.js requires a client-only mount path when it enters implementation.
- Server-only state is not part of the first release.
- Real auth providers are contract-first until an official adapter exists.
