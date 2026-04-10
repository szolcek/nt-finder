import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations, locationPricing } from "./schema";
import { eq } from "drizzle-orm";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const newLocations = [
  // === BEDFORDSHIRE ===
  {
    name: "Sharpenhoe and Sundon Hills",
    slug: slugify("Sharpenhoe and Sundon Hills"),
    category: "countryside",
    region: "Bedfordshire",
    latitude: 51.9617146,
    longitude: -0.4508176,
    description:
      "Sharpenhoe Clappers is a dramatic beech-topped promontory on the northern edge of the Chiltern Hills, offering panoramic views across Bedfordshire. Together with the adjacent Sundon Hills, the area features chalk grassland rich in wildflowers and butterflies.",
    shortDescription:
      "A beech-topped chalk promontory on the Chiltern Hills with panoramic Bedfordshire views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/sharpenhoe",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/f8/Sharpenhoe_from_the_Clappers_-_geograph.org.uk_-_1074664.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Whipsnade Tree Cathedral",
    slug: slugify("Whipsnade Tree Cathedral"),
    category: "historic-site",
    region: "Bedfordshire",
    latitude: 51.8529115,
    longitude: -0.5377073,
    description:
      "Whipsnade Tree Cathedral is a group of trees planted in the shape of a medieval cathedral, created after the First World War as a memorial to fallen comrades. The living cathedral includes a nave, transepts, chapels and cloisters formed by different species of trees.",
    shortDescription:
      "A living cathedral of trees planted as a First World War memorial in Bedfordshire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/whipsnade-tree-cathedral",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Whipsnade_Tree_Cathedral%2C_South_Transcept.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Willington Dovecote and Stables",
    slug: slugify("Willington Dovecote and Stables"),
    category: "historic-site",
    region: "Bedfordshire",
    latitude: 52.1369377,
    longitude: -0.3845956,
    description:
      "Willington Dovecote is a magnificent 16th-century stone dovecote, one of the finest in England, with over 1,500 nesting boxes. The adjacent stables date from the same period and together they are a rare survival of Tudor agricultural buildings.",
    shortDescription:
      "A magnificent 16th-century stone dovecote with over 1,500 nesting boxes.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/willington-dovecote-and-stables",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/97/WillingtonDovecote.JPG",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === OXFORDSHIRE ===
  {
    name: "Great Coxwell Barn",
    slug: slugify("Great Coxwell Barn"),
    category: "historic-site",
    region: "Oxfordshire",
    latitude: 51.6444066,
    longitude: -1.6127308,
    description:
      "Great Coxwell Barn is a magnificent 13th-century tithe barn built by Cistercian monks of Beaulieu Abbey. William Morris called it 'the finest piece of architecture in England', and its soaring interior with original timber roof is a masterpiece of medieval engineering.",
    shortDescription:
      "A 13th-century tithe barn that William Morris called 'the finest piece of architecture in England'.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/great-coxwell-barn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Great_Coxwell_Barn_-_geograph.org.uk_-_1750413.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === BUCKINGHAMSHIRE ===
  {
    name: "Boarstall Duck Decoy",
    slug: slugify("Boarstall Duck Decoy"),
    category: "countryside",
    region: "Buckinghamshire",
    latitude: 51.8304265,
    longitude: -1.0957984,
    description:
      "Boarstall Duck Decoy is one of only four working duck decoys left in England, dating from the 17th century. The decoy pond and its curving pipe screens are set in 13 acres of woodland, now a nature reserve rich in birdlife and wildflowers.",
    shortDescription:
      "One of only four working duck decoys left in England, set in woodland nature reserve.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/boarstall-duck-decoy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/55/BoarstallDuckDecoy.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Boarstall Tower",
    slug: slugify("Boarstall Tower"),
    category: "historic-site",
    region: "Buckinghamshire",
    latitude: 51.8232338,
    longitude: -1.0955733,
    description:
      "Boarstall Tower is a 14th-century moated gatehouse, the last surviving fragment of a fortified house demolished during the Civil War. The stone tower with its cross-shaped arrow slits stands in a pleasant garden with views across the Buckinghamshire countryside.",
    shortDescription:
      "A 14th-century moated gatehouse, the sole survivor of a Civil War-demolished fortified house.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/boarstall-tower",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/a/af/Boarstall_Hall_and_Towers%2C_1695%2C_by_artist_Michael_Burghers%2C_England.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Buckingham Chantry Chapel",
    slug: slugify("Buckingham Chantry Chapel"),
    category: "historic-site",
    region: "Buckinghamshire",
    latitude: 52.0003441,
    longitude: -0.9880296,
    description:
      "Buckingham Chantry Chapel is a restored 15th-century chapel, the oldest building in Buckingham. Originally built as a chantry chapel for the Royal Latin School, it was later used as a schoolroom and is now a small heritage centre.",
    shortDescription:
      "A restored 15th-century chantry chapel, the oldest building in Buckingham.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/buckingham-chantry-chapel",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Chantry_Chapel_buckingham.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Dorneywood Garden",
    slug: slugify("Dorneywood Garden"),
    category: "garden",
    region: "Buckinghamshire",
    latitude: 51.554585,
    longitude: -0.646854,
    description:
      "Dorneywood is an early 20th-century house with beautiful gardens, used as an official residence for a senior member of the government. The gardens feature herbaceous borders, a rose garden and fine specimen trees, and are open to the public on select days by advance booking.",
    shortDescription:
      "A ministerial residence with beautiful gardens open on select days by advance booking.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/dorneywood-garden",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/en/4/40/Dorneywood_gate.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Long Crendon Courthouse",
    slug: slugify("Long Crendon Courthouse"),
    category: "historic-site",
    region: "Buckinghamshire",
    latitude: 51.77588,
    longitude: -0.9899582,
    description:
      "Long Crendon Courthouse is a 14th-century half-timbered building that may have served as a wool staple hall before becoming a manorial courthouse. The upper floor retains its medieval timber frame and is one of the finest surviving examples of its kind in Buckinghamshire.",
    shortDescription:
      "A 14th-century half-timbered courthouse, one of the finest of its kind in Buckinghamshire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/long-crendon-courthouse",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/LongCrendonCourthouse%28DavidHawgood%29Aug2005.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Pitstone Windmill",
    slug: slugify("Pitstone Windmill"),
    category: "historic-site",
    region: "Buckinghamshire",
    latitude: 51.8317445,
    longitude: -0.6298517,
    description:
      "Pitstone Windmill is one of the oldest post mills in Britain, with a date of 1627 carved into its framework. The fully restored windmill stands in open farmland below the Chiltern escarpment and is an iconic feature of the Buckinghamshire landscape.",
    shortDescription:
      "One of the oldest post mills in Britain, dating from 1627, below the Chiltern escarpment.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/pitstone-windmill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ec/Pitstone_Windmill_-_geograph.org.uk_-_1480797.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === CAMBRIDGESHIRE ===
  {
    name: "Ramsey Abbey Gatehouse",
    slug: slugify("Ramsey Abbey Gatehouse"),
    category: "historic-site",
    region: "Cambridgeshire",
    latitude: 52.4483887,
    longitude: -0.1028107,
    description:
      "Ramsey Abbey Gatehouse is a richly ornamented late 15th-century gatehouse, the principal surviving fragment of the once-great Benedictine Ramsey Abbey. The intricately carved stonework includes elaborate panelling and a fine oriel window.",
    shortDescription:
      "A richly carved 15th-century gatehouse, the last remnant of Benedictine Ramsey Abbey.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/cambridgeshire/ramsey-abbey-gatehouse",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d8/Abbey_Gate_House_-_geograph.org.uk_-_1330157.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === CORNWALL ===
  {
    name: "Cadsonbury",
    slug: slugify("Cadsonbury"),
    category: "countryside",
    region: "Cornwall",
    latitude: 50.4827482,
    longitude: -4.3363853,
    description:
      "Cadsonbury is an impressive Iron Age hillfort near Callington in east Cornwall, with well-preserved ramparts enclosing a hilltop with views across the Lynher and Tamar valleys. The site is managed as wildflower meadow and is rich in butterflies and grassland birds.",
    shortDescription:
      "An impressive Iron Age hillfort near Callington with views across the Lynher and Tamar valleys.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/cornwall/cadsonbury",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4a/Cadson_Bury_Fort_-_geograph.org.uk_-_411641.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Lawrence House",
    slug: slugify("Lawrence House"),
    category: "house",
    region: "Cornwall",
    latitude: 50.6383067,
    longitude: -4.3623078,
    description:
      "Lawrence House is an elegant Georgian town house in the centre of Launceston, built in 1753. Now used as a community heritage space with pop-up exhibitions, the house showcases the history of this ancient capital of Cornwall.",
    shortDescription:
      "An elegant 1753 Georgian town house in Launceston, Cornwall's ancient capital.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/cornwall/lawrence-house",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6c/Lawrence_House_%28Reminiscences%2C_1900%29.png",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === DERBYSHIRE / PEAK DISTRICT ===
  {
    name: "Duffield Castle",
    slug: slugify("Duffield Castle"),
    category: "castle",
    region: "Derbyshire",
    latitude: 52.9927036,
    longitude: -1.4897988,
    description:
      "Duffield Castle is the remains of a massive Norman keep, once one of the largest in England. Only the foundations survive, but they reveal the enormous scale of this 12th-century fortress that controlled the Derwent Valley north of Derby.",
    shortDescription:
      "The foundations of a massive Norman keep, once one of the largest in England.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/duffield-castle",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Duffield_Castle_225335_a19c01e6.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "The Old Manor",
    slug: slugify("The Old Manor"),
    category: "house",
    region: "Derbyshire",
    latitude: 52.978507,
    longitude: -1.81489,
    description:
      "The Old Manor at Norbury is a medieval manor house with a remarkable 13th-century hall and a beautiful herb knot garden. The house retains original features including a king post roof and medieval windows, offering a glimpse into life in a small Derbyshire manor.",
    shortDescription:
      "A medieval manor house at Norbury with a 13th-century hall and herb knot garden.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/the-old-manor",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/1f/Norbury_church_and_hall_046773_50c8b955.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "8.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "20.00", memberPrice: null, label: "Family (2 Adults + up to 3 children)" },
    ] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Winster Market House",
    slug: slugify("Winster Market House"),
    category: "historic-site",
    region: "Derbyshire",
    latitude: 53.1416396,
    longitude: -1.6401617,
    description:
      "Winster Market House is a rugged stone building in the centre of the Peak District village of Winster, originally an open-arched market hall dating from the late 17th or early 18th century. It was the first property acquired by the National Trust in the Peak District.",
    shortDescription:
      "A 17th-century stone market house, the first NT property in the Peak District.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/winster-market-house",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/Winster_Market_House_1.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === DEVON ===
  {
    name: "Salcombe Countryside",
    slug: slugify("Salcombe Countryside"),
    category: "coast",
    region: "Devon",
    latitude: 50.2321353,
    longitude: -3.8398558,
    description:
      "The Salcombe Countryside encompasses Bolberry Down, Overbeck's and the dramatic coastline between Bolt Head and Bolt Tail in the South Hams. The clifftop walks offer spectacular views, wildflower-rich grassland and some of the finest coastal scenery in Devon.",
    shortDescription:
      "Dramatic clifftop walks between Bolt Head and Bolt Tail in the South Hams.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/devon/bolberry-down",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/9c/Cliff_at_Bolberry_Down%2C_Bolberry_-_geograph.org.uk_-_373008.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Branscombe",
    slug: slugify("Branscombe"),
    category: "historic-site",
    region: "Devon",
    latitude: 50.6924731,
    longitude: -3.137922,
    description:
      "Branscombe is a picturesque village in a long valley running down to the sea on the East Devon coast. The National Trust cares for much of the surrounding farmland, cliff and beach, as well as the Old Bakery, Manor Mill and Forge — a unique trio of working historic buildings.",
    shortDescription:
      "A picturesque Devon village with a working bakery, watermill and forge.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/branscombe",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Branscombe_-_geograph.org.uk_-_6848.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Loughwood Meeting House",
    slug: slugify("Loughwood Meeting House"),
    category: "historic-site",
    region: "Devon",
    latitude: 50.7881592,
    longitude: -3.0607869,
    description:
      "Loughwood Meeting House is a remote 17th-century Baptist chapel hidden in woodland near Dalwood in East Devon. Built secretly during a time of religious persecution, it retains its original box pews, gallery and simple whitewashed interior.",
    shortDescription:
      "A secret 17th-century Baptist chapel hidden in woodland, with original box pews.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/devon/loughwood-meeting-house",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Loughwood_Meeting_House_-_geograph.org.uk_-_436406.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Plymbridge Woods",
    slug: slugify("Plymbridge Woods"),
    category: "countryside",
    region: "Devon",
    latitude: 50.408887,
    longitude: -4.0785637,
    description:
      "Plymbridge Woods is a wooded valley along the River Plym on the edge of Plymouth and Dartmoor, following the route of a former Great Western Railway branch line. The woods feature a striking viaduct, old quarries, and rich woodland wildlife including kingfishers and otters.",
    shortDescription:
      "A wooded valley along the River Plym with a viaduct, old quarries and rich wildlife.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/devon/plymbridge-woods",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/The_car_park_at_Plymbridge_Woods_-_geograph.org.uk_-_6633770.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
];

async function addLocations() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  for (const loc of newLocations) {
    const slug = loc.slug;

    const existing = await db
      .select()
      .from(locations)
      .where(eq(locations.slug, slug));

    if (existing.length > 0) {
      console.log(`⏭️  Skipping ${loc.name} (already exists)`);
      continue;
    }

    const [inserted] = await db
      .insert(locations)
      .values({
        name: loc.name,
        slug: loc.slug,
        category: loc.category,
        region: loc.region,
        latitude: String(loc.latitude),
        longitude: String(loc.longitude),
        description: loc.description,
        shortDescription: loc.shortDescription,
        websiteUrl: loc.websiteUrl,
        heroImageUrl: loc.heroImageUrl,
        isPublished: true,
      })
      .returning();

    console.log(`✅ Added ${loc.name} (id: ${inserted.id})`);

    for (const p of loc.pricing) {
      await db.insert(locationPricing).values({
        locationId: inserted.id,
        pricingType: p.pricingType,
        pricingCategory: p.pricingCategory || "standard",
        tier: p.tier,
        nonMemberPrice: p.nonMemberPrice,
        memberPrice: p.memberPrice || null,
        label: p.label,
      });
    }

    if (loc.pricing.length > 0) {
      console.log(`   💰 Added ${loc.pricing.length} pricing entries`);
    }
  }

  await client.end();
  console.log("\nDone!");
}

addLocations().catch(console.error);
