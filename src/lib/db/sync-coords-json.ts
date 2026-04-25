import { readFileSync, writeFileSync } from "fs";

const REPORT_PATH = "coord-audit-report.json";
const JSON_PATH = "src/lib/db/locations-full-data.json";
const MAX_DISTANCE_M = Number(process.env.MAX_DISTANCE_M ?? 3000);
const REQUIRE_NT = process.env.REQUIRE_NT !== "false";

type Finding = {
  slug: string;
  google: { lat: number; lng: number; hasNTEstablishment: boolean };
  distanceM: number;
};

const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
  findings: Finding[];
};

const fixes = new Map(
  report.findings
    .filter(
      (f) =>
        f.distanceM <= MAX_DISTANCE_M &&
        (!REQUIRE_NT || f.google.hasNTEstablishment),
    )
    .map((f) => [
      f.slug,
      { lat: f.google.lat.toFixed(7), lng: f.google.lng.toFixed(7) },
    ]),
);

const json = JSON.parse(readFileSync(JSON_PATH, "utf8")) as Array<{
  slug: string;
  latitude: string;
  longitude: string;
}>;

let updated = 0;
for (const loc of json) {
  const fix = fixes.get(loc.slug);
  if (fix) {
    loc.latitude = fix.lat;
    loc.longitude = fix.lng;
    updated++;
  }
}

writeFileSync(JSON_PATH, JSON.stringify(json, null, 2) + "\n");
console.log(`Updated ${updated} entries in ${JSON_PATH}`);
