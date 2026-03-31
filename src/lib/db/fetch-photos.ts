import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq, isNull } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema: { locations } });

/** Try Wikipedia summary API — returns the original image URL or null. */
async function getWikipediaImage(name: string): Promise<string | null> {
  // Try exact title first, then with "National Trust" suffix
  const queries = [name, `${name} (National Trust)`];

  for (const q of queries) {
    const slug = encodeURIComponent(q.replace(/ /g, "_"));
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`
    );
    if (!res.ok) continue;

    const data = await res.json();
    const url = data.originalimage?.source ?? data.thumbnail?.source;
    if (url) return url;
  }

  // Fallback: Wikipedia search API
  const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(name + " National Trust")}&gsrlimit=1&prop=pageimages&piprop=original&format=json&origin=*`;
  const searchRes = await fetch(searchUrl);
  if (searchRes.ok) {
    const searchData = await searchRes.json();
    const pages = searchData.query?.pages;
    if (pages) {
      const page = Object.values(pages)[0] as Record<string, unknown>;
      const orig = page.original as { source?: string } | undefined;
      if (orig?.source) return orig.source;
    }
  }

  return null;
}

async function main() {
  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      heroImageUrl: locations.heroImageUrl,
    })
    .from(locations)
    .where(isNull(locations.heroImageUrl));

  console.log(`Fetching photos for ${allLocations.length} locations...\n`);

  let success = 0;
  let failed = 0;

  for (const loc of allLocations) {
    const url = await getWikipediaImage(loc.name);

    if (url) {
      await db
        .update(locations)
        .set({ heroImageUrl: url })
        .where(eq(locations.id, loc.id));
      console.log(`✓ ${loc.name}`);
      success++;
    } else {
      console.log(`✗ ${loc.name} — no photo found`);
      failed++;
    }

    // Small delay to be polite to Wikipedia
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nDone: ${success} photos saved, ${failed} without photos.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
