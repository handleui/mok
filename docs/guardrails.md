# Guardrails

## Purpose

These guardrails exist to keep Awware honest, safe, and implementable.

## Runtime Guardrails

- Awware must run only in development.
- Awware must execute only in the browser for the first release.
- Awware must not send telemetry or outbound product analytics.
- Awware state must remain local to the developer machine.
- The overlay must load lazily so the control surface does not dominate the core runtime cost.

## Product Guardrails

- The product must be scenario-first, not overlay-first.
- Adapter contracts are the compatibility boundary.
- Unsupported capabilities must fail visibly.
- The product must not rely on undocumented framework or provider internals as a supported promise.
- The product must not claim compatibility just because the overlay can render.

## Security Guardrails

- No server-auth impersonation in v1.
- No bypass claims for middleware, server actions, or backend ACLs.
- No storage of secrets or credentials in Awware persistence.
- No production code path should execute Awware runtime behavior.

## Support Guardrails

- Supported means documented, example-backed, and acceptance-tested.
- Manual fallback is acceptable, but it must be documented as fallback.
- Community adapters cannot upgrade a target to supported without first-party validation.
- Route exploration must be adapter-backed or manifest-backed, never based on undocumented universal introspection promises.

## Performance Guardrails

- Performance budgets must distinguish between core runtime cost and lazy overlay cost.
- Transport interception overhead must be measured for pass-through and mocked requests separately.
- State reset must be deterministic and fast enough to encourage repeated use during development.

## UX Guardrails

- The overlay must clearly show active scenario state.
- The overlay must clearly show unsupported adapters or partially applied capabilities.
- Reset actions must be explicit and easy to understand.
- Temporary manual toggles must not be confused with persisted scenario defaults.

## Release Guardrails

No new framework, router, auth provider, or flag provider can be added to the supported list until:

1. an adapter contract exists
2. an example app exists
3. acceptance cases exist
4. setup documentation exists

If one of those is missing, the feature stays roadmap-only or fallback.
