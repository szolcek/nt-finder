import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { writeFileSync, existsSync, readFileSync } from "fs";
import { isNotNull } from "drizzle-orm";

const TRACKER = "locations-hours-tracker.md";

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const rows = await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      websiteUrl: locations.websiteUrl,
      openingHours: locations.openingHours,
    })
    .from(locations)
    .where(isNotNull(locations.websiteUrl))
    .orderBy(locations.id);

  // Preserve ticks from existing tracker
  const existingDone = new Set<string>();
  if (existsSync(TRACKER)) {
    const md = readFileSync(TRACKER, "utf8");
    const re = /- \[x\] `([^`]+)`/g;
    let m;
    while ((m = re.exec(md)) !== null) existingDone.add(m[1]);
  }

  const lines: string[] = [];
  lines.push(`# Opening Hours Scrape Tracker`);
  lines.push(``);
  lines.push(
    `Total: ${rows.length} locations. Tick mark = scraped + DB updated.`,
  );
  lines.push(``);
  let doneCount = 0;
  for (const r of rows) {
    const ntDone = !!r.openingHours || existingDone.has(r.slug);
    if (ntDone) doneCount++;
    const tick = ntDone ? "x" : " ";
    lines.push(`- [${tick}] \`${r.slug}\` — ${r.name}`);
  }
  lines.splice(
    2,
    0,
    `Progress: ${doneCount}/${rows.length} done.`,
    ``,
  );

  writeFileSync(TRACKER, lines.join("\n") + "\n");
  console.log(
    `Wrote ${TRACKER}: ${rows.length} locations, ${doneCount} already done.`,
  );
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
