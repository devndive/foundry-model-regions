import { REGIONS } from "./region-metadata.js";
import { writeArtifact } from "./dist.js";

async function main(): Promise<void> {
  await writeArtifact(
    "regions.json",
    REGIONS,
    `Wrote ${REGIONS.length} regions to dist/regions.json`,
  );
}

main();
