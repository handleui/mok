export type MokPrimitive = string | number | boolean | null;

export interface MokMockDefinition {
  delayMs?: number;
  id?: string;
  method?: string;
  passthrough?: boolean;
  response?: unknown;
  status?: number;
  url: string | RegExp;
}

export interface MokScenario {
  description?: string;
  flags?: Record<string, MokPrimitive>;
  id: string;
  identity?: {
    role?: string;
    user?: Record<string, unknown> | null;
    org?: Record<string, unknown> | null;
    permissions?: string[];
    session?: Record<string, unknown> | null;
  };
  label: string;
  metadata?: Record<string, MokPrimitive>;
  mocks?: Array<string | MokMockDefinition>;
  route?: {
    initialPath?: string;
    params?: Record<string, string>;
    search?: Record<string, MokPrimitive>;
  };
  seededState?: Record<string, unknown>;
  tags?: string[];
}

export interface MokRouteDefinition {
  id: string;
  label: string;
  path: string;
}

export interface MokAdapterStatus {
  message?: string;
  ready: boolean;
  supportedFeatures: string[];
  unsupportedFeatures: string[];
}

export interface MokResolvedScenario {
  flags: Record<string, MokPrimitive>;
  identity: MokScenario["identity"];
  metadata: Record<string, MokPrimitive>;
  mocks: MokMockDefinition[];
  route: MokScenario["route"];
  scenarioId: string | null;
  seededState: Record<string, unknown>;
}

export interface MokRequestLogEntry {
  id: string;
  method: string;
  mocked: boolean;
  scenarioId: string | null;
  timestamp: number;
  url: string;
}

export interface MokRuntimeState {
  adapterStatuses: Array<{
    kind: MokAdapter["kind"];
    name: string;
    status: MokAdapterStatus;
  }>;
  availableRoutes: MokRouteDefinition[];
  currentRoute: string | null;
  requestLog: MokRequestLogEntry[];
  resolvedScenario: MokResolvedScenario;
  scenarios: MokScenario[];
  selectedScenarioId: string | null;
}

export interface MokRuntimeContext {
  getState(): MokRuntimeState;
  recordRequest(entry: Omit<MokRequestLogEntry, "id" | "timestamp">): void;
  setAvailableRoutes(routes: MokRouteDefinition[]): void;
  setCurrentRoute(path: string | null): void;
}

export type MokApplyScenarioContext = MokRuntimeContext & {
  scenario: MokResolvedScenario;
};

export type MokNavigateContext = MokRuntimeContext & {
  path: string;
};

export interface MokAdapter {
  applyScenario?(context: MokApplyScenarioContext): void | Promise<void>;
  getCurrentRoute?(context: MokRuntimeContext): string | null;
  getRoutes?(context: MokRuntimeContext): MokRouteDefinition[];
  getStatus(context: MokRuntimeContext): MokAdapterStatus;
  isAvailable(): boolean;
  kind: "auth" | "flags" | "router" | "transport";
  name: string;
  navigate?(context: MokNavigateContext): void | Promise<void>;
  reset?(context: MokRuntimeContext): void | Promise<void>;
  setup?(context: MokRuntimeContext): void | Promise<void>;
  teardown?(context: MokRuntimeContext): void | Promise<void>;
}

export interface MokConfig {
  adapters: MokAdapter[];
  defaults?: Omit<Partial<MokScenario>, "id" | "label">;
  namedMocks?: Record<string, MokMockDefinition>;
  scenarios: MokScenario[];
}

export interface MokRuntime {
  clearPersistedState(): Promise<void>;
  destroy(): Promise<void>;
  getState(): MokRuntimeState;
  navigate(path: string): Promise<void>;
  resetCurrentSession(): Promise<void>;
  selectScenario(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}
