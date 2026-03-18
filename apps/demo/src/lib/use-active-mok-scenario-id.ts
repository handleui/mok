import { getMokRuntime } from "@mok/mok";
import { useSyncExternalStore } from "react";

function noop() {
  return undefined;
}

function subscribe(listener: () => void): () => void {
  return getMokRuntime()?.subscribe(listener) ?? noop;
}

function getSnapshot(): string | null {
  return getMokRuntime()?.getState().selectedScenarioId ?? null;
}

export function useActiveMokScenarioId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
