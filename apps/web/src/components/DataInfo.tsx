import type { Feature } from "@foundry/data-types";

interface Props {
  features: readonly Feature[];
}

interface SourceLink {
  url: string;
  labels: string[];
}

function collapseLabels(labels: string[]): string[] {
  const groups = new Map<string, string[]>();
  const order: string[] = [];
  for (const label of labels) {
    const prefix = label.split(" — ")[0];
    if (!groups.has(prefix)) {
      groups.set(prefix, []);
      order.push(prefix);
    }
    groups.get(prefix)!.push(label);
  }
  return order.map((prefix) => {
    const group = groups.get(prefix)!;
    return group.length > 1 && group[0] !== prefix ? `${prefix} - *` : group[0];
  });
}

function featureSources(features: readonly Feature[]): SourceLink[] {
  const byUrl = new Map<string, string[]>();
  for (const feature of features) {
    const labels = byUrl.get(feature.sourceUrl) ?? [];
    labels.push(feature.displayName);
    byUrl.set(feature.sourceUrl, labels);
  }
  return [...byUrl.entries()]
    .map(([url, labels]) => ({ url, labels: collapseLabels(labels.sort()) }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

export function DataInfo({ features }: Props) {
  const sources = featureSources(features);

  return (
    <section className="data-info" aria-label="Data sources">
      <h2 className="data-info-title">Where does this data come from?</h2>
      <div className="data-info-body">
        <p>
          This view combines two independently sourced artifacts so you can pick a single Foundry
          deployment region for your whole requirement basket.
        </p>

        <h3>Model availability</h3>
        <p>
          Every <strong>model × region × SKU</strong> cell is derived from the Azure Resource
          Manager (ARM) API. These facts are machine-verifiable: the pipeline queries Azure
          directly, normalizes the response, and emits it as <code>models.json</code> and{" "}
          <code>regions.json</code>.
        </p>

        <h3>Foundry feature availability</h3>
        <p>
          Foundry features (e.g. AI Red Teaming Agent, Foundry Agents, Hosted Agents) are{" "}
          <strong>not</strong> API-derivable. Their regional availability is read from Microsoft
          Learn articles and treated as closed-world: a tracked region not listed by a
          feature&apos;s article is shown as unavailable, not unknown.
        </p>

        {sources.length > 0 && (
          <>
            <p>Feature regions are sourced from:</p>
            <ul className="data-info-sources">
              {sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.labels.join(", ")}
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
