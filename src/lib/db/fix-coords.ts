import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";

const fixes = [
  { id: 893, lat: "51.6510741", lng: "-0.7562675" },
  { id: 894, lat: "51.8075565", lng: "-0.5935363" },
  { id: 895, lat: "51.8956025", lng: "-0.7058003" },
  { id: 896, lat: "52.0055989", lng: "-1.8628864" },
  { id: 897, lat: "50.4725074", lng: "-3.6002897" },
  { id: 898, lat: "52.0943714", lng: "1.3409679" },
  { id: 899, lat: "50.3852901", lng: "-4.2272765" },
  { id: 900, lat: "50.1165068", lng: "-5.4780804" },
  { id: 901, lat: "53.5638578", lng: "-3.1002607" },
  { id: 902, lat: "52.2522574", lng: "1.6270750" },
];

async function fixCoords() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const fix of fixes) {
    await db
      .update(locations)
      .set({ latitude: fix.lat, longitude: fix.lng, updatedAt: new Date() })
      .where(eq(locations.id, fix.id));
    console.log(`Updated id ${fix.id}: ${fix.lat}, ${fix.lng}`);
  }

  console.log("Done!");
  await client.end();
}

fixCoords().catch(console.error);
