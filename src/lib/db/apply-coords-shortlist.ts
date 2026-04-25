import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "fs";

const REPORT_PATH = "coord-audit-places-report.json";
const JSON_PATH = "src/lib/db/locations-full-data.json";

const SHORTLIST = new Set([
  "the-needles-headland-and-tennyson-down",
  "divis-and-black-mountain",
  "aira-force-and-gowbarrow-park",
  "arnside-and-silverdale",
  "whitehaven-coast",
  "the-argory",
  "spyway",
  "white-mill",
  "pilsdon-pen",
  "hardy-monument",
  "stowe",
  "brancaster-estate",
  "wasdale",
  "murlough-national-nature-reserve",
]);

type Finding = {
  id: number;
  slug: string;
  name: string;
  google: { lat: number; lng: number; placeName: string };
  distanceM: number;
};

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
  findings: Finding[];
};

const toApply = report.findings.filter((f) => SHORTLIST.has(f.slug));

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log(`Applying ${toApply.length} fixes\n`);

  for (const f of toApply) {
    await db
      .update(locations)
      .set({
        latitude: f.google.lat.toFixed(7),
        longitude: f.google.lng.toFixed(7),
        updatedAt: new Date(),
      })
      .where(eq(locations.id, f.id));
    console.log(`✓ ${f.slug} (${Math.round(f.distanceM)}m → ${f.google.placeName})`);
  }

  await client.end();

  const json = JSON.parse(readFileSync(JSON_PATH, "utf8")) as Array<{
    slug: string;
    latitude: string;
    longitude: string;
  }>;
  const fixes = new Map(
    toApply.map((f) => [
      f.slug,
      { lat: f.google.lat.toFixed(7), lng: f.google.lng.toFixed(7) },
    ]),
  );
  let jsonUpdated = 0;
  for (const loc of json) {
    const fix = fixes.get(loc.slug);
    if (fix) {
      loc.latitude = fix.lat;
      loc.longitude = fix.lng;
      jsonUpdated++;
    }
  }
  writeFileSync(JSON_PATH, JSON.stringify(json, null, 2) + "\n");
  console.log(`\nSynced ${jsonUpdated} entries in ${JSON_PATH}`);

  console.log("\n--- Verification links ---");
  for (const f of toApply) {
    const gmaps = `https://www.google.com/maps/?q=${f.google.lat},${f.google.lng}`;
    console.log(`${f.slug}`);
    console.log(`  Site:  https://trustquest.co.uk/locations/${f.slug}`);
    console.log(`  Local: http://localhost:3000/locations/${f.slug}`);
    console.log(`  Maps:  ${gmaps}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
