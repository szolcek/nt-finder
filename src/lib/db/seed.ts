import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations, locationPricing } from "./schema";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

interface PricingEntry {
  pricingType: string;
  pricingCategory?: string;
  tier: string;
  nonMemberPrice: string;
  memberPrice?: string | null;
  label: string;
  notes?: string;
}

interface SourceProperty {
  name: string;
  lat: number;
  lng: number;
  region: string;
  type: string;
  area: string;
  heroImageUrl?: string;
  description?: string;
  shortDescription?: string;
  websiteUrl?: string;
  pricing?: PricingEntry[];
}

const TYPE_TO_CATEGORY: Record<string, string> = {
  "House & Garden": "house",
  Garden: "garden",
  Castle: "castle",
  Countryside: "countryside",
  Coast: "coast",
  "Historic Site": "historic-site",
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  // Load comprehensive location data
  const raw = readFileSync(
    join(__dirname, "locations-full-data.json"),
    "utf-8"
  );
  const sourceProperties: SourceProperty[] = JSON.parse(raw);

  // Clear existing data
  console.log("Clearing existing data...");
  await db.execute(sql`TRUNCATE TABLE location_pricing, reviews, trip_locations, trips, photos CASCADE`);
  await db.execute(sql`TRUNCATE TABLE locations CASCADE`);

  console.log(`Seeding ${sourceProperties.length} locations...`);

  // Insert in batches of 50 to avoid parameter limits
  const batchSize = 50;
  const allInserted: Array<{ id: number; slug: string; name: string }> = [];

  for (let i = 0; i < sourceProperties.length; i += batchSize) {
    const batch = sourceProperties.slice(i, i + batchSize);
    const values = batch.map((p) => ({
      slug: slugify(p.name),
      name: p.name,
      description: p.description ?? null,
      shortDescription: p.shortDescription ?? null,
      latitude: p.lat.toFixed(7),
      longitude: p.lng.toFixed(7),
      region: p.area,
      category: TYPE_TO_CATEGORY[p.type] ?? p.type.toLowerCase(),
      heroImageUrl: p.heroImageUrl ?? null,
      websiteUrl: p.websiteUrl ?? null,
    }));

    const inserted = await db
      .insert(locations)
      .values(values)
      .returning({ id: locations.id, slug: locations.slug, name: locations.name });

    allInserted.push(...inserted);
  }

  console.log(`Created ${allInserted.length} locations`);

  // Build lookup by name for pricing
  const byName = new Map(allInserted.map((l) => [l.name, l.id]));

  // Insert pricing from the data file
  console.log("Seeding pricing...");

  const pricingValues = sourceProperties.flatMap((p) => {
    if (!p.pricing || p.pricing.length === 0) return [];
    const locationId = byName.get(p.name);
    if (!locationId) {
      console.warn(`  Skipping pricing for unknown location: ${p.name}`);
      return [];
    }
    return p.pricing.map((e) => ({
      locationId,
      pricingType: e.pricingType,
      pricingCategory: e.pricingCategory ?? "standard",
      tier: e.tier,
      nonMemberPrice: e.nonMemberPrice,
      memberPrice: e.memberPrice ?? null,
      label: e.label,
      notes: e.notes ?? null,
    }));
  });

  // Insert pricing in batches
  const pricingBatchSize = 100;
  let pricingCount = 0;
  for (let i = 0; i < pricingValues.length; i += pricingBatchSize) {
    const batch = pricingValues.slice(i, i + pricingBatchSize);
    await db.insert(locationPricing).values(batch);
    pricingCount += batch.length;
  }

  const locationsWithPricing = new Set(pricingValues.map(p => p.locationId)).size;
  console.log(`Created ${pricingCount} pricing entries for ${locationsWithPricing} locations`);
  console.log("Seeding complete!");
  await client.end();
}

seed().catch(console.error);
