import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "fs";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
if (!API_KEY) throw new Error("Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY");

const THRESHOLD_M = Number(process.env.THRESHOLD_M ?? 300);
const APPLY = process.argv.includes("--apply");
const RESUME = process.argv.includes("--resume");
const REPORT_PATH = "coord-audit-report.json";

type Row = {
  id: number;
  slug: string;
  name: string;
  region: string | null;
  postcode: string | null;
  latitude: string;
  longitude: string;
};

type Finding = {
  id: number;
  slug: string;
  name: string;
  region: string | null;
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

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

async function searchPlace(query: string): Promise<{
  lat: number;
  lng: number;
  placeName: string;
  placeId: string;
  hasNTEstablishment: boolean;
} | null> {
  const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
  url.searchParams.set("address", query);
  url.searchParams.set("region", "gb");
  url.searchParams.set("key", API_KEY);

  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Geocoding API error ${res.status}:`, await res.text());
    return null;
  }
  const data = (await res.json()) as {
    status: string;
    results?: Array<{
      formatted_address: string;
      place_id: string;
      types?: string[];
      address_components?: Array<{ long_name: string; types: string[] }>;
      geometry?: { location: { lat: number; lng: number } };
    }>;
  };
  if (data.status !== "OK" || !data.results?.length) return null;
  const r = data.results[0];
  if (!r.geometry?.location) return null;
  const ntComp = r.address_components?.find(
    (c) =>
      c.types.includes("establishment") &&
      /national trust/i.test(c.long_name),
  );
  return {
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    placeName: r.formatted_address,
    placeId: r.place_id,
    hasNTEstablishment: !!ntComp,
  };
}

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const rows = (await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      region: locations.region,
      postcode: locations.postcode,
      latitude: locations.latitude,
      longitude: locations.longitude,
    })
    .from(locations)
    .orderBy(locations.id)) as Row[];

  console.log(`Auditing ${rows.length} locations (threshold ${THRESHOLD_M}m)`);

  let existing: {
    findings: Finding[];
    notFound: { id: number; slug: string; name: string }[];
    checkedIds: number[];
  } = { findings: [], notFound: [], checkedIds: [] };

  if (RESUME) {
    try {
      existing = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
      console.log(`Resuming: ${existing.checkedIds.length} already checked`);
    } catch {
      console.log("No previous report; starting fresh");
    }
  }

  const checked = new Set(existing.checkedIds);
  const findings: Finding[] = existing.findings;
  const notFound: { id: number; slug: string; name: string }[] =
    existing.notFound;

  let i = 0;
  for (const row of rows) {
    i++;
    if (checked.has(row.id)) continue;

    const query = `${row.name} National Trust${row.region ? `, ${row.region}` : ""}`;
    const result = await searchPlace(query);

    if (!result) {
      console.log(`[${i}/${rows.length}] ${row.slug} — NO RESULT`);
      notFound.push({ id: row.id, slug: row.slug, name: row.name });
      checked.add(row.id);
      continue;
    }

    const current = {
      lat: parseFloat(row.latitude),
      lng: parseFloat(row.longitude),
    };
    const distance = haversineM(current, {
      lat: result.lat,
      lng: result.lng,
    });

    if (distance > THRESHOLD_M) {
      console.log(
        `[${i}/${rows.length}] ${row.slug} — ${Math.round(distance)}m diff (${result.placeName})`,
      );
      findings.push({
        id: row.id,
        slug: row.slug,
        name: row.name,
        region: row.region,
        current,
        google: result,
        distanceM: distance,
      });
    }

    checked.add(row.id);

    if (i % 25 === 0) {
      writeFileSync(
        REPORT_PATH,
        JSON.stringify(
          {
            findings,
            notFound,
            checkedIds: [...checked],
          },
          null,
          2,
        ),
      );
    }

    await new Promise((r) => setTimeout(r, 30));
  }

  writeFileSync(
    REPORT_PATH,
    JSON.stringify(
      { findings, notFound, checkedIds: [...checked] },
      null,
      2,
    ),
  );

  console.log(
    `\nDone. ${findings.length} divergent (>${THRESHOLD_M}m), ${notFound.length} not found.`,
  );
  console.log(`Report: ${REPORT_PATH}`);

  if (APPLY) {
    console.log("\nApplying fixes...");
    for (const f of findings) {
      await db
        .update(locations)
        .set({
          latitude: f.google.lat.toFixed(7),
          longitude: f.google.lng.toFixed(7),
          updatedAt: new Date(),
        })
        .where(eq(locations.id, f.id));
      console.log(`  ✓ ${f.slug}`);
    }
    console.log("Fixes applied.");
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
