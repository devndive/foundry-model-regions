import { buildFeaturesArtifact } from "./feature-metadata.js";
import { writeArtifact } from "./dist.js";

async function main(): Promise<void> {
  const artifact = buildFeaturesArtifact();
  await writeArtifact(
    "features.json",
    artifact,
    `Wrote ${artifact.features.length} features and ${artifact.availability.length} availability rows to dist/features.json`,
  );
}

main();
