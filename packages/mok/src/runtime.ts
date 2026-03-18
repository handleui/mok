import type {
  MokAdapter,
  MokConfig,
  MokMockDefinition,
  MokRequestLogEntry,
  MokResolvedScenario,
  MokRouteDefinition,
  MokRuntime,
  MokRuntimeContext,
  MokRuntimeState,
  MokScenario,
} from "./types";

export type {
  MokAdapter,
  MokAdapterStatus,
  MokApplyScenarioContext,
  MokConfig,
  MokMockDefinition,
  MokNavigateContext,
  MokPrimitive,
  MokRequestLogEntry,
  MokResolvedScenario,
  MokRouteDefinition,
  MokRuntime,
  MokRuntimeContext,
  MokRuntimeState,
  MokScenario,
} from "./types";

const STORAGE_KEYS = {
  activeScenario: "mok_active_scenario",
  flags: "mok_flags",
  identity: "mok_identity",
  mocks: "mok_mocks",
  seededState: "mok_seeded_state",
} as const;

const initialResolvedScenario: MokResolvedScenario = {
  flags: {},
  identity: undefined,
  metadata: {},
  mocks: [],
  route: undefined,
  scenarioId: null,
  seededState: {},
};

const appliedSeededStateKeys = {
  localStorage: new Set<string>(),
  sessionStorage: new Set<string>(),
};

type Listener = () => void;

interface OverlayHandle {
  render(runtime: InternalRuntime): void;
  unmount(): void;
}

type InternalRuntime = MokRuntime & {
  __config: MokConfig;
  __notify: () => void;
};

let activeRuntime: InternalRuntime | null = null;
let fetchInterceptorInstalled = false;
let nativeFetch: typeof window.fetch | null = null;
let overlayHandle: OverlayHandle | null = null;
let runtimeState: MokRuntimeState = {
  adapterStatuses: [],
  availableRoutes: [],
  currentRoute: null,
  requestLog: [],
  resolvedScenario: initialResolvedScenario,
  scenarios: [],
  selectedScenarioId: null,
};

