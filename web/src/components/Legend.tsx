export function Legend() {
  return (
    <div className="legend" aria-label="Cell legend">
      <span className="legend-item">
        <span className="cell available legend-swatch">✓</span> Generally available
      </span>
      <span className="legend-item">
        <span className="cell available preview legend-swatch">◐</span> Preview
      </span>
      <span className="legend-item">
        <span className="cell available deprecating legend-swatch">⚠</span> Deprecating
      </span>
    </div>
  );
}
