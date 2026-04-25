import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { isNotNull } from "drizzle-orm";

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const rows = await db
    .select({ openingHours: locations.openingHours })
    .from(locations)
    .where(isNotNull(locations.openingHours));

  const counts = new Map<string, number>();
  let totalLocations = 0;
  for (const r of rows) {
    const data = r.openingHours as
      | { today?: { assets?: { name: string }[] } }
      | null;
    const assets = data?.today?.assets;
    if (!assets || assets.length === 0) continue;
    totalLocations++;
    for (const a of assets) {
      const key = (a.name || "").trim();
      if (!key) continue;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  console.log(`From ${totalLocations} locations with hours:\n`);
  for (const [k, n] of sorted) {
    console.log(`  ${n.toString().padStart(4)}  ${k}`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