declare global {
  interface Window {
    __MOK_DEV_ENABLED__?: boolean;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

function cloneMockDefinition(mock: MokMockDefinition): MokMockDefinition {
  return {
    ...mock,
    url:
      typeof mock.url === "string"
        ? mock.url
        : new RegExp(mock.url.source, mock.url.flags),
  };
}

function replaceState(partialState: Partial<MokRuntimeState>): void {
  runtimeState = {
    ...runtimeState,
    ...partialState,
  };
}

function notifyActiveRuntime(): void {
  activeRuntime?.__notify();
}

function parseStoredJson<T>(key: string, fallback: T): T {
  if (!isBrowser()) {
    return fallback;
  }

  const rawValue = window.localStorage.getItem(key);

  if (!rawValue) {
    return fallback;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

function persistResolvedScenario(scenario: MokResolvedScenario): void {
  if (!isBrowser()) {
    return;
  }

  if (scenario.scenarioId) {
    window.localStorage.setItem(
      STORAGE_KEYS.activeScenario,
      scenario.scenarioId
    );
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.activeScenario);
  }

  if (scenario.identity === undefined) {
    window.localStorage.removeItem(STORAGE_KEYS.identity);
  } else {
    window.localStorage.setItem(
      STORAGE_KEYS.identity,
      JSON.stringify(scenario.identity)
    );
  }

  if (Object.keys(scenario.flags).length === 0) {
    window.localStorage.removeItem(STORAGE_KEYS.flags);
  } else {
    window.localStorage.setItem(
      STORAGE_KEYS.flags,
      JSON.stringify(scenario.flags)
    );
  }

  if (scenario.mocks.length === 0) {
    window.localStorage.removeItem(STORAGE_KEYS.mocks);
  } else {
    const serializableMocks = scenario.mocks.filter(
      (mock) => typeof mock.url === "string"
    );
    window.localStorage.setItem(
      STORAGE_KEYS.mocks,
      JSON.stringify(serializableMocks)
    );
  }

  if (Object.keys(scenario.seededState).length === 0) {
    window.localStorage.removeItem(STORAGE_KEYS.seededState);
  } else {
    window.localStorage.setItem(
      STORAGE_KEYS.seededState,
      JSON.stringify(scenario.seededState)
    );
  }
}

function clearPersistedKeys(): void {
  if (!isBrowser()) {
    return;
  }

  for (const key of Object.values(STORAGE_KEYS)) {
    window.localStorage.removeItem(key);
  }
}

function clearAppliedSeededState(): void {
  if (!isBrowser()) {
    return;
  }

  for (const key of appliedSeededStateKeys.localStorage) {
    window.localStorage.removeItem(key);
  }

  for (const key of appliedSeededStateKeys.sessionStorage) {
    window.sessionStorage.removeItem(key);
  }

  appliedSeededStateKeys.localStorage.clear();
  appliedSeededStateKeys.sessionStorage.clear();
}

function resolveMocks(
  config: MokConfig,
  defaults: MokConfig["defaults"],
  scenario: MokScenario | undefined
): MokMockDefinition[] {
  const candidates = [...(defaults?.mocks ?? []), ...(scenario?.mocks ?? [])];

  return candidates.flatMap((candidate: string | MokMockDefinition) => {
    if (typeof candidate !== "string") {
      return [cloneMockDefinition(candidate)];
    }

    const namedMock = config.namedMocks?.[candidate];

    return namedMock ? [cloneMockDefinition(namedMock)] : [];
  });
}

function resolveScenario(
  config: MokConfig,
  scenarioId: string | null
): MokResolvedScenario {
  const persistedIdentity = parseStoredJson<MokResolvedScenario["identity"]>(
    STORAGE_KEYS.identity,
    undefined
  );
  const persistedFlags = parseStoredJson<
    Record<string, string | number | boolean | null>
  >(STORAGE_KEYS.flags, {});
  const persistedMocks = parseStoredJson<MokMockDefinition[]>(
    STORAGE_KEYS.mocks,
    []
  );
  const persistedSeededState = parseStoredJson<Record<string, unknown>>(
    STORAGE_KEYS.seededState,
    {}
  );
  const defaults = config.defaults;
  const scenario = config.scenarios.find(
    (candidate: MokScenario) => candidate.id === scenarioId
  );

  return {
    flags: {
      ...(defaults?.flags ?? {}),
      ...persistedFlags,
      ...(scenario?.flags ?? {}),
    },
    identity: scenario?.identity ?? persistedIdentity ?? defaults?.identity,
    metadata: {
      ...(defaults?.metadata ?? {}),
      ...(scenario?.metadata ?? {}),
    },
    mocks: scenario ? resolveMocks(config, defaults, scenario) : persistedMocks,
    route: scenario?.route ?? defaults?.route,
    scenarioId: scenario?.id ?? null,
    seededState: {
      ...(defaults?.seededState ?? {}),
      ...persistedSeededState,
      ...(scenario?.seededState ?? {}),
    },
  };
}

function applySeededState(seededState: Record<string, unknown>): void {
  if (!isBrowser()) {
    return;
  }

  clearAppliedSeededState();

  const localStorageState =
    seededState.localStorage && typeof seededState.localStorage === "object"
      ? (seededState.localStorage as Record<string, unknown>)
      : {};
  const sessionStorageState =
    seededState.sessionStorage && typeof seededState.sessionStorage === "object"
      ? (seededState.sessionStorage as Record<string, unknown>)
      : {};

  for (const [key, value] of Object.entries(localStorageState)) {
    window.localStorage.setItem(key, JSON.stringify(value));
    appliedSeededStateKeys.localStorage.add(key);
  }

  for (const [key, value] of Object.entries(sessionStorageState)) {
    window.sessionStorage.setItem(key, JSON.stringify(value));
    appliedSeededStateKeys.sessionStorage.add(key);
  }
}

function syncAdapterMetadata(
  context: MokRuntimeContext,
  adapters: MokAdapter[]
): void {
  const availableRoutes = adapters.flatMap(
    (adapter: MokAdapter) => adapter.getRoutes?.(context) ?? []
  );
  const dedupedRoutes = new Map<string, MokRouteDefinition>();

  for (const route of availableRoutes) {
    dedupedRoutes.set(route.id, route);
  }

  context.setAvailableRoutes([...dedupedRoutes.values()]);

  const routerAdapter = adapters.find(
    (adapter: MokAdapter) => adapter.kind === "router"
  );
  context.setCurrentRoute(routerAdapter?.getCurrentRoute?.(context) ?? null);
}

function collectStatuses(
  context: MokRuntimeContext,
  adapters: MokAdapter[]
): void {
  if (!activeRuntime) {
    return;
  }

  replaceState({
    adapterStatuses: adapters.map((adapter) => ({
      kind: adapter.kind,
      name: adapter.name,
      status: adapter.getStatus(context),
    })),
  });
}

function createContext(
  getState: () => MokRuntimeState,
  notify: () => void
): MokRuntimeContext {
  return {
    getState,
    recordRequest(entry) {
      const state = getState();
      const nextEntry: MokRequestLogEntry = {
        ...entry,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
      };

      replaceState({
        requestLog: [nextEntry, ...state.requestLog].slice(0, 12),
      });
      notify();
    },
    setAvailableRoutes(routes) {
      replaceState({
        availableRoutes: routes,
      });
      notify();
    },
    setCurrentRoute(path) {
      replaceState({
        currentRoute: path,
      });
      notify();
    },
  };
}

function recordRuntimeRequest(
  entry: Omit<MokRequestLogEntry, "id" | "timestamp">
): void {
  if (!activeRuntime) {
    return;
  }

  const nextEntry: MokRequestLogEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };

  replaceState({
    requestLog: [nextEntry, ...activeRuntime.getState().requestLog].slice(
      0,
      12
    ),
  });
  notifyActiveRuntime();
}

function validateConfig(config: MokConfig): void {
  const seenIds = new Set<string>();

  for (const scenario of config.scenarios) {
    if (seenIds.has(scenario.id)) {
      throw new Error(`Duplicate mok scenario id "${scenario.id}".`);
    }

    seenIds.add(scenario.id);
  }
}

function matchesRequest(
  mock: MokMockDefinition,
  url: string,
  method: string
): boolean {
  const matchesMethod =
    (mock.method ?? "GET").toUpperCase() === method.toUpperCase();

  if (!matchesMethod) {
    return false;
  }

  if (typeof mock.url === "string") {
    return url.includes(mock.url);
  }

  return mock.url.test(url);
}

async function createMockResponse(mock: MokMockDefinition): Promise<Response> {
  if (mock.delayMs) {
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, mock.delayMs);
    });
  }

  const status = mock.status ?? 200;
  const body =
    mock.response === undefined ? "" : JSON.stringify(mock.response, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
    },
    status,
  });
}

function getRequestUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") {
    return input;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return input.url;
}

function getRequestMethod(
  input: RequestInfo | URL,
  init?: RequestInit
): string {
  if (init?.method) {
    return init.method;
  }

  if (
    typeof input === "object" &&
    "method" in input &&
    typeof input.method === "string"
  ) {
    return input.method;
  }

  return "GET";
}

function installFetchInterceptor(): void {
  if (!isBrowser() || fetchInterceptorInstalled) {
    return;
  }

  nativeFetch = window.fetch.bind(window);
  fetchInterceptorInstalled = true;

  window.fetch = (input, init) => {
    const currentRuntime = activeRuntime;
    const url = getRequestUrl(input);
    const method = getRequestMethod(input, init);
    const activeMocks = currentRuntime?.getState().resolvedScenario.mocks ?? [];
    const matchingMock = activeMocks.find((mock: MokMockDefinition) =>
      matchesRequest(mock, url, method)
    );

    if (matchingMock && !matchingMock.passthrough) {
      recordRuntimeRequest({
        method,
        mocked: true,
        scenarioId: currentRuntime?.getState().selectedScenarioId ?? null,
        url,
      });

      return createMockResponse(matchingMock);
    }

    recordRuntimeRequest({
      method,
      mocked: false,
      scenarioId: currentRuntime?.getState().selectedScenarioId ?? null,
      url,
    });

    if (!nativeFetch) {
      throw new Error("Missing native fetch implementation.");
    }

    return nativeFetch(input, init);
  };
}

function isDevtoolsEnabled(): boolean {
  return isBrowser() && window.__MOK_DEV_ENABLED__ === true;
}

async function mountOverlay(runtime: InternalRuntime): Promise<void> {
  if (!isDevtoolsEnabled()) {
    return;
  }

  if (overlayHandle) {
    overlayHandle.render(runtime);
    return;
  }

  const overlayModule = await import("@mok/mok-overlay");
  overlayHandle = overlayModule.mountMokOverlay(runtime) as OverlayHandle;
}

