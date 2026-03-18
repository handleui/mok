export function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: "neutral" | "accent" | "warning";
}) {
  const backgrounds = {
    accent: "#dbeafe",
    neutral: "#e2e8f0",
    warning: "#ffedd5",
  };
  const colors = {
    accent: "#1d4ed8",
    neutral: "#0f172a",
    warning: "#c2410c",
  };

  return (
    <span
      style={{
        background: backgrounds[tone],
        borderRadius: 999,
        color: colors[tone],
        display: "inline-flex",
        fontSize: 12,
        fontWeight: 600,
        padding: "6px 12px",
      }}
    >
      {label}
    </span>
  );
}
