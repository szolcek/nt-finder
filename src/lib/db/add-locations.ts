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
  // === KENT ===
  {
    name: "St John's Jerusalem",
    slug: slugify("St John's Jerusalem"),
    category: "garden",
    region: "Kent",
    latitude: 51.4089090,
    longitude: 0.2373830,
    description:
      "St John's Jerusalem is a tranquil moated garden surrounding a former 13th-century chapel of the Knights Hospitaller at Sutton at Hone in Kent. The garden features herbaceous borders, old fruit trees and a picturesque moat fed by the River Darent.",
    shortDescription:
      "A tranquil moated garden around a former 13th-century Knights Hospitaller chapel in Kent.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/kent/st-johns-jerusalem",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/29/St_John%27s_Jerusalem_across_the_River_Darent_-_geograph.org.uk_-_5062148.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === NORFOLK ===
  {
    name: "Darrow Wood",
    slug: slugify("Darrow Wood"),
    category: "countryside",
    region: "Norfolk",
    latitude: 52.4563832,
    longitude: 1.3330176,
    description:
      "Darrow Wood is a peaceful area of ancient woodland near Blickling in Norfolk, carpeted with bluebells in spring. The wood is home to a variety of birds and butterflies and connects to the wider Blickling estate via footpaths.",
    shortDescription:
      "Ancient bluebell woodland near Blickling in Norfolk, rich in birds and butterflies.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/norfolk/darrow-wood",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/87/Blickling_Hall_-_south-west_facade.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "St George's Guildhall",
    slug: slugify("St George's Guildhall"),
    category: "historic-site",
    region: "Norfolk",
    latitude: 52.7554630,
    longitude: 0.3936380,
    description:
      "St George's Guildhall in King's Lynn is the largest surviving medieval guildhall in England, dating from 1410. Now a thriving arts centre and theatre, it has hosted performances since Shakespeare's time and retains its impressive timber-framed great hall.",
    shortDescription:
      "The largest surviving medieval guildhall in England, now an arts centre in King's Lynn.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/norfolk/st-georges-guildhall",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/54/Collage_of_King%27s_Lynn_icons.png",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === SOMERSET ===
  {
    name: "Brean Down",
    slug: slugify("Brean Down"),
    category: "coast",
    region: "Somerset",
    latitude: 51.3218514,
    longitude: -3.0111752,
    description:
      "Brean Down is a dramatic limestone peninsula jutting into the Bristol Channel near Weston-super-Mare. The mile-long promontory rises to 97 metres and features rare limestone grassland, the remains of a Victorian fort at its tip, and panoramic views across the channel to Wales.",
    shortDescription:
      "A dramatic limestone peninsula in the Bristol Channel with a Victorian fort and panoramic views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/brean-down",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/85/Brean_Down.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Wellington Monument",
    slug: slugify("Wellington Monument"),
    category: "historic-site",
    region: "Somerset",
    latitude: 50.9785640,
    longitude: -3.2244989,
    description:
      "The Wellington Monument is a 175-foot triangular obelisk on the highest point of the Blackdown Hills, built to honour the Duke of Wellington's victory at Waterloo. Set in heathland with far-reaching views, it is one of the tallest three-sided obelisks in the world.",
    shortDescription:
      "A 175-foot obelisk on the Blackdown Hills honouring the Duke of Wellington's Waterloo victory.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/wellington-monument",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Wellington_Monument%2C_Somerset.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "King John's Hunting Lodge",
    slug: slugify("King John's Hunting Lodge"),
    category: "historic-site",
    region: "Somerset",
    latitude: 51.2871200,
    longitude: -2.8175802,
    description:
      "King John's Hunting Lodge is a striking Tudor merchant's house on the corner of the market square in Axbridge, Somerset. Despite its name, it has no connection to King John — the timber-framed building dates from around 1500 and now houses a local history museum.",
    shortDescription:
      "A striking Tudor merchant's house on the market square in Axbridge, now a local museum.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/king-johns-hunting-lodge",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/King_John%27s_Hunting_Lodge%2C_Axbridge.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Leigh Woods",
    slug: slugify("Leigh Woods"),
    category: "countryside",
    region: "Somerset",
    latitude: 51.4629956,
    longitude: -2.6412904,
    description:
      "Leigh Woods is a large area of ancient woodland on the cliffs above the Avon Gorge, opposite Clifton in Bristol. The woods contain rare whitebeam trees found nowhere else in the world, and an Iron Age hillfort with views of the Clifton Suspension Bridge.",
    shortDescription:
      "Ancient woodland above the Avon Gorge with rare whitebeams and views of Clifton Suspension Bridge.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/bath-bristol/leigh-woods",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e6/Uk_bristol_lw2.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Stoke-sub-Hamdon Priory",
    slug: slugify("Stoke-sub-Hamdon Priory"),
    category: "historic-site",
    region: "Somerset",
    latitude: 50.9541016,
    longitude: -2.7512048,
    description:
      "Stoke-sub-Hamdon Priory is a complex of 14th- and 15th-century buildings that once formed part of a chantry. Built from golden Ham stone quarried on nearby Ham Hill, it includes a great hall and screens passage, now surrounded by a quiet cottage garden.",
    shortDescription:
      "A 14th-century chantry complex of golden Ham stone with a medieval great hall in Somerset.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/stoke-sub-hamdon-priory",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/46/North_Street%2C_Stoke-sub-Hamdon%2C_Somerset.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Stembridge Tower Mill",
    slug: slugify("Stembridge Tower Mill"),
    category: "historic-site",
    region: "Somerset",
    latitude: 51.0711909,
    longitude: -2.8108290,
    description:
      "Stembridge Tower Mill is the last thatched windmill in England, dating from 1822. The four-storey tower mill at High Ham on the Somerset Levels retains its original machinery and offers views across the moors to Glastonbury Tor.",
    shortDescription:
      "The last thatched windmill in England, with views to Glastonbury Tor from the Somerset Levels.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/stembridge-tower-mill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Stembridge_Windmill_%28geograph_2013400%29.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Cadbury Camp",
    slug: slugify("Cadbury Camp"),
    category: "historic-site",
    region: "Somerset",
    latitude: 51.4486203,
    longitude: -2.7868671,
    description:
      "Cadbury Camp is an Iron Age hillfort near Tickenham in North Somerset, with well-preserved ramparts enclosing a wooded hilltop. The site offers views across the Gordano Valley and Bristol Channel and is rich in wildflowers and woodland birds.",
    shortDescription:
      "An Iron Age hillfort near Tickenham with views across the Gordano Valley and Bristol Channel.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/somerset/cadbury-camp",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b1/A_view_of_Tickenham.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === STAFFORDSHIRE ===
  {
    name: "Downs Banks",
    slug: slugify("Downs Banks"),
    category: "countryside",
    region: "Staffordshire",
    latitude: 52.9260123,
    longitude: -2.1498039,
    description:
      "Downs Banks is a wooded valley near Barlaston in Staffordshire, following a stream through a mix of ancient woodland, heath and grassland. The area is rich in wildlife including kingfishers and dippers along the brook, and bluebells carpet the woods in spring.",
    shortDescription:
      "A wooded valley near Barlaston with ancient woodland, heath and rich streamside wildlife.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/downs-banks",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Downs_Banks_Entrance_-_geograph.org.uk_-_1701072.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === WORCESTERSHIRE ===
  {
    name: "Knowles Mill",
    slug: slugify("Knowles Mill"),
    category: "historic-site",
    region: "Worcestershire",
    latitude: 52.3868336,
    longitude: -2.3507373,
    description:
      "Knowles Mill is a small stone watermill on Dowles Brook in the Wyre Forest near Bewdley. The mill retains its waterwheel and machinery, set in a peaceful wooded valley that is part of one of the largest ancient lowland forests in England.",
    shortDescription:
      "A stone watermill in the Wyre Forest with a working waterwheel on Dowles Brook.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/knowles-mill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/80/Bewdley_-_panoramio_%287%29.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Middle Littleton Tithe Barn",
    slug: slugify("Middle Littleton Tithe Barn"),
    category: "historic-site",
    region: "Worcestershire",
    latitude: 52.1217389,
    longitude: -1.8848989,
    description:
      "Middle Littleton Tithe Barn is one of the largest and finest medieval barns in the country, dating from the 13th or 14th century. The impressive stone and timber structure in the Vale of Evesham was built to store tithes for the Abbot of Evesham.",
    shortDescription:
      "One of England's largest medieval tithe barns, built for the Abbot of Evesham.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/middle-littleton-tithe-barn",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0f/Middle_Littleton_Tithe_Barn_-_geograph.org.uk_-_41334.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Rosedene",
    slug: slugify("Rosedene"),
    category: "house",
    region: "Worcestershire",
    latitude: 52.3560000,
    longitude: -2.1042100,
    description:
      "Rosedene is a Chartist cottage at Dodford near Bromsgrove, the last surviving example of a smallholding built by the Chartist Land Company in the 1840s. The cottage tells the story of Feargus O'Connor's radical scheme to give working people a home and land of their own.",
    shortDescription:
      "The last surviving Chartist Land Company cottage, telling the story of 1840s radical land reform.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/rosedene",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/ca/Chartist_meeting_on_Kennington_Common_by_William_Edward_Kilburn_1848_-_restoration1.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Wichenford Dovecote",
    slug: slugify("Wichenford Dovecote"),
    category: "historic-site",
    region: "Worcestershire",
    latitude: 52.2366390,
    longitude: -2.3130913,
    description:
      "Wichenford Dovecote is a 17th-century timber-framed and brick dovecote in the Worcestershire village of Wichenford. The half-timbered black-and-white structure contains nearly 600 nesting holes and is a fine example of this once-common agricultural building.",
    shortDescription:
      "A 17th-century timber-framed dovecote with nearly 600 nesting holes in Worcestershire.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/wichenford-dovecote",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/53/Wichenford_Church_-_geograph.org.uk_-_186174.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === YORKSHIRE ===
  {
    name: "Maister House",
    slug: slugify("Maister House"),
    category: "house",
    region: "East Yorkshire",
    latitude: 53.7802173,
    longitude: -0.1530132,
    description:
      "Maister House is a Georgian merchant's house on Hull's High Street, rebuilt in 1744 after a fire. The house is notable for its magnificent Palladian entrance hall and staircase with ornate ironwork by Robert Bakewell, considered one of the finest in England.",
    shortDescription:
      "A 1744 Georgian merchant's house in Hull with a magnificent Palladian entrance hall.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/maister-house",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/High_Street%2C_Hull_-_geograph.org.uk_-_6558642.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Braithwaite Hall",
    slug: slugify("Braithwaite Hall"),
    category: "house",
    region: "North Yorkshire",
    latitude: 54.2673874,
    longitude: -1.8213489,
    description:
      "Braithwaite Hall is a 17th-century farmhouse in Coverdale in the Yorkshire Dales, used as a youth hostel. The stone-built hall with its mullioned windows sits in a remote and beautiful valley, offering a base for exploring Wensleydale and the surrounding fells.",
    shortDescription:
      "A 17th-century farmhouse in Coverdale, now a youth hostel in the Yorkshire Dales.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/braithwaite-hall",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/56/EastWitton.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Bridestones, Crosscliff and Blakey Topping",
    slug: slugify("Bridestones Crosscliff and Blakey Topping"),
    category: "countryside",
    region: "North Yorkshire",
    latitude: 54.3107328,
    longitude: -0.6601427,
    description:
      "The Bridestones are a collection of striking mushroom-shaped rock formations on the North York Moors, sculpted by millennia of weathering. Together with Crosscliff viewpoint and the conical hill of Blakey Topping, the area offers dramatic moorland scenery and important heathland habitat.",
    shortDescription:
      "Striking mushroom-shaped rock formations on the North York Moors with dramatic moorland views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/bridestones-crosscliff-and-blakey-topping",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e2/Bridestones_1.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Yorkshire Coast",
    slug: slugify("Yorkshire Coast"),
    category: "coast",
    region: "North Yorkshire",
    latitude: 54.4302001,
    longitude: -0.5322703,
    description:
      "The National Trust's Yorkshire Coast stretches from Saltburn to Filey, taking in the fishing village of Robin Hood's Bay, dramatic Ravenscar cliffs and the old alum works. The coastline features towering cliffs, sheltered coves and the Cleveland Way coastal path.",
    shortDescription:
      "Dramatic coastline from Saltburn to Filey, including Robin Hood's Bay and Ravenscar cliffs.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/yorkshire/yorkshire-coast",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/Robin_Hood%27s_Bay_-_geograph.org.uk_-_7573003.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === SURREY ===
  {
    name: "Bookham Commons",
    slug: slugify("Bookham Commons"),
    category: "countryside",
    region: "Surrey",
    latitude: 51.2899218,
    longitude: -0.3860214,
    description:
      "Bookham Commons are two ancient commons near Leatherhead in Surrey, with a rich mosaic of oak woodland, grassland, ponds and scrub. The area supports over 2,000 species of wildlife and has been continuously studied since 1941, making it one of the best-recorded sites in Britain.",
    shortDescription:
      "Ancient Surrey commons supporting over 2,000 species — one of Britain's best-recorded wildlife sites.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/surrey/bookham-commons",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e5/Great_Bookham_Common_-_geograph.org.uk_-_676420.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Clandon Park",
    slug: slugify("Clandon Park"),
    category: "house",
    region: "Surrey",
    latitude: 51.2506636,
    longitude: -0.5087918,
    description:
      "Clandon Park is an 18th-century Palladian mansion near Guildford, severely damaged by fire in 2015. The National Trust is undertaking a major restoration project, and the surrounding parkland and gardens remain open, offering woodland walks and a restored Dutch garden.",
    shortDescription:
      "An 18th-century Palladian mansion being restored after a 2015 fire, with open parkland and gardens.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/surrey/clandon-park",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/0a/Clandon_House%2C_Surrey.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "River Wey and Godalming Navigations",
    slug: slugify("River Wey and Godalming Navigations"),
    category: "countryside",
    region: "Surrey",
    latitude: 51.1853505,
    longitude: -0.6097526,
    description:
      "The River Wey and Godalming Navigations is one of the first rivers in England to be made navigable, dating from 1653. The 20-mile waterway from Godalming to Weybridge passes through peaceful Surrey countryside, with towpath walks, locks and the historic Dapdune Wharf.",
    shortDescription:
      "One of England's first navigable rivers, with 20 miles of towpath walks through Surrey countryside.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/surrey/river-wey-and-godalming-navigations-and-dapdune-wharf",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/36/Catteshall_Lock_1.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Reigate Hill and Gatton Park",
    slug: slugify("Reigate Hill and Gatton Park"),
    category: "countryside",
    region: "Surrey",
    latitude: 51.2559588,
    longitude: -0.1915067,
    description:
      "Reigate Hill is a chalk escarpment on the North Downs Way with panoramic views across the Weald. Adjacent Gatton Park features a landscaped lake, pleasure grounds and the Gothic Gatton church. Together they offer walks through chalk grassland rich in orchids and butterflies.",
    shortDescription:
      "A chalk escarpment on the North Downs Way with panoramic views, adjacent to landscaped Gatton Park.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/surrey/reigate-hill-and-gatton-park",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Old_Town_Hall%2C_Reigate%2C_Surrey_%28June_2022%29.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === SUSSEX ===
  {
    name: "Harting Down",
    slug: slugify("Harting Down"),
    category: "countryside",
    region: "West Sussex",
    latitude: 50.9567909,
    longitude: -0.8756866,
    description:
      "Harting Down is a sweep of open chalk downland on the South Downs Way near South Harting in West Sussex. The steep slopes support species-rich grassland with orchids and butterflies, and the hilltop offers expansive views northward across the Weald.",
    shortDescription:
      "Open chalk downland on the South Downs Way with orchid-rich grassland and Weald views.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/sussex/harting-down",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/8a/South_Downs_Way%2C_towards_Chanctonbury_Ring.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Wakehurst",
    slug: slugify("Wakehurst"),
    category: "garden",
    region: "West Sussex",
    latitude: 51.0689176,
    longitude: -0.0872491,
    description:
      "Wakehurst is Kew's wild botanic garden in the Sussex High Weald, home to the Millennium Seed Bank — the world's largest wild plant seed conservation project. The 535-acre estate features ornamental gardens, a winter garden, ancient woodland and a stunning Himalayan glade.",
    shortDescription:
      "Kew's wild botanic garden in Sussex, home to the Millennium Seed Bank and 535 acres of gardens.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/sussex/wakehurst",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/1/15/Wakehurst_Place_Mansion_1%2C_West_Sussex_-_Aug_2009.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === WARWICKSHIRE ===
  {
    name: "Kinwarton Dovecote",
    slug: slugify("Kinwarton Dovecote"),
    category: "historic-site",
    region: "Warwickshire",
    latitude: 52.2242104,
    longitude: -1.8463978,
    description:
      "Kinwarton Dovecote is a circular 14th-century dovecote near Alcester in Warwickshire, one of the oldest in England. The sandstone building still has its original revolving ladder (potence) for reaching the 580 nesting holes that line its interior walls.",
    shortDescription:
      "A circular 14th-century dovecote with 580 nesting holes and an original revolving ladder.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/warwickshire/kinwarton-dovecote",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/5/55/Former_rectory_to_St_Mary%27s_Church%2C_Kinwarton%2C_Warwickshire.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "The Roundhouse",
    slug: slugify("The Roundhouse"),
    category: "historic-site",
    region: "West Midlands",
    latitude: 52.4768367,
    longitude: -1.9157923,
    description:
      "The Roundhouse is a Grade II* listed circular building in the heart of Birmingham, built in 1874 as a horse-drawn tram depot. Restored by the National Trust, it now serves as a community hub and creative space celebrating Birmingham's diverse heritage.",
    shortDescription:
      "A restored 1874 circular tram depot in Birmingham, now a community hub and creative space.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/roundhouse",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/b/b3/The_Roundhouse_-_St_Vincent_Street%2C_Ladywood.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },

  // === WILTSHIRE ===
  {
    name: "Cley Hill",
    slug: slugify("Cley Hill"),
    category: "countryside",
    region: "Wiltshire",
    latitude: 51.1973407,
    longitude: -2.2336920,
    description:
      "Cley Hill is a prominent chalk hill near Warminster in Wiltshire, crowned by two Bronze Age bowl barrows and an Iron Age hillfort. The steep slopes are rich in wildflowers and butterflies, and the summit offers panoramic views across the Wiltshire countryside to Longleat.",
    shortDescription:
      "A prominent chalk hill near Warminster with Bronze Age barrows and views to Longleat.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wiltshire/cley-hill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Cley_Hill.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Figsbury Ring",
    slug: slugify("Figsbury Ring"),
    category: "historic-site",
    region: "Wiltshire",
    latitude: 51.1034445,
    longitude: -1.7323184,
    description:
      "Figsbury Ring is a large Iron Age hillfort on a chalk ridge northeast of Salisbury. The circular earthwork encloses 15 acres of species-rich chalk grassland supporting 13 species of orchid, and is an important site for butterflies including the Duke of Burgundy.",
    shortDescription:
      "A large Iron Age hillfort near Salisbury with 13 orchid species and rare butterflies.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wiltshire/figsbury-ring",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/6/62/Figsbury_Ring_3.jpg",
    pricing: [] as { pricingType: string; pricingCategory?: string; tier: string; nonMemberPrice: string; memberPrice?: string | null; label: string }[],
  },
  {
    name: "Pepperbox Hill",
    slug: slugify("Pepperbox Hill"),
    category: "countryside",
    region: "Wiltshire",
    latitude: 51.0227710,
    longitude: -1.6984084,
    description:
      "Pepperbox Hill is a chalk hilltop southeast of Salisbury, named after the 17th-century Eyre's Folly — an octagonal brick tower whose purpose remains a mystery. The downland grassland is rich in wildflowers, and the hill offers views across the New Forest and Salisbury Plain.",
    shortDescription:
      "A chalk hilltop with a mysterious 17th-century octagonal tower and views to the New Forest.",
    websiteUrl:
      "https://www.nationaltrust.org.uk/visit/wiltshire/pepperbox-hill",
    heroImageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/ed/Eyre%27s_Folly%2C_Pepperbox_Hill_03.JPG",
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