async function applyScenario(
  runtime: InternalRuntime,
  scenarioId: string | null
): Promise<void> {
  const context = createContext(runtime.getState, runtime.__notify);
  const resolvedScenario = resolveScenario(runtime.__config, scenarioId);

  replaceState({
    resolvedScenario,
    selectedScenarioId: resolvedScenario.scenarioId,
  });
  persistResolvedScenario(resolvedScenario);
  applySeededState(resolvedScenario.seededState);

  for (const adapter of runtime.__config.adapters) {
    await adapter.applyScenario?.({
      ...context,
      scenario: resolvedScenario,
    });
  }

  const routerAdapter = runtime.__config.adapters.find(
    (adapter: MokAdapter) => adapter.kind === "router"
  );

  if (resolvedScenario.route?.initialPath && routerAdapter?.navigate) {
    await routerAdapter.navigate({
      ...context,
      path: resolvedScenario.route.initialPath,
    });
  }

  syncAdapterMetadata(context, runtime.__config.adapters);
  collectStatuses(context, runtime.__config.adapters);
  runtime.__notify();
}

export function getMokRuntime(): MokRuntime | null {
  return activeRuntime;
}

export async function defineMok(config: MokConfig): Promise<MokRuntime> {
  validateConfig(config);

  if (activeRuntime) {
    await activeRuntime.destroy();
  }

  runtimeState = {
    adapterStatuses: [],
    availableRoutes: [],
    currentRoute: null,
    requestLog: [],
    resolvedScenario: initialResolvedScenario,
    scenarios: config.scenarios,
    selectedScenarioId: null,
  };

  const listeners = new Set<Listener>();
  const notify = () => {
    for (const listener of listeners) {
      listener();
    }
  };
  const context = createContext(() => runtimeState, notify);

  installFetchInterceptor();

  const runtime: InternalRuntime = {
    __config: config,
    __notify: notify,
    async clearPersistedState() {
      clearPersistedKeys();
      clearAppliedSeededState();

      for (const adapter of config.adapters) {
        await adapter.reset?.(createContext(runtime.getState, notify));
      }

      replaceState({
        currentRoute: null,
        requestLog: [],
      });

      await applyScenario(runtime, null);
    },
    async destroy() {
      for (const adapter of config.adapters) {
        await adapter.teardown?.(createContext(runtime.getState, notify));
      }

      clearAppliedSeededState();
      listeners.clear();
      activeRuntime = null;

      if (overlayHandle) {
        overlayHandle.unmount();
        overlayHandle = null;
      }
    },
    getState() {
      return runtimeState;
    },
    async navigate(path) {
      const routerAdapter = config.adapters.find(
        (adapter: MokAdapter) => adapter.kind === "router"
      );

      if (!routerAdapter?.navigate) {
        return;
      }

      await routerAdapter.navigate({
        ...createContext(runtime.getState, notify),
        path,
      });
      syncAdapterMetadata(
        createContext(runtime.getState, notify),
        config.adapters
      );
      notify();
    },
    async resetCurrentSession() {
      clearAppliedSeededState();

      for (const adapter of config.adapters) {
        await adapter.reset?.(createContext(runtime.getState, notify));
      }

      await applyScenario(runtime, runtime.getState().selectedScenarioId);
    },
    async selectScenario(id) {
      await applyScenario(runtime, id);
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };

  activeRuntime = runtime;

  for (const adapter of config.adapters) {
    await adapter.setup?.(context);
  }

  const initialScenarioId =
    parseStoredJson<string | null>(STORAGE_KEYS.activeScenario, null) ??
    config.scenarios[0]?.id ??
    null;

  await applyScenario(runtime, initialScenarioId);
  await mountOverlay(runtime);

  return runtime;
}

export function enableMokDevMode(): void {
  if (!isBrowser()) {
    return;
  }

  window.__MOK_DEV_ENABLED__ = true;

  if (!activeRuntime) {
    return;
  }

  mountOverlay(activeRuntime).catch((error) => {
    console.error("Failed to mount the mok overlay.", error);
  });
}

export function createFetchAdapter(): MokAdapter {
  return {
    getStatus(context) {
      const activeMocks = context.getState().resolvedScenario.mocks;

      return {
        message:
          activeMocks.length > 0
            ? `${activeMocks.length} active mock${activeMocks.length === 1 ? "" : "s"} with passthrough fallback.`
            : "Passthrough mode active. Unmatched requests use the real backend.",
        ready: this.isAvailable(),
        supportedFeatures: [
          "selective fetch mocks",
          "request passthrough",
          "request logging",
        ],
        unsupportedFeatures: ["xhr", "websockets", "server fetch"],
      };
    },
    isAvailable() {
      return isBrowser() && typeof window.fetch === "function";
    },
    kind: "transport",
    name: "browser-fetch",
  };
}
