import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations } from "./schema";
import { eq } from "drizzle-orm";

const images = [
  { id: 893, url: "https://upload.wikimedia.org/wikipedia/en/e/e6/Hughenden2010.JPG" },
  { id: 894, url: "https://upload.wikimedia.org/wikipedia/commons/7/76/GOC_Berkhamsted_%26_Frithsden_031_Ashridge_House%2C_Little_Gaddesden_%2828454689336%29.jpg" },
  { id: 895, url: "https://upload.wikimedia.org/wikipedia/commons/e/ef/At_Ascott_House_2024_17.jpg" },
  { id: 896, url: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Snowshill_Manor_exterior.jpg" },
  { id: 897, url: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Compton_Castle_in_Devon_enh.jpg" },
  { id: 898, url: "https://upload.wikimedia.org/wikipedia/commons/8/88/Sutton_Hoo_burial_site.jpg" },
  { id: 899, url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Mansion_-_panoramio_%2810%29.jpg" },
  { id: 900, url: "https://upload.wikimedia.org/wikipedia/commons/a/af/St_Michael%27s_Mount_View.jpg" },
  { id: 901, url: "https://upload.wikimedia.org/wikipedia/commons/9/91/Formby_Beach.jpg" },
  { id: 902, url: "https://upload.wikimedia.org/wikipedia/commons/4/47/Dunwich_Heath.jpg" },
];

async function fixImages() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const img of images) {
    await db
      .update(locations)
      .set({ heroImageUrl: img.url, updatedAt: new Date() })
      .where(eq(locations.id, img.id));
    console.log(`Updated id ${img.id}: image set`);
  }

  console.log("Done!");
  await client.end();
}

fixImages().catch(console.error);
