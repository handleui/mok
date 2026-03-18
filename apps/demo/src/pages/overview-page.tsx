export function OverviewPage() {
  return (
    <section className="page-grid">
      <article className="panel">
        <h2>Scenario-first</h2>
        <p>
          Choose a scenario from the overlay to reapply route, identity, flags,
          seeded state, and mocks from a single declarative source.
        </p>
      </article>
      <article className="panel">
        <h2>Honest support boundaries</h2>
        <p>
          mok shows when behavior is real, mocked, simulated, or partial. It
          does not claim server impersonation or hidden route discovery it
          cannot guarantee.
        </p>
      </article>
      <article className="panel">
        <h2>Hybrid by default</h2>
        <p>
          The Projects route fetches a real static endpoint when no scenario
          mock matches. Error, empty, and delayed states are injected only when
          explicitly requested.
        </p>
      </article>
    </section>
  );
}
