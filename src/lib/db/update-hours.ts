import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

const slug = process.argv[2];
const inputPath = process.argv[3];
if (!slug || !inputPath) {
  console.error("Usage: npx tsx src/lib/db/update-hours.ts <slug> <input.json>");
  process.exit(1);
}

const data = JSON.parse(readFileSync(inputPath, "utf8"));

async function main() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const result = await db
    .update(locations)
    .set({ openingHours: data, updatedAt: new Date() })
    .where(eq(locations.slug, slug))
    .returning({ id: locations.id, name: locations.name });

  if (result.length === 0) {
    console.error(`No location found with slug: ${slug}`);
    process.exit(1);
  }

  console.log(`Updated ${result[0].name} (id ${result[0].id})`);
  console.log(JSON.stringify(data, null, 2));
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
