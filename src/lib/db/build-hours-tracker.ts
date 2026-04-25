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

  // Preserve marks from existing tracker
  const existingMarks = new Map<string, "x" | "~">();
  if (existsSync(TRACKER)) {
    const md = readFileSync(TRACKER, "utf8");
    const re = /- \[([x~])\] `([^`]+)`/g;
    let m;
    while ((m = re.exec(md)) !== null) {
      existingMarks.set(m[2], m[1] as "x" | "~");
    }
  }

  // Also pull skip marks from latest failures file
  if (existsSync("hours-failures.json")) {
    try {
      const fails = JSON.parse(readFileSync("hours-failures.json", "utf8")) as {
        slug: string;
        reason: string;
      }[];
      for (const f of fails) {
        if (/no asset table|non-NT URL/.test(f.reason)) {
          if (!existingMarks.has(f.slug)) existingMarks.set(f.slug, "~");
        }
      }
    } catch {}
  }

  const lines: string[] = [];
  lines.push(`# Opening Hours Scrape Tracker`);
  lines.push(``);
  lines.push(
    `Total: ${rows.length}. [x] = data populated, [~] = NT page has no opening table.`,
  );
  lines.push(``);
  let populated = 0;
  let settled = 0;
  for (const r of rows) {
    const existing = existingMarks.get(r.slug);
    let mark: "x" | "~" | " " = " ";
    if (r.openingHours) mark = "x";
    else if (existing) mark = existing;
    if (mark === "x") populated++;
    if (mark !== " ") settled++;
    lines.push(`- [${mark}] \`${r.slug}\` — ${r.name}`);
  }
  lines.splice(
    2,
    0,
    `Progress: ${populated}/${rows.length} populated, ${settled}/${rows.length} settled.`,
    ``,
  );

  writeFileSync(TRACKER, lines.join("\n") + "\n");
  console.log(
    `Wrote ${TRACKER}: ${rows.length} locations, ${populated} populated, ${settled} settled.`,
  );
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
