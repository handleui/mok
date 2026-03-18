import { useSyncExternalStore } from "react";
import { createRoot, type Root } from "react-dom/client";

interface OverlayRuntimeState {
  adapterStatuses: Array<{
    name: string;
    kind: string;
    status: {
      ready: boolean;
      message?: string;
    };
  }>;
  availableRoutes: Array<{ id: string; label: string; path: string }>;
  currentRoute: string | null;
  requestLog: Array<{
    id: string;
    method: string;
    mocked: boolean;
    url: string;
  }>;
  scenarios: Array<{ id: string; label: string }>;
  selectedScenarioId: string | null;
}

interface OverlayRuntime {
  clearPersistedState(): Promise<void>;
  getState(): OverlayRuntimeState;
  navigate(path: string): Promise<void>;
  resetCurrentSession(): Promise<void>;
  selectScenario(id: string): Promise<void>;
  subscribe(listener: () => void): () => void;
}

interface OverlayHandle {
  render(runtime: OverlayRuntime): void;
  unmount(): void;
}

let overlayNode: HTMLDivElement | null = null;
let overlayRoot: Root | null = null;

function useRuntimeState(runtime: OverlayRuntime) {
  return useSyncExternalStore(
    runtime.subscribe,
    runtime.getState,
    runtime.getState
  );
}

function Overlay({ runtime }: { runtime: OverlayRuntime }) {
  const state = useRuntimeState(runtime);

  return (
    <aside
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 9999,
        width: 360,
        maxHeight: "calc(100vh - 32px)",
        overflow: "auto",
        borderRadius: 20,
        border: "1px solid rgba(15, 23, 42, 0.18)",
        background:
          "linear-gradient(180deg, rgba(248, 250, 252, 0.97), rgba(226, 232, 240, 0.95))",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
        color: "#0f172a",
        fontFamily: '"IBM Plex Sans", "Avenir Next", sans-serif',
        backdropFilter: "blur(10px)",
      }}
    >
      <div style={{ padding: 20, display: "grid", gap: 16 }}>
        <header style={{ display: "grid", gap: 4 }}>
          <strong
            style={{
              fontSize: 16,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            mok
          </strong>
          <span style={{ color: "#334155", fontSize: 13 }}>
            Hybrid runtime: real backend by default, selective scenario
            overrides.
          </span>
        </header>

        <section style={{ display: "grid", gap: 8 }}>
          <label
            htmlFor="mok-scenario"
            style={{ fontSize: 12, color: "#475569" }}
          >
            Active scenario
          </label>
          <select
            id="mok-scenario"
            onChange={(event) => {
              runtime.selectScenario(event.target.value).catch((error) => {
                console.error("Failed to switch mok scenario.", error);
              });
            }}
            style={{
              borderRadius: 12,
              border: "1px solid rgba(51, 65, 85, 0.18)",
              padding: "10px 12px",
              background: "#ffffff",
            }}
            value={state.selectedScenarioId ?? ""}
          >
            {state.scenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.label}
              </option>
            ))}
          </select>
        </section>

        <section style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#475569",
            }}
          >
            <span>Current route</span>
            <span>{state.currentRoute ?? "unknown"}</span>
          </div>
          {state.availableRoutes.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {state.availableRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => {
                    runtime.navigate(route.path).catch((error) => {
                      console.error("Failed to navigate with mok.", error);
                    });
                  }}
                  style={{
                    borderRadius: 999,
                    border: "none",
                    padding: "8px 12px",
                    background: "#0f172a",
                    color: "#f8fafc",
                    cursor: "pointer",
                  }}
                  type="button"
                >
                  {route.label}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
              No adapter-backed route list yet. Register a route manifest for
              explorer support.
            </p>
          )}
        </section>

        <section style={{ display: "grid", gap: 8 }}>
          <strong
            style={{
              fontSize: 12,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Adapter status
          </strong>
          <div style={{ display: "grid", gap: 8 }}>
            {state.adapterStatuses.map((entry) => (
              <article
                key={`${entry.kind}-${entry.name}`}
                style={{
                  borderRadius: 14,
                  padding: 12,
                  background: "#ffffff",
                  border: "1px solid rgba(148, 163, 184, 0.22)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <strong>{entry.name}</strong>
                  <span
                    style={{
                      color: entry.status.ready ? "#166534" : "#9a3412",
                      fontSize: 12,
                      textTransform: "uppercase",
                    }}
                  >
                    {entry.status.ready ? "ready" : "partial"}
                  </span>
                </div>
                {entry.status.message ? (
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#334155",
                      fontSize: 13,
                    }}
                  >
                    {entry.status.message}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section style={{ display: "grid", gap: 8 }}>
          <strong
            style={{
              fontSize: 12,
              color: "#475569",
              textTransform: "uppercase",
            }}
          >
            Recent traffic
          </strong>
          {state.requestLog.length > 0 ? (
            <div style={{ display: "grid", gap: 6 }}>
              {state.requestLog.map((request) => (
                <div
                  key={request.id}
                  style={{
                    display: "grid",
                    gap: 2,
                    borderRadius: 12,
                    padding: 10,
                    background: request.mocked ? "#fff7ed" : "#f8fafc",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: request.mocked ? "#9a3412" : "#0f172a",
                    }}
                  >
                    {request.mocked ? "mocked" : "real"} {request.method}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: "#475569",
                      wordBreak: "break-all",
                    }}
                  >
                    {request.url}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
              Request activity will appear here after navigation or data loads.
            </p>
          )}
        </section>

        <section style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => {
              runtime.resetCurrentSession().catch((error) => {
                console.error("Failed to reset the mok session.", error);
              });
            }}
            style={{
              flex: 1,
              borderRadius: 12,
              border: "1px solid rgba(51, 65, 85, 0.18)",
              padding: "10px 12px",
              background: "#ffffff",
              cursor: "pointer",
            }}
            type="button"
          >
            Reset session
          </button>
          <button
            onClick={() => {
              runtime.clearPersistedState().catch((error) => {
                console.error("Failed to clear persisted mok state.", error);
              });
            }}
            style={{
              flex: 1,
              borderRadius: 12,
              border: "none",
              padding: "10px 12px",
              background: "#0f172a",
              color: "#f8fafc",
              cursor: "pointer",
            }}
            type="button"
          >
            Clear persisted
          </button>
        </section>
      </div>
    </aside>
  );
}

function renderOverlay(runtime: OverlayRuntime): void {
  if (!overlayRoot) {
    return;
  }

  overlayRoot.render(<Overlay runtime={runtime} />);
}

export function mountMokOverlay(runtime: OverlayRuntime): OverlayHandle {
  if (!overlayNode) {
    overlayNode = document.createElement("div");
    overlayNode.id = "mok-overlay-root";
    document.body.append(overlayNode);
    overlayRoot = createRoot(overlayNode);
  }

  renderOverlay(runtime);

  return {
    render(nextRuntime) {
      renderOverlay(nextRuntime);
    },
    unmount() {
      overlayRoot?.unmount();
      overlayNode?.remove();
      overlayRoot = null;
      overlayNode = null;
    },
  };
}
