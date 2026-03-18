import type { MokAdapter, MokRuntimeContext, MokScenario } from "@mok/mok";
import { createStore, useStore } from "./create-store";

interface DemoAuthState {
  identity: MokScenario["identity"];
}

const authStore = createStore<DemoAuthState>({
  identity: undefined,
});

export function createDemoAuthAdapter(): MokAdapter {
  return {
    name: "demo-auth",
    kind: "auth",
    isAvailable() {
      return true;
    },
    getStatus(context: MokRuntimeContext) {
      const identity = context.getState().resolvedScenario.identity;
      const role = identity?.role ?? "guest";

      return {
        ready: true,
        supportedFeatures: ["client identity simulation", "role switching"],
        unsupportedFeatures: ["server session forgery", "middleware bypass"],
        message: `Simulating client identity as ${role}. Backend authorization remains real.`,
      };
    },
    applyScenario(context) {
      authStore.setState({
        identity: context.scenario.identity,
      });
    },
    reset() {
      authStore.setState({
        identity: undefined,
      });
    },
  };
}

export function useDemoAuth() {
  return useStore(authStore);
}
