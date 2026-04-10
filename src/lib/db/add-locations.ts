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
  {
    name: "Dunstable Downs",
    slug: slugify("Dunstable Downs"),
    category: "countryside",
    region: "Bedfordshire",
    latitude: 51.86527779999999,
    longitude: -0.5375,
    description:
      "Dunstable Downs is a chalk escarpment on the northern edge of the Chiltern Hills offering spectacular views across the Vale of Aylesbury. The area is popular for kite flying, walking and wildlife spotting, with its rich chalk grassland supporting numerous butterfly species.",
    shortDescription:
      "A dramatic chalk escarpment on the Chiltern Hills with panoramic views and rich wildlife.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/dunstable-downs-and-whipsnade-estate",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e1/Trig_point%2C_on_Dunstable_Downs_-_geograph.org.uk_-_1440937.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Botallack Mine",
    slug: slugify("Botallack Mine"),
    category: "historic-site",
    region: "Cornwall",
    latitude: 50.1402976,
    longitude: -5.6888419,
    description:
      "Botallack Mine is one of Cornwall's most iconic tin and copper mining sites, perched dramatically on the cliffs above the Atlantic Ocean. The Crown Engine Houses, built precariously on the cliff face, are a UNESCO World Heritage Site and symbol of Cornwall's industrial heritage.",
    shortDescription:
      "Iconic clifftop tin mine ruins and UNESCO World Heritage Site on the Cornish coast.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/botallack",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Crown_Mines_2.png",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Godrevy",
    slug: slugify("Godrevy"),
    category: "coast",
    region: "Cornwall",
    latitude: 50.2305259,
    longitude: -5.388579,
    description:
      "Godrevy is a stunning headland on the north Cornwall coast, famous for its lighthouse which inspired Virginia Woolf's novel 'To the Lighthouse'. The area offers beautiful sandy beaches, dramatic clifftop walks, and is home to a colony of grey seals.",
    shortDescription:
      "Beautiful headland with lighthouse, sandy beaches and seal colony on the north Cornwall coast.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/godrevy",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c8/Godrevy_Lighthouse_2024_05.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Sandymouth Beach",
    slug: slugify("Sandymouth Beach"),
    category: "coast",
    region: "Cornwall",
    latitude: 50.86167330000001,
    longitude: -4.556731099999999,
    description:
      "Sandymouth is a dramatic stretch of coastline near Bude in North Cornwall, featuring a wide sandy beach backed by twisted cliffs and waterfalls. The unusual rock formations reveal layers of geological history, and the beach is a popular spot for surfing and rockpooling.",
    shortDescription:
      "A dramatic sandy beach with twisted cliffs and waterfalls near Bude in North Cornwall.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/sandymouth",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3e/Heavy_sky_at_Sandymouth_Bay%2C_near_Bude%2C_Cornwall_-_geograph.org.uk_-_4716859.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.00", memberPrice: null, label: "Whole day parking" },
    ] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Crook Hall",
    slug: slugify("Crook Hall"),
    category: "house",
    region: "County Durham",
    latitude: 54.7818944,
    longitude: -1.5742311,
    description:
      "Crook Hall is a medieval manor house set in beautiful gardens in the heart of Durham city. Dating back to the 13th century, it is one of the oldest inhabited houses in the city, with enchanting walled gardens offering views of Durham Cathedral.",
    shortDescription:
      "A medieval manor house with enchanting gardens and views of Durham Cathedral.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/north-east/crook-hall-and-gardens",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/73/Crook_Hall_Gardens%2C_Durham_-_geograph.org.uk_-_7830838.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Stainsby Mill",
    slug: slugify("Stainsby Mill"),
    category: "historic-site",
    region: "Derbyshire",
    latitude: 53.18320310000001,
    longitude: -1.3196062,
    description:
      "Stainsby Mill is a fully working water-powered flour mill on the Hardwick Estate in Derbyshire. Dating from the late 18th century, the mill still grinds flour using traditional methods and provides a fascinating insight into rural milling heritage.",
    shortDescription:
      "A working water-powered flour mill on the Hardwick Estate in Derbyshire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/stainsby-mill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/65/Stainsby_Mill_-_geograph.org.uk_-_2284146.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Baggy Point",
    slug: slugify("Baggy Point"),
    category: "coast",
    region: "Devon",
    latitude: 51.1349906,
    longitude: -4.2422814,
    description:
      "Baggy Point is a dramatic headland near Croyde in North Devon, jutting out into the Atlantic Ocean. The clifftop walk offers stunning views along the coast, and the rocky shores below are rich in marine life and popular with rock climbers.",
    shortDescription:
      "A dramatic headland near Croyde with stunning Atlantic views and rich marine life.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/baggy-point",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/71/Baggy_Point_-_geograph.org.uk_-_1473056.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Heddon Valley",
    slug: slugify("Heddon Valley"),
    category: "countryside",
    region: "Devon",
    latitude: 51.2159357,
    longitude: -3.9266187,
    description:
      "Heddon Valley is a dramatic wooded valley on the Exmoor coast where the River Heddon flows through ancient oak woodland to the sea at Heddon's Mouth. The valley offers wonderful walks through one of the largest areas of native oak woodland in the South West.",
    shortDescription:
      "A dramatic wooded valley on the Exmoor coast with ancient oak woodland and coastal walks.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/heddon-valley",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Heddon%27s_Mouth_-_geograph.org.uk_-_5880.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Old Harry Rocks",
    slug: slugify("Old Harry Rocks"),
    category: "coast",
    region: "Dorset",
    latitude: 50.608277,
    longitude: -1.960769,
    description:
      "Old Harry Rocks are dramatic chalk formations at the eastern end of the Jurassic Coast in Dorset, marking the start of the South West Coast Path. These iconic sea stacks and arches have been sculpted by the sea over millions of years and form part of the Isle of Purbeck.",
    shortDescription:
      "Iconic chalk sea stacks and arches on the Jurassic Coast in Dorset.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/dorset/old-harry-rocks",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/4f/Old_Harry_rocks%2C_Dorset%2C_England.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Coggeshall Grange Barn",
    slug: slugify("Coggeshall Grange Barn"),
    category: "historic-site",
    region: "Essex",
    latitude: 51.8678743,
    longitude: 0.6842568,
    description:
      "Coggeshall Grange Barn is one of the oldest surviving timber-framed barns in Europe, dating from around 1140. Originally part of a Cistercian monastery, this remarkable medieval building showcases exceptional craftsmanship and is a scheduled ancient monument.",
    shortDescription:
      "One of Europe's oldest surviving timber-framed barns, dating from around 1140.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/coggeshall-grange-barn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/5b/Coggeshall-Grange_barn%28inside_looking_south%29.JPG",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Danbury Commons & Blakes Wood",
    slug: slugify("Danbury Commons & Blakes Wood"),
    category: "countryside",
    region: "Essex",
    latitude: 51.712498,
    longitude: 0.5774341,
    description:
      "Danbury Commons and Blakes Wood form an important nature reserve in the Essex countryside, featuring ancient woodland, heathland and wildlife-rich habitats. The area supports rare species including nightingales and is criss-crossed with peaceful walking trails.",
    shortDescription:
      "Ancient woodland and heathland nature reserve in the Essex countryside.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/danbury-commons-and-blakes-wood",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Danbury_Common_-_geograph.org.uk_-_1282346.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Ashleworth Tithe Barn",
    slug: slugify("Ashleworth Tithe Barn"),
    category: "historic-site",
    region: "Gloucestershire",
    latitude: 51.92507999999999,
    longitude: -2.266221,
    description:
      "Ashleworth Tithe Barn is a magnificent medieval barn built in the 15th century beside the River Severn. With its impressive stone walls and original roof timbers, it is one of the finest surviving tithe barns in England and a Grade I listed building.",
    shortDescription:
      "A magnificent 15th-century tithe barn beside the River Severn in Gloucestershire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/ashleworth-tithe-barn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c0/Ashleworth_tithe_barn.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Haresfield Beacon",
    slug: slugify("Haresfield Beacon"),
    category: "countryside",
    region: "Gloucestershire",
    latitude: 51.77828599999999,
    longitude: -2.261821,
    description:
      "Haresfield Beacon is a prominent viewpoint on the Cotswold escarpment offering sweeping views across the Severn Vale to the Forest of Dean and Wales beyond. The site includes an Iron Age hill fort and is surrounded by wildflower-rich grassland and ancient woodland.",
    shortDescription:
      "A dramatic Cotswold viewpoint with Iron Age hill fort and panoramic Severn Vale views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/haresfield-beacon-and-standish-wood",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/View_from_Haresfield_Beacon_-_geograph.org.uk_-_1120282.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "4.00", memberPrice: null, label: "Whole day parking" },
    ] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Bembridge Fort",
    slug: slugify("Bembridge Fort"),
    category: "historic-site",
    region: "Isle of Wight",
    latitude: 50.67089559999999,
    longitude: -1.1181013,
    description:
      "Bembridge Fort is a Victorian coastal defence built in the 1860s as part of the Palmerston Forts chain to protect against French invasion. The fort features underground tunnels, gun emplacements and offers panoramic views across the Solent from its rooftop.",
    shortDescription:
      "A Victorian coastal defence fort with underground tunnels and Solent views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/isle-of-wight/bembridge-fort",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/9/92/Entrance_to_Bembridge_Fort%2C_Isle_of_Wight_2.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Chiddingstone",
    slug: slugify("Chiddingstone"),
    category: "historic-site",
    region: "Kent",
    latitude: 51.185947,
    longitude: 0.146449,
    description:
      "Chiddingstone is one of the most picturesque village streets in Kent, with a row of beautifully preserved 16th and 17th-century half-timbered houses. The village is named after a large sandstone boulder, the Chiding Stone, said to have been used for public scolding.",
    shortDescription:
      "One of Kent's most picturesque villages with beautifully preserved Tudor houses.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/kent/chiddingstone",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/7/7b/Chiddingstone_Post_Office_-_geograph.org.uk_-_1260248.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Old Soar Manor",
    slug: slugify("Old Soar Manor"),
    category: "house",
    region: "Kent",
    latitude: 51.2631032,
    longitude: 0.3202718,
    description:
      "Old Soar Manor is a rare surviving example of a medieval knight's dwelling, dating from around 1290. The stone-built solar block, with its chapel and undercroft, provides a fascinating glimpse into life in a 13th-century manor house.",
    shortDescription:
      "A rare surviving medieval knight's dwelling dating from around 1290.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/kent/old-soar-manor",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d8/Old_Soar_Manor3.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Heysham Head",
    slug: slugify("Heysham Head"),
    category: "coast",
    region: "Lancashire",
    latitude: 54.0480716,
    longitude: -2.9054855,
    description:
      "Heysham Head is a rocky promontory on the Lancashire coast with a remarkable collection of early Christian remains. The ruins of St Patrick's Chapel and the famous rock-cut graves, carved into the cliff edge, date back over a thousand years.",
    shortDescription:
      "A rocky headland with ancient rock-cut graves and early Christian ruins on the Lancashire coast.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/liverpool-lancashire/heysham-head",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0a/St._Peter%27s_Church%2C_Heysham.JPG",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Grantham House",
    slug: slugify("Grantham House"),
    category: "house",
    region: "Lincolnshire",
    latitude: 52.9150047,
    longitude: -0.6399695,
    description:
      "Grantham House is an elegant town house dating from the 14th century, set in peaceful walled gardens beside the River Witham. The house has a rich history spanning six centuries and its gardens offer a tranquil retreat in the heart of Grantham.",
    shortDescription:
      "An elegant 14th-century town house with walled gardens beside the River Witham.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/grantham-house",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Grantham_House_-_geograph.org.uk_-_333721.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Blewcoat School",
    slug: slugify("Blewcoat School"),
    category: "historic-site",
    region: "London",
    latitude: 51.4984472,
    longitude: -0.1359578,
    description:
      "The Blewcoat School is a charming Queen Anne building built in 1709 as a charity school for poor children in Westminster. Now serving as the National Trust's London gift shop, the building retains its original architectural character with a distinctive statue of a charity boy above the entrance.",
    shortDescription:
      "A charming 1709 Queen Anne charity school building in the heart of Westminster.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/london/blewcoat-school",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/BlewCoatSchool.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Mow Cop Castle",
    slug: slugify("Mow Cop Castle"),
    category: "castle",
    region: "Staffordshire",
    latitude: 53.1130583,
    longitude: -2.2143475,
    description:
      "Mow Cop Castle is a dramatic folly built in 1754 as a summerhouse and designed to look like a ruined medieval castle. Perched at 335 metres on the Cheshire-Staffordshire border, it offers spectacular views across the Cheshire Plain and is the birthplace of Primitive Methodism.",
    shortDescription:
      "A dramatic 1754 castle folly on the Cheshire-Staffordshire border with panoramic views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/mow-cop-castle",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/57/Mowcopcastle.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Cissbury Ring",
    slug: slugify("Cissbury Ring"),
    category: "historic-site",
    region: "West Sussex",
    latitude: 50.8604598,
    longitude: -0.3832473,
    description:
      "Cissbury Ring is one of the largest hillforts in England, with ramparts enclosing over 60 acres on the South Downs above Worthing. Dating from the Iron Age, the site also contains Neolithic flint mines over 5,000 years old, making it one of the most important archaeological sites in Sussex.",
    shortDescription:
      "One of England's largest Iron Age hillforts on the South Downs with Neolithic flint mines.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/sussex/cissbury-ring",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/86/Cissbury_Ring_rampart_5.JPG",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Devil's Dyke",
    slug: slugify("Devil's Dyke"),
    category: "countryside",
    region: "West Sussex",
    latitude: 50.8850936,
    longitude: -0.2125157,
    description:
      "Devil's Dyke is a V-shaped valley on the South Downs near Brighton, reputed to be the longest, deepest and widest dry valley in the UK. Legend says the devil dug it to flood the churches of the Weald, and today it offers some of the finest views in Sussex.",
    shortDescription:
      "A dramatic dry valley on the South Downs near Brighton with legendary origins and fine views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/sussex/devils-dyke",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/Devils_Dyke_from_North_Hill_-_geograph.org.uk_-_7316811.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "8.00", memberPrice: null, label: "Whole day parking" },
    ] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Bredon Barn",
    slug: slugify("Bredon Barn"),
    category: "historic-site",
    region: "Worcestershire",
    latitude: 52.0311801,
    longitude: -2.1202908,
    description:
      "Bredon Barn is a magnificent 14th-century tithe barn near the village of Bredon in Worcestershire. With its impressive stone construction and massive interior, it is one of the finest medieval barns in England and a testament to the agricultural wealth of the region.",
    shortDescription:
      "A magnificent 14th-century tithe barn near Bredon in Worcestershire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/bredon-barn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/3d/Bredon_Tithe_Barn_-_geograph.org.uk_-_318630.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Hawford Dovecote",
    slug: slugify("Hawford Dovecote"),
    category: "historic-site",
    region: "Worcestershire",
    latitude: 52.2438619,
    longitude: -2.2263808,
    description:
      "Hawford Dovecote is a half-timbered 16th-century dovecote, one of the finest surviving examples in Worcestershire. The octagonal structure retains many of its original nesting boxes and provides a charming example of Tudor agricultural architecture.",
    shortDescription:
      "A fine half-timbered 16th-century dovecote in Worcestershire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/hawford-dovecote",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/44/Hawford_Dovecote%2C_Worcestershire_-_geograph.org.uk_-_3955498.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Malham Tarn Estate",
    slug: slugify("Malham Tarn Estate"),
    category: "countryside",
    region: "North Yorkshire",
    latitude: 54.1027652,
    longitude: -2.1758354,
    description:
      "Malham Tarn is one of only eight natural upland lakes in England, set in the heart of the Yorkshire Dales. The surrounding estate encompasses limestone pavement, moorland and flower-rich meadows, and has been a site of scientific research since Charles Darwin visited in 1842.",
    shortDescription:
      "One of England's few natural upland lakes in the heart of the Yorkshire Dales.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/malham-tarn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Malham_Tarn_2.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Upper Wharfedale",
    slug: slugify("Upper Wharfedale"),
    category: "countryside",
    region: "North Yorkshire",
    latitude: 54.1909986,
    longitude: -2.0889236,
    description:
      "Upper Wharfedale is a spectacular valley in the Yorkshire Dales, stretching from Buckden to the head of the dale. The area features dramatic limestone scenery, traditional hay meadows, ancient woodlands and the picturesque village of Buckden.",
    shortDescription:
      "A spectacular limestone valley with traditional meadows in the Yorkshire Dales.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/upper-wharfedale",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Wharfedale_near_Buckden_%287860%29.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Conwy Suspension Bridge",
    slug: slugify("Conwy Suspension Bridge"),
    category: "historic-site",
    region: "Conwy",
    latitude: 53.2804774,
    longitude: -3.8237597,
    description:
      "Conwy Suspension Bridge is an elegant bridge designed by Thomas Telford and completed in 1826, spanning the River Conwy next to the medieval castle. The bridge features distinctive castellated towers to complement the adjacent castle walls and is a masterpiece of early 19th-century engineering.",
    shortDescription:
      "Thomas Telford's elegant 1826 suspension bridge beside Conwy Castle.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wales/conwy-suspension-bridge",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/f/fb/Conwy_Suspension_Bridge_from_the_castle.JPG",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Skenfrith Castle",
    slug: slugify("Skenfrith Castle"),
    category: "castle",
    region: "Monmouthshire",
    latitude: 51.878231,
    longitude: -2.790366,
    description:
      "Skenfrith Castle is one of the Three Castles of Gwent, built in the early 13th century to guard the route from England into Wales. The castle features an impressive round keep and curtain walls set in a picturesque location beside the River Monnow.",
    shortDescription:
      "A 13th-century castle of the Three Castles of Gwent beside the River Monnow.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wales/skenfrith-castle",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/46/SKENFRITH_CASTLE.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Rhossili & South Gower Coast",
    slug: slugify("Rhossili & South Gower Coast"),
    category: "coast",
    region: "Swansea",
    latitude: 51.5688603,
    longitude: -4.2901175,
    description:
      "Rhossili Bay is regularly voted one of the best beaches in the UK and Europe, a three-mile sweep of golden sand on the tip of the Gower Peninsula. The dramatic coastline includes the tidal island of Worm's Head, spectacular cliffs and the remains of a medieval village.",
    shortDescription:
      "Award-winning three-mile beach with dramatic cliffs and tidal island on the Gower Peninsula.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wales/rhossili-and-south-gower-coast",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/08/Rhosilli_village_from_the_air.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
  {
    name: "Cilgerran Castle",
    slug: slugify("Cilgerran Castle"),
    category: "castle",
    region: "Pembrokeshire",
    latitude: 52.0571412,
    longitude: -4.6340686,
    description:
      "Cilgerran Castle is a dramatic Norman fortress perched high above the Teifi Gorge in Pembrokeshire. The castle's twin round towers, dating from the 13th century, have inspired artists including J.M.W. Turner and offer commanding views over the wooded river valley.",
    shortDescription:
      "A dramatic Norman castle above the Teifi Gorge that inspired Turner's paintings.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wales/cilgerran-castle",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/01_Cilgerran_Castle.jpg",
    pricing: [] as {
      pricingType: string;
      pricingCategory?: string;
      tier: string;
      nonMemberPrice: string;
      memberPrice?: string | null;
      label: string;
    }[],
  },
];

async function addLocations() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  for (const loc of newLocations) {
    const slug = loc.slug;

    // Check if already exists
    const existing = await db
      .select()
      .from(locations)
      .where(eq(locations.slug, slug));

    if (existing.length > 0) {
      console.log(`⏭️  Skipping ${loc.name} (already exists)`);
      continue;
    }

    // Insert location
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

    // Insert pricing
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
