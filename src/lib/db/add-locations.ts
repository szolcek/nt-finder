import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations, locationPricing } from "./schema";
import { eq } from "drizzle-orm";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const newLocations = [
  {
    name: "Hughenden Manor",
    slug: slugify("Hughenden Manor"),
    category: "house",
    region: "Buckinghamshire",
    latitude: "51.6558000",
    longitude: "-0.7490000",
    description: "Hughenden is a red brick Victorian manor set in the Chiltern Hills, the former country home of Prime Minister Benjamin Disraeli. The house reveals Disraeli's colourful personal life and political career, while the grounds concealed a top-secret Second World War operation codenamed 'Hillside'. The estate spans over 600 acres of woodland and farmland, with formal Italianate gardens featuring a Victorian parterre and classical statuary, pleasure grounds, an apple orchard and a walled garden.",
    shortDescription: "Victorian manor in the Chilterns, former home of PM Benjamin Disraeli, with secret WWII history and Italianate gardens.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/hughenden",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.70", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.40", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "46.80", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Ashridge Estate",
    slug: slugify("Ashridge Estate"),
    category: "countryside",
    region: "Hertfordshire",
    latitude: "51.7980000",
    longitude: "-0.5770000",
    description: "Ashridge Estate is a 5,000-acre expanse of woodlands, commons and chalk downland in the Chiltern Hills. The estate features ancient beech woodland, wildflower meadows and the iconic Bridgewater Monument. It is home to a rich variety of wildlife including muntjac deer, badgers and over 60 species of bird. The visitor centre provides information about walks and trails across the estate.",
    shortDescription: "5,000 acres of Chiltern woodland, chalk downland and commons with a visitor centre and Bridgewater Monument.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ashridge-estate",
    pricing: [],
  },
  {
    name: "Ascott House",
    slug: slugify("Ascott House"),
    category: "house",
    region: "Buckinghamshire",
    latitude: "51.8780000",
    longitude: "-0.7430000",
    description: "Ascott is a Rothschild country house near Wing in Buckinghamshire, originally a half-timbered Jacobean farmhouse transformed in the 1870s into a comfortable country retreat. The house contains an exceptional collection of fine paintings, Chinese ceramics and English and French furniture. The gardens are equally remarkable, featuring rare trees, herbaceous borders, a topiary sundial and stunning views across the Vale of Aylesbury.",
    shortDescription: "Rothschild country house near Wing with exceptional gardens, fine art collections and a famous topiary sundial.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/ascott",
    pricing: [
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "18.70", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "9.30", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
    ],
  },
  {
    name: "Snowshill Manor",
    slug: slugify("Snowshill Manor"),
    category: "house",
    region: "Gloucestershire",
    latitude: "52.0286000",
    longitude: "-1.7897000",
    description: "Snowshill Manor is a Cotswold manor house containing an extraordinary collection of over 22,000 objects amassed by the eccentric Charles Paget Wade between 1919 and 1956. The collection ranges from Samurai armour and musical instruments to toys and bicycles, all arranged with theatrical flair. The Arts and Crafts-influenced garden is arranged as a series of outdoor rooms with pools, ponds and colourful borders, offering views across the Cotswold countryside.",
    shortDescription: "Cotswold manor housing an eccentric collection of 22,000+ objects from toys to Samurai armour, with Arts and Crafts gardens.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/snowshill-manor-and-garden",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
    ],
  },
  {
    name: "Compton Castle",
    slug: slugify("Compton Castle"),
    category: "castle",
    region: "Devon",
    latitude: "50.4486000",
    longitude: "-3.5814000",
    description: "Compton Castle is a fortified medieval manor house tucked into a valley near Paignton in Devon. Home to the Gilbert family since 1329, the castle features a Great Hall, chapel, rose garden and reconstructed medieval kitchen. Sir Humphrey Gilbert, half-brother of Sir Walter Raleigh, set sail from here to claim Newfoundland for Queen Elizabeth I in 1583. The castle's imposing curtain wall and towers were added in the 15th and 16th centuries.",
    shortDescription: "Fortified medieval manor house near Paignton, home of the Gilbert family since 1329.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/compton-castle",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "10.50", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "5.25", memberPrice: null, label: "Child (5-17)" },
    ],
  },
  {
    name: "Sutton Hoo",
    slug: slugify("Sutton Hoo"),
    category: "historic-site",
    region: "Suffolk",
    latitude: "52.0893000",
    longitude: "1.3372000",
    description: "Sutton Hoo is one of Britain's most important archaeological sites, famous for the 1939 discovery of an Anglo-Saxon ship burial containing a wealth of treasures including a gold helmet, sword and jewellery. The exhibition hall tells the story of this remarkable find and the people it belonged to, while the burial mounds overlook the River Deben estuary. The estate also includes Tranmer House, the home of Edith Pretty who commissioned the original excavation.",
    shortDescription: "Anglo-Saxon royal burial site made famous by the 1939 ship burial discovery, with an exhibition hall and estate walks.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/suffolk/sutton-hoo",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "15.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "7.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "37.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Antony House",
    slug: slugify("Antony House"),
    category: "house",
    region: "Cornwall",
    latitude: "50.3836000",
    longitude: "-4.3028000",
    description: "Antony is an elegant early 18th-century mansion regarded as one of the finest Queen Anne houses in the West Country. Built of silvery grey Pentewan stone, the house contains fine portraits, furniture and textiles spanning 600 years of the Carew Pole family's history. The grounds include formal gardens with topiary, a knot garden and a national collection of daylilies, while the woodland garden leads down to the Tamar estuary with views into Devon.",
    shortDescription: "Elegant early 18th-century Queen Anne mansion with formal gardens and woodland on the Tamar estuary.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/antony",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "St Michael's Mount",
    slug: slugify("St Michael's Mount"),
    category: "castle",
    region: "Cornwall",
    latitude: "50.1171000",
    longitude: "-5.4773000",
    description: "St Michael's Mount is a tidal island just off the coast of Marazion in Cornwall, crowned by a medieval castle and church. Connected to the mainland by a granite causeway passable at low tide, the island has been a place of pilgrimage, a fortress and a private home for centuries. The castle rooms tell stories from its rich history, while the subtropical gardens cascade down the rocky slopes with exotic plants thriving in the mild maritime climate.",
    shortDescription: "Tidal island off Marazion with a medieval castle, subtropical gardens and a causeway passable at low tide.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/st-michaels-mount",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "21.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "10.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "52.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Formby",
    slug: slugify("Formby"),
    category: "coast",
    region: "Merseyside",
    latitude: "53.5570000",
    longitude: "-3.0870000",
    description: "Formby is a stunning stretch of the Sefton Coast featuring wide sandy beaches, towering sand dunes and pine woodlands that are home to one of England's few remaining red squirrel populations. The asparagus fields behind the dunes are a reminder of the area's Victorian market gardening heritage. At low tide, prehistoric human and animal footprints dating back 5,000 years are occasionally revealed on the beach, offering a unique window into the past.",
    shortDescription: "Red squirrel reserve and pine woodland behind wide sandy beaches on the Sefton Coast.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/liverpool-lancashire/formby",
    pricing: [],
  },
  {
    name: "Dunwich Heath",
    slug: slugify("Dunwich Heath"),
    category: "countryside",
    region: "Suffolk",
    latitude: "52.2770000",
    longitude: "1.6280000",
    description: "Dunwich Heath is a rare and precious fragment of the lowland heath that once covered much of coastal Suffolk. In late summer the heathland bursts into colour with purple heather and yellow gorse. The clifftop walks offer panoramic views over the RSPB's Minsmere reserve and out to sea. The area is rich in wildlife including Dartford warblers, nightjars and adders, and the former coastguard cottages now house a tea room and shop.",
    shortDescription: "Rare lowland heath with coastal views, heather and wildlife on the Suffolk coast.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/suffolk/dunwich-heath-and-beach",
    pricing: [],
  },
];

async function addLocations() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const loc of newLocations) {
    // Check if already exists
    const existing = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.slug, loc.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️  Skipping "${loc.name}" (already exists)`);
      continue;
    }

    // Insert location
    const [inserted] = await db
      .insert(locations)
      .values({
        slug: loc.slug,
        name: loc.name,
        description: loc.description,
        shortDescription: loc.shortDescription,
        latitude: loc.latitude,
        longitude: loc.longitude,
        region: loc.region,
        category: loc.category,
        websiteUrl: loc.websiteUrl,
        isPublished: true,
      })
      .returning({ id: locations.id });

    console.log(`✅ Added "${loc.name}" (id: ${inserted.id})`);

    // Insert pricing
    if (loc.pricing.length > 0) {
      await db.insert(locationPricing).values(
        loc.pricing.map((p) => ({
          locationId: inserted.id,
          pricingType: p.pricingType,
          pricingCategory: p.pricingCategory,
          tier: p.tier,
          nonMemberPrice: p.nonMemberPrice,
          memberPrice: p.memberPrice,
          label: p.label,
        }))
      );
      console.log(`   💰 Added ${loc.pricing.length} pricing entries`);
    }
  }

  console.log("\nDone!");
  await client.end();
}

addLocations().catch(console.error);
