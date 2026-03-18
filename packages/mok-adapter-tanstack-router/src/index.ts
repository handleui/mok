import type {
  MokAdapter,
  MokApplyScenarioContext,
  MokNavigateContext,
  MokRouteDefinition,
  MokRuntimeContext,
} from "@mok/mok";

interface TanStackRouterLike {
  navigate: (options: { to: string }) => Promise<unknown> | unknown;
  state: {
    location?: {
      pathname?: string;
    };
  };
  subscribe?: (
    eventType: "onResolved",
    listener: () => void
  ) => (() => void) | undefined;
}

interface TanStackRouterAdapterOptions {
  router: TanStackRouterLike;
  routes?: MokRouteDefinition[];
}

function getCurrentPath(router: TanStackRouterLike) {
  return router.state.location?.pathname ?? null;
}

export function tanstackRouterAdapter({
  router,
  routes = [],
}: TanStackRouterAdapterOptions): MokAdapter {
  let unsubscribe: (() => void) | null = null;

  return {
    name: "tanstack-router",
    kind: "router",
    isAvailable() {
      return typeof router.navigate === "function";
    },
    getStatus(_context: MokRuntimeContext) {
      return {
        ready: this.isAvailable(),
        supportedFeatures: [
          "router.navigate",
          "current route awareness",
          "manual route manifest",
        ],
        unsupportedFeatures: ["universal auto route discovery"],
        message:
          routes.length > 0
            ? "Using the router instance with manual route manifest fallback."
            : "Navigation is active. Register a route manifest for explorer support.",
      };
    },
    applyScenario(context: MokApplyScenarioContext) {
      context.setCurrentRoute(getCurrentPath(router));
      context.setAvailableRoutes(routes);
    },
    setup(context: MokRuntimeContext) {
      context.setCurrentRoute(getCurrentPath(router));
      context.setAvailableRoutes(routes);

      if (!router.subscribe) {
        return;
      }

      const detach = router.subscribe("onResolved", () => {
        context.setCurrentRoute(getCurrentPath(router));
      });

      unsubscribe = typeof detach === "function" ? detach : null;
    },
    teardown() {
      unsubscribe?.();
      unsubscribe = null;
    },
    navigate(context: MokNavigateContext) {
      return Promise.resolve(router.navigate({ to: context.path })).then(() => {
        context.setCurrentRoute(getCurrentPath(router));
      });
    },
    getCurrentRoute() {
      return getCurrentPath(router);
    },
    getRoutes() {
      return routes;
    },
  };
}
