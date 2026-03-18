import type { MokAdapter, MokPrimitive, MokRuntimeContext } from "@mok/mok";
import { createStore, useStore } from "./create-store";

interface DemoFlagsState {
  flags: Record<string, MokPrimitive>;
}

const flagsStore = createStore<DemoFlagsState>({
  flags: {},
});

export function createDemoFlagsAdapter(): MokAdapter {
  return {
    name: "demo-flags",
    kind: "flags",
    isAvailable() {
      return true;
    },
    getStatus(context: MokRuntimeContext) {
      const activeFlags = Object.keys(
        context.getState().resolvedScenario.flags
      );

      return {
        ready: true,
        supportedFeatures: ["local flag overrides"],
        unsupportedFeatures: ["provider sync without a provider adapter"],
        message:
          activeFlags.length > 0
            ? `Overriding ${activeFlags.length} flag${activeFlags.length === 1 ? "" : "s"} locally.`
            : "No flag overrides active. The app is using its baseline values.",
      };
    },
    applyScenario(context) {
      flagsStore.setState({
        flags: context.scenario.flags,
      });
    },
    reset() {
      flagsStore.setState({
        flags: {},
      });
    },
  };
}

export function useDemoFlags() {
  return useStore(flagsStore);
}
