import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "fs";

const REPORT_PATH = "coord-audit-places-report.json";
const JSON_PATH = "src/lib/db/locations-full-data.json";
const MAX_DISTANCE_M = Number(process.env.MAX_DISTANCE_M ?? 1500);

type Finding = {
  id: number;
  slug: string;
  google: { lat: number; lng: number; isNationalTrust: boolean };
  distanceM: number;
};

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
  findings: Finding[];
};

const toApply = report.findings.filter(
  (f) => f.google.isNationalTrust && f.distanceM <= MAX_DISTANCE_M,
);

console.log(`Applying ${toApply.length} fixes (NT-tagged, <=${MAX_DISTANCE_M}m)`);

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const f of toApply) {
    await db
      .update(locations)
      .set({
        latitude: f.google.lat.toFixed(7),
        longitude: f.google.lng.toFixed(7),
        updatedAt: new Date(),
      })
      .where(eq(locations.id, f.id));
    console.log(`  ✓ ${f.slug} (${Math.round(f.distanceM)}m)`);
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
  console.log(`Synced ${jsonUpdated} entries in ${JSON_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
