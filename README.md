# mok workspace

This repository is a Turborepo workspace for mok.
The production domain is `trymok.com`.

## Workspace Shape

- `packages/mok`: hybrid scenario runtime
- `packages/mok-overlay`: lazy dev overlay surface
- `packages/mok-adapter-tanstack-router`: official TanStack Router adapter
- `packages/*`: runtime, adapters, shared UI, and config packages
- `apps/demo`: first official example app and support target
- `apps/*`: app-level entrypoints that consume the mok runtime
- `@mok/ui`: shared UI components and utilities
- `@mok/typescript-config`: shared TypeScript configuration

## Commands

```sh
bun install
bun run dev
bun run build
bun run lint
```
