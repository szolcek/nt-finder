import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations, locationPricing } from "./schema";
import { sql } from "drizzle-orm";
import { readFileSync } from "fs";
import { join } from "path";

interface SourceProperty {
  name: string;
  lat: number;
  lng: number;
  region: string;
  type: string;
  area: string;
  heroImageUrl?: string;
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

  // Load all 190 properties from source data
  const raw = readFileSync(
    join(__dirname, "properties-data.json"),
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
      latitude: p.lat.toFixed(7),
      longitude: p.lng.toFixed(7),
      region: p.region,
      category: TYPE_TO_CATEGORY[p.type] ?? p.type.toLowerCase(),
      heroImageUrl: p.heroImageUrl ?? null,
    }));

    const inserted = await db
      .insert(locations)
      .values(values)
      .returning({ id: locations.id, slug: locations.slug, name: locations.name });

    allInserted.push(...inserted);
  }

  console.log(`Created ${allInserted.length} locations`);

  // Build lookup by slug for pricing
  const bySlug = new Map(allInserted.map((l) => [l.slug, l.id]));

  // Add representative pricing for well-known properties
  console.log("Seeding pricing...");

  const pricingData: Array<{
    slug: string;
    entries: Array<{
      pricingType: string;
      tier: string;
      nonMemberPrice: string;
      label: string;
      memberPrice?: string | null;
      notes?: string;
    }>;
  }> = [
    {
      slug: "cliveden",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "17.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "8.50", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "42.50", label: "Family (2 adults + 3 children)" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "6.00", label: "All day" },
      ],
    },
    {
      slug: "stourhead",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "19.50", label: "Adult (house & garden)" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "9.75", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "48.75", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "8.00", label: "All day" },
      ],
    },
    {
      slug: "waddesdon-manor",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "22.00", label: "Adult (house & grounds)" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "11.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "55.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "chartwell",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "18.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "9.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "45.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "sissinghurst-castle-garden",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "16.50", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "8.25", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "41.25", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "0.00", label: "Included", notes: "Parking included with entry" },
      ],
    },
    {
      slug: "bodiam-castle",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "13.50", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "6.75", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "33.75", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "4.00", label: "All day" },
      ],
    },
    {
      slug: "knole",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "17.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "8.50", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "42.50", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "scotney-castle",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "15.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "7.50", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "37.50", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "0.00", label: "Included", notes: "Parking included with entry" },
      ],
    },
    {
      slug: "corfe-castle",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "12.50", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "6.25", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "31.25", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "4.00", label: "All day" },
      ],
    },
    {
      slug: "kingston-lacy",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "17.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "8.50", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "42.50", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "clumber-park",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "0.00", label: "Adult", notes: "Free entry to park" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "7.00", label: "All day" },
      ],
    },
    {
      slug: "dinefwr",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "12.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "6.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "30.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "powis-castle-and-garden",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "18.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "9.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "45.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "5.00", label: "All day" },
      ],
    },
    {
      slug: "fountains-abbey-and-studley-royal",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "16.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "8.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "40.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "0.00", label: "Included", notes: "Parking included with entry" },
      ],
    },
    {
      slug: "white-cliffs-of-dover",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "0.00", label: "Adult", notes: "Free entry" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "6.00", label: "All day" },
      ],
    },
    {
      slug: "brownsea-island",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "12.50", label: "Adult (landing fee)" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "6.25", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "31.25", label: "Family" },
      ],
    },
    {
      slug: "glastonbury-tor",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "0.00", label: "Adult", notes: "Free entry" },
      ],
    },
    {
      slug: "brimham-rocks",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "0.00", label: "Adult", notes: "Free entry" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "7.00", label: "All day" },
      ],
    },
    {
      slug: "cragside",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "20.00", label: "Adult (house & estate)" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "10.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "50.00", label: "Family" },
        { pricingType: "parking", tier: "adult", nonMemberPrice: "0.00", label: "Included", notes: "Parking included with entry" },
      ],
    },
    {
      slug: "hill-top",
      entries: [
        { pricingType: "entry", tier: "adult", nonMemberPrice: "14.00", label: "Adult" },
        { pricingType: "entry", tier: "child", nonMemberPrice: "7.00", label: "Child (5-17)" },
        { pricingType: "entry", tier: "family", nonMemberPrice: "35.00", label: "Family" },
      ],
    },
  ];

  const pricingValues = pricingData.flatMap((p) => {
    const locationId = bySlug.get(p.slug);
    if (!locationId) {
      console.warn(`  Skipping pricing for unknown slug: ${p.slug}`);
      return [];
    }
    return p.entries.map((e) => ({
      locationId,
      pricingType: e.pricingType,
      tier: e.tier,
      nonMemberPrice: e.nonMemberPrice,
      memberPrice: e.memberPrice ?? null,
      label: e.label,
      notes: e.notes,
    }));
  });

  if (pricingValues.length > 0) {
    await db.insert(locationPricing).values(pricingValues);
  }

  console.log(`Created pricing for ${pricingData.length} locations`);
  console.log("Seeding complete!");
  await client.end();
}

seed().catch(console.error);
