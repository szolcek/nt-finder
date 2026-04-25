import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

const REPORT_PATH = "coord-audit-report.json";
const MAX_DISTANCE_M = Number(process.env.MAX_DISTANCE_M ?? 3000);
const REQUIRE_NT = process.env.REQUIRE_NT !== "false";

type Finding = {
  id: number;
  slug: string;
  name: string;
  current: { lat: number; lng: number };
  google: {
    lat: number;
    lng: number;
    placeName: string;
    placeId: string;
    hasNTEstablishment: boolean;
  };
  distanceM: number;
};

async function main() {
  const report = JSON.parse(readFileSync(REPORT_PATH, "utf8")) as {
    findings: Finding[];
  };

  const toApply = report.findings.filter(
    (f) =>
      f.distanceM <= MAX_DISTANCE_M &&
      (!REQUIRE_NT || f.google.hasNTEstablishment),
  );

  console.log(
    `Applying ${toApply.length} fixes (max ${MAX_DISTANCE_M}m, requireNT=${REQUIRE_NT})`,
  );

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
    console.log(
      `  ✓ ${f.slug}: ${Math.round(f.distanceM)}m → ${f.google.lat.toFixed(7)}, ${f.google.lng.toFixed(7)}`,
    );
  }

  await client.end();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
