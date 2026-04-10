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
    name: "Gunby Hall",
    slug: slugify("Gunby Hall"),
    category: "house",
    region: "Lincolnshire",
    latitude: "53.1788367",
    longitude: "0.1937474",
    description: "Gunby Hall is a red-brick William and Mary house built in 1700, set in the gentle Lincolnshire Wolds countryside near Spilsby. Alfred Tennyson called it 'a haunt of ancient peace', and the house retains an atmosphere of quiet domesticity with its panelled rooms, family portraits and well-stocked library. The walled garden is one of the finest in the county, with herbaceous borders, old-fashioned roses, a Victorian glasshouse and productive fruit and vegetable plots. The surrounding parkland features ancient sweet chestnut trees and peaceful walks.",
    shortDescription: "William and Mary house in the Lincolnshire Wolds, Tennyson's 'haunt of ancient peace' with a fine walled garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/gunby-estate-hall-and-gardens",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6b/Gunby_Hall_-_geograph.org.uk_-_919245.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "7.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "3.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "family", nonMemberPrice: "17.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Cherryburn",
    slug: slugify("Cherryburn"),
    category: "house",
    region: "Northumberland",
    latitude: "54.9581213",
    longitude: "-1.8843966",
    description: "Cherryburn is the birthplace of Thomas Bewick, the celebrated 18th-century engraver and naturalist whose exquisite wood engravings of British birds and animals revolutionised book illustration. The small stone farmhouse where Bewick was born in 1753 stands beside the River Tyne at Mickley, and has been preserved with period furnishings alongside a museum displaying his original woodblocks and prints. The farmyard includes a printing workshop where visitors can try Bewick's techniques, and the garden has been planted with the wildflowers and hedgerow plants he so loved to draw.",
    shortDescription: "Birthplace of engraver Thomas Bewick on the Tyne, with a printing workshop and museum of his woodblock art.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/north-east/cherryburn",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Cherryburn_on_a_summer%27s_day.jpg",
    pricing: [],
  },
  {
    name: "Longshaw Estate",
    slug: slugify("Longshaw Estate"),
    category: "countryside",
    region: "Derbyshire",
    latitude: "53.3166038",
    longitude: "-1.6022806",
    description: "Longshaw Estate is a 1,600-acre expanse of moorland, woodland and parkland in the Peak District, stretching from the ancient oak woods of Padley Gorge to the gritstone edges of Burbage and the high moorland beyond. The estate centres on Longshaw Lodge, a former shooting lodge built for the Duke of Rutland in the 1820s. The diverse landscape supports a rich variety of wildlife including mountain hares, ring ouzels and adders, while the ancient lead mining remains and millstone quarries tell the story of centuries of human industry on the moors.",
    shortDescription: "1,600-acre Peak District estate with Padley Gorge, gritstone edges, moorland walks and rich wildlife.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/longshaw-burbage-and-the-eastern-moors",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Longshaw_Estate_View_from_A6187_-_geograph.org.uk_-_752272.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "6.00", memberPrice: null, label: "Car park (up to 4 hours)" },
    ],
  },
  {
    name: "Dapdune Wharf",
    slug: slugify("Dapdune Wharf"),
    category: "historic-site",
    region: "Surrey",
    latitude: "51.2424910",
    longitude: "-0.5783350",
    description: "Dapdune Wharf is a restored riverside wharf on the River Wey Navigation in Guildford, where barges were built and repaired from the 17th century until the 1920s. The site tells the story of the Wey Navigation, one of the earliest navigable rivers in England, opened in 1653 to carry goods between Guildford and the Thames. Visitors can explore the barge-building workshop, see the restored Reliance barge, and take boat trips along the navigation through the Surrey countryside. The wharf also serves as the starting point for towpath walks along the Wey.",
    shortDescription: "Restored barge-building wharf on the Wey Navigation in Guildford with boat trips and towpath walks.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/surrey/river-wey-and-godalming-navigations-and-dapdune-wharf",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8a/Dapdune_Wharf_steam_day.jpg",
    pricing: [],
  },
  {
    name: "Bradley Manor",
    slug: slugify("Bradley Manor"),
    category: "house",
    region: "Devon",
    latitude: "50.5261376",
    longitude: "-3.6258745",
    description: "Bradley Manor is a small medieval manor house tucked away in a wooded valley on the outskirts of Newton Abbot, a surprising survivor amid modern suburbia. Dating mainly from the 15th century, the house features a great hall, a chapel with original wagon roof, and a buttery, all preserving the intimate scale and atmosphere of late medieval domestic life. The house was continuously occupied for over 500 years by the Yarde and Whitley families before being given to the National Trust in 1938. The surrounding meadow garden is managed traditionally for wildflowers and butterflies.",
    shortDescription: "15th-century manor house hidden in a Newton Abbot valley, with a medieval chapel and wildflower meadow.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/bradley",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c8/Bradley_Manor%2C_Newton_Abbot%2C_Devon.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Lundy",
    slug: slugify("Lundy"),
    category: "coast",
    region: "Devon",
    latitude: "51.1781187",
    longitude: "-4.6673073",
    description: "Lundy is a remote granite island three miles long in the Bristol Channel, twelve miles off the Devon coast, owned by the National Trust and managed by the Landmark Trust. The island's dramatic cliffs and clear waters form England's first Marine Conservation Zone, home to grey seals, puffins (from which the island takes its Norse name) and basking sharks. On land, the island supports wild Soay sheep, sika deer and the unique Lundy cabbage, found nowhere else on Earth. Visitors can reach the island by ferry from Ilfracombe or Bideford and explore its lighthouses, castle ruins and wild coastal scenery.",
    shortDescription: "Remote granite island in the Bristol Channel with puffins, seals and England's first Marine Conservation Zone.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/lundy",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Lundy%27s_south-west_coast_%E2%80%93_Lundy_Island%2C_Devon_-_geograph.org.uk_-_7991486.jpg",
    pricing: [],
  },
  {
    name: "Paycocke's House",
    slug: slugify("Paycocke's House"),
    category: "house",
    region: "Essex",
    latitude: "51.8705277",
    longitude: "0.6826454",
    description: "Paycocke's House is a richly ornamented Tudor merchant's house in the centre of Coggeshall, Essex, built around 1509 by John Paycocke, a prosperous wool merchant. The house is famous for its remarkable carved wood panelling and elaborate ceiling beams, considered among the finest examples of domestic Tudor woodwork in England. After centuries of alteration and decline, the house was rescued and restored by Noel Buxton in the early 20th century. The cottage garden behind the house is planted with traditional flowers and features a view of the River Blackwater.",
    shortDescription: "Richly carved Tudor wool merchant's house in Coggeshall with exceptional 16th-century woodwork.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/paycockes-house-and-garden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/25/The_Fleece_and_Paycocke%27s_House_Coggeshall_Geograph-4049832-by-David-Smith.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Shalford Mill",
    slug: slugify("Shalford Mill"),
    category: "historic-site",
    region: "Surrey",
    latitude: "51.2191333",
    longitude: "-0.5680046",
    description: "Shalford Mill is a picturesque 18th-century watermill on the Tillingbourne stream near Guildford, believed to have been the inspiration for the mill in John Bunyan's The Pilgrim's Progress. The timber-framed and tile-hung mill was donated to the National Trust in 1932 by an anonymous group calling themselves 'Ferguson's Gang', eccentric masked benefactors who championed the preservation of English rural heritage. The mill retains its original machinery including the wooden waterwheel, grinding stones and grain hopper, offering a glimpse of the rural milling tradition that once sustained communities across the English countryside.",
    shortDescription: "Picturesque 18th-century Surrey watermill, possibly Bunyan's inspiration, saved by the masked Ferguson's Gang.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/surrey/shalford-mill",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8e/Shalford_Mill_2017.jpg",
    pricing: [],
  },
];

async function addLocations() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  for (const loc of newLocations) {
    const existing = await db
      .select({ id: locations.id })
      .from(locations)
      .where(eq(locations.slug, loc.slug))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⏭️  Skipping "${loc.name}" (already exists)`);
      continue;
    }

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
        heroImageUrl: loc.heroImageUrl,
        isPublished: true,
      })
      .returning({ id: locations.id });

    console.log(`✅ Added "${loc.name}" (id: ${inserted.id})`);

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
