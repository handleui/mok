import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { useDemoAuth } from "../lib/auth";
import { useDemoFlags } from "../lib/flags";
import { StatusPill } from "./status-pill";

export function AppLayout() {
  const { identity } = useDemoAuth();
  const { flags } = useDemoFlags();
  const location = useLocation();
  const flagState =
    flags.betaDashboard === true ? "beta dashboard enabled" : "baseline flags";

  return (
    <main className="shell">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Hybrid runtime demo</span>
          <h1>
            Real traffic stays live. Scenarios only override what you need.
          </h1>
          <p>
            This app is the first supported `apps/demo` target for mok. TanStack
            Router handles navigation, fetch passthrough stays real by default,
            and scenarios inject role, flag, and transport overrides without
            pretending to own the backend.
          </p>
          <div className="pill-row">
            <StatusPill
              label={`role: ${identity?.role ?? "guest"}`}
              tone="accent"
            />
            <StatusPill label={flagState} tone="neutral" />
            <StatusPill label={`route: ${location.pathname}`} tone="warning" />
          </div>
        </div>
        <div className="hero-panel">
          <strong>What this proves</strong>
          <ul>
            <li>Router-instance adapter integration</li>
            <li>Client-boundary auth simulation</li>
            <li>Local flag overrides</li>
            <li>Selective fetch mocks with passthrough fallback</li>
          </ul>
        </div>
      </section>

      <nav className="nav">
        <Link className="nav-link" to="/">
          Overview
        </Link>
        <Link className="nav-link" to="/dashboard">
          Dashboard
        </Link>
        <Link className="nav-link" to="/projects">
          Projects
        </Link>
      </nav>

      <Outlet />
    </main>
  );
}
