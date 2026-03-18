# Compatibility Matrix

This matrix defines what mok can claim today and what must remain roadmap-only until proven.

## Support Labels

- `Guaranteed` means first-party, documented, example-backed, and acceptance-tested.
- `Supported with official adapter` means a first-party adapter exists and has acceptance coverage.
- `Manual fallback` means a documented path exists, but mok cannot guarantee automatic integration behavior.
- `Out of scope` means not supported in the current phase.

## Matrix

| Target | Runtime Mount | Auth Simulation | Flag Simulation | Route Explorer | Navigation | Transport Mocking | Scenario Support | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Vite + React | Dev import or client mount | Via adapter contract | Via adapter contract | Via router adapter | Via router adapter | Browser `fetch` passthrough with selective overrides | Full | Guaranteed |
| TanStack Router | Router instance adapter | N/A | N/A | Official adapter target with manifest fallback | Official adapter target | N/A | Full | Supported with official adapter |
| React Router | Adapter | N/A | N/A | Planned | Planned | N/A | Planned | Manual fallback |
| Next.js | Client-only mount | Client-only later | Client-only later | Manual or adapter later | Client-only later | Browser `fetch` passthrough with selective overrides | Partial later | Manual fallback |
| Solid | Unknown initial mount path | Later | Later | Later | Later | Later | Later | Out of scope |
| Generic local session auth | N/A | First auth target | N/A | N/A | N/A | Optional `/me` mocking | Full | Supported with official adapter |
| Better Auth | N/A | Contract only | N/A | N/A | N/A | Optional `/me` mocking | Planned | Manual fallback |
| Auth.js | N/A | Contract only | N/A | N/A | N/A | Optional `/me` mocking | Planned | Manual fallback |
| Clerk | N/A | Contract only | N/A | N/A | N/A | Optional `/me` mocking | Planned | Manual fallback |
| OpenFeature-style flags | N/A | N/A | First flag target | N/A | N/A | N/A | Full | Supported with official adapter |
| LaunchDarkly | N/A | N/A | Contract only | N/A | N/A | N/A | Planned | Manual fallback |
| PostHog flags | N/A | N/A | Contract only | N/A | N/A | N/A | Planned | Manual fallback |

## Rules

- No framework or provider can be marked supported without an example app in the repository.
- No framework or provider can be marketed as supported without acceptance cases.
- Manual fallback must include a setup guide.
- Unsupported behavior must surface clearly in the runtime UI.
- Supported transport mocking means selective overrides on top of passthrough by default, not blanket interception.

## First Slice Commitments

The first implementation slice is allowed to claim support only for:

- Vite + React
- TanStack Router adapter path
- browser `fetch` passthrough with selective mocking
- local or OpenFeature-style flag integration
- generic client auth/session simulation
- `apps/demo` as the first official example target

Everything else remains planned or fallback until implemented and tested.
