import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync, writeFileSync } from "fs";
import { spawn } from "child_process";

const TRACKER = "locations-hours-tracker.md";
const LIMIT = Number(process.argv[2] ?? 100);
const SCRAPE_TIMEOUT_MS = 60_000;

type Asset = { name: string; hours: string };
type ScrapeResult = {
  source: string;
  scrapedAt: string;
  today: { date: string | null; assets: Asset[] } | null;
  notes: string[];
};

type Mark = "x" | "~" | " ";

function readTracker() {
  const md = readFileSync(TRACKER, "utf8");
  const lines = md.split("\n");
  const items: {
    line: number;
    slug: string;
    mark: Mark;
    raw: string;
  }[] = [];
  lines.forEach((raw, line) => {
    const m = raw.match(/^- \[([ x~])\] `([^`]+)` — /);
    if (m) {
      items.push({ line, slug: m[2], mark: m[1] as Mark, raw });
    }
  });
  return { lines, items };
}

function markTracker(slug: string, mark: Mark) {
  const { lines, items } = readTracker();
  const item = items.find((i) => i.slug === slug);
  if (!item) return;
  lines[item.line] = item.raw.replace(/- \[[ x~]\]/, `- [${mark}]`);

  const total = items.length;
  const settled = items.filter(
    (i) => i.mark !== " " || i.slug === slug,
  ).length;
  const done = items.filter(
    (i) => (i.mark === "x" && i.slug !== slug) || (i.slug === slug && mark === "x"),
  ).length;
  const progressIdx = lines.findIndex((l) => l.startsWith("Progress:"));
  if (progressIdx >= 0) {
    lines[progressIdx] = `Progress: ${done}/${total} populated, ${settled}/${total} settled.`;
  }
  writeFileSync(TRACKER, lines.join("\n"));
}

function runScraper(url: string, outPath: string): Promise<ScrapeResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      "node",
      ["scrape-hours.mjs", url, outPath, "/tmp/nt-hours-batch.png"],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let stderr = "";
    child.stderr.on("data", (d) => (stderr += d.toString()));
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`Scrape timeout after ${SCRAPE_TIMEOUT_MS}ms`));
    }, SCRAPE_TIMEOUT_MS);

    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code !== 0) {
        return reject(new Error(`Scraper exit ${code}: ${stderr.slice(-500)}`));
      }
      try {
        resolve(JSON.parse(readFileSync(outPath, "utf8")));
      } catch (e) {
        reject(e as Error);
      }
    });
  });
}

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
    .orderBy(locations.id);

  const { items } = readTracker();
  const tracker = new Map(items.map((i) => [i.slug, i.mark]));

  const todo = rows
    .filter((r) => {
      if (!r.websiteUrl) return false;
      const mark = tracker.get(r.slug);
      // skip already-done and explicitly-skipped (no asset table on page)
      if (mark === "x" || mark === "~") return false;
      if (r.openingHours) return false;
      return true;
    })
    .slice(0, LIMIT);

  console.log(`Processing ${todo.length} of remaining locations\n`);

  const failures: { slug: string; reason: string }[] = [];
  let okCount = 0;

  for (let i = 0; i < todo.length; i++) {
    const r = todo[i];
    const prefix = `[${i + 1}/${todo.length}]`;
    const url = r.websiteUrl!;

    if (!/^https?:\/\/(www\.)?nationaltrust\.org\.uk\//.test(url)) {
      console.log(`${prefix} ${r.slug} — skip (non-NT URL: ${url})`);
      markTracker(r.slug, "~");
      failures.push({ slug: r.slug, reason: "non-NT URL" });
      continue;
    }

    try {
      const tmpJson = `/tmp/nt-hours-${r.slug}.json`;
      const data = await runScraper(url, tmpJson);
      const assets = data.today?.assets ?? [];

      if (assets.length === 0) {
        console.log(`${prefix} ${r.slug} — no asset table`);
        markTracker(r.slug, "~");
        failures.push({ slug: r.slug, reason: "no asset table" });
        continue;
      }

      await db
        .update(locations)
        .set({ openingHours: data, updatedAt: new Date() })
        .where(eq(locations.id, r.id));

      markTracker(r.slug, "x");
      okCount++;
      console.log(
        `${prefix} ✓ ${r.slug} (${assets.length} assets)`,
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`${prefix} ✗ ${r.slug} — ${msg.slice(0, 200)}`);
      // leave unmarked so transient errors retry next run
      failures.push({ slug: r.slug, reason: msg.slice(0, 200) });
    }
  }

  console.log(
    `\nDone. ${okCount} updated, ${failures.length} failed/skipped.`,
  );
  if (failures.length) {
    writeFileSync(
      "hours-failures.json",
      JSON.stringify(failures, null, 2),
    );
    console.log(`Failures: hours-failures.json`);
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
