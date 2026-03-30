import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { locations, locationPricing } from "./schema";

async function seed() {
  const client = postgres(process.env.DATABASE_URL!);
  const db = drizzle(client);

  console.log("Seeding locations...");

  const [cliveden, stourhead, giantsCauseway, clumberPark, dinefwr] =
    await db
      .insert(locations)
      .values([
        {
          slug: "cliveden",
          name: "Cliveden",
          shortDescription:
            "Grand house and estate with stunning gardens and Thames-side walks.",
          description:
            "Cliveden is a stately home set in 376 acres of gardens and woodland above the Thames. The estate has been home to dukes, earls, and the Astor family. Explore the formal gardens, woodland walks, and the famous parterre.",
          latitude: "51.5580",
          longitude: "-0.6880",
          address: "Cliveden Road, Taplow",
          postcode: "SL1 8NS",
          region: "South East",
          category: "house",
          facilities: ["cafe", "parking", "toilets", "shop", "accessible"],
          websiteUrl: "https://www.nationaltrust.org.uk/visit/berkshire-buckinghamshire-oxfordshire/cliveden",
        },
        {
          slug: "stourhead",
          name: "Stourhead",
          shortDescription:
            "World-famous landscape garden with a Palladian mansion.",
          description:
            "Stourhead is a 2,650-acre estate featuring one of the world's finest landscape gardens. The garden was designed in the 18th century and features a lake, classical temples, and rare trees. The Palladian mansion houses a remarkable collection of art and furniture.",
          latitude: "51.1052",
          longitude: "-2.3190",
          address: "Stourton, Warminster",
          postcode: "BA12 6QF",
          region: "South West",
          category: "garden",
          facilities: ["cafe", "parking", "toilets", "shop", "accessible"],
          websiteUrl: "https://www.nationaltrust.org.uk/visit/wiltshire/stourhead",
        },
        {
          slug: "giants-causeway",
          name: "Giant's Causeway",
          shortDescription:
            "Iconic volcanic rock formations on the Northern Irish coast.",
          description:
            "The Giant's Causeway is Northern Ireland's only UNESCO World Heritage Site. Around 40,000 basalt columns form stepping stones leading from the cliff foot into the sea. The result of an ancient volcanic eruption, the dramatic landscape inspired legends of giants.",
          latitude: "55.2408",
          longitude: "-6.5116",
          address: "44 Causeway Road, Bushmills",
          postcode: "BT57 8SU",
          region: "Northern Ireland",
          category: "coast",
          facilities: ["cafe", "parking", "toilets", "shop", "accessible"],
          websiteUrl: "https://www.nationaltrust.org.uk/visit/northern-ireland/giants-causeway",
        },
        {
          slug: "clumber-park",
          name: "Clumber Park",
          shortDescription:
            "Expansive parkland with a Gothic chapel, walled garden, and lake.",
          description:
            "Clumber Park covers 3,800 acres of parkland, heath, and woods in the heart of Nottinghamshire. Originally the country estate of the Dukes of Newcastle, it now offers miles of cycle routes, a stunning Gothic chapel, the longest double lime avenue in Europe, and a walled kitchen garden.",
          latitude: "53.2640",
          longitude: "-1.0770",
          address: "Clumber Park, Worksop",
          postcode: "S80 3AZ",
          region: "East Midlands",
          category: "countryside",
          facilities: ["cafe", "parking", "toilets", "shop", "accessible"],
          websiteUrl: "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/clumber-park",
        },
        {
          slug: "dinefwr",
          name: "Dinefwr",
          shortDescription:
            "Ancient deer park, castle, and Newton House in the Tywi Valley.",
          description:
            "Dinefwr in Carmarthenshire combines a medieval castle, a 17th-century mansion (Newton House), and a stunning deer park in the beautiful Tywi Valley. Home to a herd of fallow deer, the park is a National Nature Reserve with ancient oaks and a rich variety of wildlife.",
          latitude: "51.8720",
          longitude: "-3.9960",
          address: "Llandeilo",
          postcode: "SA19 6RT",
          region: "Wales",
          category: "house",
          facilities: ["cafe", "parking", "toilets", "shop"],
          websiteUrl: "https://www.nationaltrust.org.uk/visit/wales/dinefwr",
        },
      ])
      .returning();

  console.log(`Created ${5} locations`);

  console.log("Seeding pricing...");

  await db.insert(locationPricing).values([
    // Cliveden entry
    { locationId: cliveden.id, pricingType: "entry", tier: "adult", memberPrice: null, nonMemberPrice: "17.00", label: "Adult" },
    { locationId: cliveden.id, pricingType: "entry", tier: "child", memberPrice: null, nonMemberPrice: "8.50", label: "Child (5-17)" },
    { locationId: cliveden.id, pricingType: "entry", tier: "family", memberPrice: null, nonMemberPrice: "42.50", label: "Family (2 adults + 3 children)" },
    // Cliveden parking
    { locationId: cliveden.id, pricingType: "parking", tier: "adult", memberPrice: null, nonMemberPrice: "6.00", label: "All day" },

    // Stourhead entry
    { locationId: stourhead.id, pricingType: "entry", tier: "adult", memberPrice: null, nonMemberPrice: "19.50", label: "Adult (house & garden)" },
    { locationId: stourhead.id, pricingType: "entry", tier: "child", memberPrice: null, nonMemberPrice: "9.75", label: "Child (5-17)" },
    { locationId: stourhead.id, pricingType: "entry", tier: "family", memberPrice: null, nonMemberPrice: "48.75", label: "Family" },
    { locationId: stourhead.id, pricingType: "parking", tier: "adult", memberPrice: null, nonMemberPrice: "8.00", label: "All day" },

    // Giant's Causeway entry
    { locationId: giantsCauseway.id, pricingType: "entry", tier: "adult", memberPrice: null, nonMemberPrice: "15.00", label: "Adult" },
    { locationId: giantsCauseway.id, pricingType: "entry", tier: "child", memberPrice: null, nonMemberPrice: "7.50", label: "Child (5-17)" },
    { locationId: giantsCauseway.id, pricingType: "entry", tier: "family", memberPrice: null, nonMemberPrice: "37.50", label: "Family" },
    { locationId: giantsCauseway.id, pricingType: "parking", tier: "adult", memberPrice: null, nonMemberPrice: "0.00", label: "Included with entry", notes: "Parking is free for all visitors" },

    // Clumber Park entry (free, it's open parkland)
    { locationId: clumberPark.id, pricingType: "entry", tier: "adult", memberPrice: null, nonMemberPrice: "0.00", label: "Adult", notes: "Free entry to park" },
    { locationId: clumberPark.id, pricingType: "parking", tier: "adult", memberPrice: null, nonMemberPrice: "7.00", label: "All day" },

    // Dinefwr entry
    { locationId: dinefwr.id, pricingType: "entry", tier: "adult", memberPrice: null, nonMemberPrice: "12.00", label: "Adult" },
    { locationId: dinefwr.id, pricingType: "entry", tier: "child", memberPrice: null, nonMemberPrice: "6.00", label: "Child (5-17)" },
    { locationId: dinefwr.id, pricingType: "entry", tier: "family", memberPrice: null, nonMemberPrice: "30.00", label: "Family" },
    { locationId: dinefwr.id, pricingType: "parking", tier: "adult", memberPrice: null, nonMemberPrice: "5.00", label: "All day" },
  ]);

  console.log("Seeding complete!");
  await client.end();
}

seed().catch(console.error);
