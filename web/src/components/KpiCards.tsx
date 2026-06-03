interface Kpi {
  label: string;
  value: number | string;
  tone?: "blue" | "green" | "amber";
}

export function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="kpi-row">
      {items.map((k) => (
        <div className={`kpi-card${k.tone ? ` kpi--${k.tone}` : ""}`} key={k.label}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">{k.value}</div>
        </div>
      ))}
    </div>
  );
}
