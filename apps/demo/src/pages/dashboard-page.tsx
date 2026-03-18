import { useDemoAuth } from "../lib/auth";
import { useDemoFlags } from "../lib/flags";

export function DashboardPage() {
  const { identity } = useDemoAuth();
  const { flags } = useDemoFlags();
  const isAdmin = identity?.role === "admin";

  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Identity</h2>
        <p>
          Current user:{" "}
          <strong>
            {identity?.user?.name?.toString() ?? "No simulated user"}
          </strong>
        </p>
        <p>
          Permissions:{" "}
          <strong>{identity?.permissions?.join(", ") ?? "none"}</strong>
        </p>
      </article>
      <article className="panel">
        <h2>Flags</h2>
        <p>betaDashboard: {String(flags.betaDashboard ?? false)}</p>
        <p>newProjectComposer: {String(flags.newProjectComposer ?? false)}</p>
      </article>
      <article className="panel">
        <h2>Role-aware view</h2>
        <p>
          {isAdmin
            ? "Admins can see the rollout controls and audit summary."
            : "Guests and members see the safer baseline dashboard surface."}
        </p>
      </article>
    </section>
  );
}
