import { useQuery } from "@tanstack/react-query";
import { StatusPill } from "../components/status-pill";
import { useActiveMokScenarioId } from "../lib/use-active-mok-scenario-id";

interface ProjectsResponse {
  projects: Array<{ id: string; name: string; status: string }>;
}

async function fetchProjects(): Promise<ProjectsResponse> {
  const response = await fetch("/api/projects.json");

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return (await response.json()) as ProjectsResponse;
}

export function ProjectsPage() {
  const activeScenarioId = useActiveMokScenarioId();
  const projectsQuery = useQuery({
    queryFn: fetchProjects,
    queryKey: ["projects", activeScenarioId],
  });
  const projects = projectsQuery.data?.projects ?? [];
  let status: "loading" | "error" | "success" = "success";

  if (projectsQuery.isPending) {
    status = "loading";
  } else if (projectsQuery.isError) {
    status = "error";
  }

  return (
    <section className="page-grid">
      <article className="panel panel-wide">
        <div className="panel-header">
          <div>
            <h2>Projects transport demo</h2>
            <p>
              Baseline scenario hits the real static endpoint. Other scenarios
              selectively override the same request.
            </p>
          </div>
          <StatusPill
            label={status === "success" ? "real or mocked success" : status}
            tone={status === "error" ? "warning" : "accent"}
          />
        </div>

        {status === "loading" ? (
          <div className="project-grid">
            {[
              "project-skeleton-a",
              "project-skeleton-b",
              "project-skeleton-c",
            ].map((key) => (
              <div className="project-skeleton" key={key} />
            ))}
          </div>
        ) : null}

        {status === "error" ? (
          <p className="error-text">
            {projectsQuery.error instanceof Error
              ? projectsQuery.error.message
              : "Unknown error"}
          </p>
        ) : null}

        {status === "success" && projects.length === 0 ? (
          <p className="empty-text">
            The API responded successfully, but there are no projects.
          </p>
        ) : null}

        {status === "success" && projects.length > 0 ? (
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <strong>{project.name}</strong>
                <span>{project.status}</span>
              </article>
            ))}
          </div>
        ) : null}
      </article>
    </section>
  );
}
