import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";

const fixes = [
  {
    slug: "bowder-stone",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/lake-district/borrowdale-and-derwent-water",
  },
  {
    slug: "cartmel-priory-gatehouse",
    websiteUrl: "https://en.wikipedia.org/wiki/Cartmel_Priory",
  },
  {
    slug: "cross-keys-inn",
    websiteUrl: "https://en.wikipedia.org/wiki/Cautley_Spout",
  },
  {
    slug: "old-dungeon-ghyll",
    websiteUrl: "https://en.wikipedia.org/wiki/Old_Dungeon_Ghyll_Hotel",
  },
  {
    slug: "the-old-mill",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/wembury",
  },
  {
    slug: "portland",
    websiteUrl: "https://en.wikipedia.org/wiki/Portland,_Dorset",
  },
  {
    slug: "little-fleece-bookshop",
    websiteUrl: "https://en.wikipedia.org/wiki/Stow-on-the-Wold",
  },
  {
    slug: "ludshott-common-and-waggoners-wells",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/hampshire/ludshott-commons",
  },
  {
    slug: "brighstone-shop-and-museum",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/isle-of-wight/mottistone-gardens-and-estate",
  },
  {
    slug: "newtown-old-town-hall",
    websiteUrl: "https://en.wikipedia.org/wiki/Newtown_Old_Town_Hall",
  },
  {
    slug: "st-catherines-oratory",
    websiteUrl: "https://en.wikipedia.org/wiki/St_Catherine%27s_Oratory",
  },
  {
    slug: "rosetta-cottage",
    websiteUrl: "https://en.wikipedia.org/wiki/Brighstone",
  },
  {
    slug: "cwmmau-farmhouse",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/herefordshire-countryside",
  },
];

async function fixUrls() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  for (const fix of fixes) {
    const existing = await db
      .select()
      .from(locations)
      .where(eq(locations.slug, fix.slug));

    if (existing.length === 0) {
      console.log(`⚠️  ${fix.slug} not found in database`);
      continue;
    }

    await db
      .update(locations)
      .set({ websiteUrl: fix.websiteUrl })
      .where(eq(locations.slug, fix.slug));

    console.log(`✅ Fixed ${fix.slug} → ${fix.websiteUrl}`);
  }

  await client.end();
  console.log("\nDone!");
}

fixUrls().catch(console.error);
