import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locationPricing } from "./schema";
import { eq, and } from "drizzle-orm";

async function fixPricing() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  // === Ascott House (id: 895) — fix to actual estate prices ===
  // Delete existing wrong pricing
  await db.delete(locationPricing).where(eq(locationPricing.locationId, 895));
  await db.insert(locationPricing).values([
    { locationId: 895, pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "12.95", memberPrice: null, label: "Adult (18+) - Gardens" },
    { locationId: 895, pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17) - Gardens" },
    { locationId: 895, pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "7.50", memberPrice: null, label: "Adult (18+) - House & Collection (add-on)" },
    { locationId: 895, pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "3.75", memberPrice: null, label: "Child (5-17) - House & Collection (add-on)" },
  ]);
  console.log("Fixed Ascott House pricing");

  // === Snowshill Manor (id: 896) — add missing family price ===
  await db.delete(locationPricing).where(eq(locationPricing.locationId, 896));
  await db.insert(locationPricing).values([
    { locationId: 896, pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
    { locationId: 896, pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
    { locationId: 896, pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "45.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
  ]);
  console.log("Fixed Snowshill Manor pricing");

  // === Compton Castle (id: 897) — £10.50 → £12.00, £5.25 → £6.00 ===
  await db.delete(locationPricing).where(eq(locationPricing.locationId, 897));
  await db.insert(locationPricing).values([
    { locationId: 897, pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
    { locationId: 897, pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
    { locationId: 897, pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
  ]);
  console.log("Fixed Compton Castle pricing");

  // === Sutton Hoo (id: 898) — £15.00 → £18.00, £7.50 → £9.00 ===
  await db.delete(locationPricing).where(eq(locationPricing.locationId, 898));
  await db.insert(locationPricing).values([
    { locationId: 898, pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
    { locationId: 898, pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
    { locationId: 898, pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "45.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
  ]);
  console.log("Fixed Sutton Hoo pricing");

  // === Antony House (id: 899) — £12.00 → £13.00, £6.00 → £6.50 ===
  await db.delete(locationPricing).where(eq(locationPricing.locationId, 899));
  await db.insert(locationPricing).values([
    { locationId: 899, pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
    { locationId: 899, pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
    { locationId: 899, pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
  ]);
  console.log("Fixed Antony House pricing");

  // === Formby (id: 901) — add parking price ===
  await db.insert(locationPricing).values([
    { locationId: 901, pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.00", memberPrice: null, label: "Car parking" },
  ]);
  console.log("Added Formby parking pricing");

  console.log("\nAll done!");
  await client.end();
}

fixPricing().catch(console.error);
