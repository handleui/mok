import { useSyncExternalStore } from "react";

type Listener = () => void;

export function createStore<T>(initialState: T) {
  let state = initialState;
  const listeners = new Set<Listener>();

  return {
    getState() {
      return state;
    },
    setState(nextState: T) {
      state = nextState;
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe(listener: Listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

export function useStore<T>(store: ReturnType<typeof createStore<T>>) {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}
