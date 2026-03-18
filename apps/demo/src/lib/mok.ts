import type { MokScenario } from "@mok/mok";
import { createFetchAdapter, defineMok } from "@mok/mok";
import { tanstackRouterAdapter } from "@mok/mok-adapter-tanstack-router";
import { routeManifest } from "../route-manifest";
import { createDemoAuthAdapter } from "./auth";
import { createDemoFlagsAdapter } from "./flags";

type DemoRouter = Parameters<typeof tanstackRouterAdapter>[0]["router"];

const scenarios: MokScenario[] = [
  {
    id: "baseline-member",
    label: "Baseline member",
    description:
      "Real backend passthrough with a member identity and no transport overrides.",
    identity: {
      role: "member",
      user: {
        id: "user_maya",
        name: "Maya Patel",
        email: "maya@demo.dev",
      },
      permissions: ["projects:read"],
    },
    flags: {
      betaDashboard: false,
      newProjectComposer: false,
    },
    route: {
      initialPath: "/",
    },
  },
  {
    id: "admin-rollout",
    label: "Admin rollout",
    description: "Simulate an admin user and enable the beta dashboard.",
    identity: {
      role: "admin",
      user: {
        id: "user_ivy",
        name: "Ivy Ortega",
        email: "ivy@demo.dev",
      },
      permissions: ["projects:read", "flags:write", "billing:read"],
    },
    flags: {
      betaDashboard: true,
      newProjectComposer: true,
    },
    route: {
      initialPath: "/dashboard",
    },
  },
  {
    id: "projects-empty",
    label: "Projects empty state",
    description: "Override the projects response with an empty payload.",
    identity: {
      role: "member",
      user: {
        id: "user_maya",
        name: "Maya Patel",
        email: "maya@demo.dev",
      },
      permissions: ["projects:read"],
    },
    route: {
      initialPath: "/projects",
    },
    mocks: [
      {
        url: "/api/projects.json",
        response: {
          projects: [],
        },
      },
    ],
  },
  {
    id: "projects-delayed",
    label: "Projects delayed load",
    description:
      "Keep the route real, but inject a slow mocked response for loading exploration.",
    route: {
      initialPath: "/projects",
    },
    mocks: [
      {
        url: "/api/projects.json",
        delayMs: 1400,
        response: {
          projects: [
            { id: "project_delta", name: "Delta", status: "warming up" },
            { id: "project_echo", name: "Echo", status: "queued" },
          ],
        },
      },
    ],
  },
  {
    id: "projects-error",
    label: "Projects API error",
    description:
      "Force a deterministic API error without changing the rest of the app state.",
    route: {
      initialPath: "/projects",
    },
    mocks: [
      {
        url: "/api/projects.json",
        status: 503,
        response: {
          message: "Temporary outage",
        },
      },
    ],
  },
];

export function setupMok(appRouter: DemoRouter) {
  return defineMok({
    scenarios,
    adapters: [
      tanstackRouterAdapter({
        router: appRouter,
        routes: routeManifest,
      }),
      createDemoAuthAdapter(),
      createDemoFlagsAdapter(),
      createFetchAdapter(),
    ],
  });
}
