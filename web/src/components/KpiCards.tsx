interface Kpi {
  label: string;
  value: number | string;
}

export function KpiCards({ items }: { items: Kpi[] }) {
  return (
    <div className="kpi-row">
      {items.map((k) => (
        <div className="kpi-card" key={k.label}>
          <div className="kpi-label">{k.label}</div>
          <div className="kpi-value">{k.value}</div>
        </div>
      ))}
    </div>
  );
}
