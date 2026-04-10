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
    latitude: "51.6510741",
    longitude: "-0.7562675",
    description: "Hughenden Manor was the country home of Victorian Prime Minister Benjamin Disraeli for over 30 years until his death in 1881. The red-brick manor house contains his personal effects, furniture and political memorabilia, offering an intimate portrait of one of Britain's most colourful leaders. The surrounding parkland and formal gardens were redesigned by Disraeli's wife Mary Anne, while the estate played a secret role in World War II as a base for producing target maps for RAF Bomber Command.",
    shortDescription: "Victorian Prime Minister Disraeli's country home with political memorabilia and WWII secret history.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/hughenden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/en/e/e6/Hughenden2010.JPG",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "45.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Ashridge Estate",
    slug: slugify("Ashridge Estate"),
    category: "countryside",
    region: "Hertfordshire",
    latitude: "51.8075565",
    longitude: "-0.5935363",
    description: "Ashridge Estate is a 5,000-acre stretch of the Chiltern Hills encompassing ancient woodland, chalk downland and commons. The estate is home to over 80 species of wild flower and supports fallow and muntjac deer. The Bridgewater Monument, a 108-foot Doric column built in 1832, offers panoramic views across the estate. Ashridge has been managed by the National Trust since 1926 and provides a vital green corridor between the Chilterns and the Hertfordshire countryside.",
    shortDescription: "5,000-acre Chiltern Hills estate with ancient woodland, chalk downland and the Bridgewater Monument.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ashridge-estate",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/76/GOC_Berkhamsted_%26_Frithsden_031_Ashridge_House%2C_Little_Gaddesden_%2828454689336%29.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "3.00", memberPrice: null, label: "Car parking - Adult" },
      { pricingType: "parking", pricingCategory: "standard", tier: "child", nonMemberPrice: "1.50", memberPrice: null, label: "Car parking - Child" },
    ],
  },
  {
    name: "Ascott House",
    slug: slugify("Ascott House"),
    category: "house",
    region: "Buckinghamshire",
    latitude: "51.8956025",
    longitude: "-0.7058003",
    description: "Ascott House is a half-timbered manor house near Wing in Buckinghamshire, home to the de Rothschild family since 1874. The house contains an exceptional collection of fine paintings, Chinese ceramics and English and French furniture amassed over five generations. The 30-acre garden is celebrated for its topiary sundial, naturalised bulbs in spring, and a stunning collection of specimen trees and shrubs set against views across the Vale of Aylesbury.",
    shortDescription: "Rothschild manor house near Wing with Old Master paintings, Chinese ceramics and a famous topiary sundial.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/ascott-estate",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ef/At_Ascott_House_2024_17.jpg",
    pricing: [],
  },
  {
    name: "St Michael's Mount",
    slug: slugify("St Michael's Mount"),
    category: "castle",
    region: "Cornwall",
    latitude: "50.1165068",
    longitude: "-5.4780804",
    description: "St Michael's Mount is a dramatic tidal island rising from Mount's Bay near Marazion, crowned by a medieval castle and church. Connected to the mainland by a granite causeway passable at low tide, the island has been a pilgrimage site, a fortress and a private home over its thousand-year history. The subtropical terraced gardens, clinging to the rocky slopes, contain plants from around the world that thrive in the mild Cornish climate. The National Trust manages the gardens and island, while the castle remains the home of the St Aubyn family.",
    shortDescription: "Iconic tidal island with medieval castle, subtropical gardens and a causeway accessible at low tide.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/st-michaels-mount",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/af/St_Michael%27s_Mount_View.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "3.20", memberPrice: null, label: "Car parking" },
    ],
  },
  {
    name: "Compton Castle",
    slug: slugify("Compton Castle"),
    category: "castle",
    region: "Devon",
    latitude: "50.4725074",
    longitude: "-3.6002897",
    description: "Compton Castle is a fortified manor house near Paignton, home to the Gilbert family for most of the past 600 years. Sir Humphrey Gilbert, half-brother of Sir Walter Raleigh, sailed from here in 1583 to claim Newfoundland for Queen Elizabeth I. The castle features a rare intact medieval great hall, a chapel, rose garden and a dramatic curtain wall with towers built to defend against French raids. Restored in the 20th century by Commander Walter Raleigh Gilbert, the castle was given to the National Trust in 1951.",
    shortDescription: "Fortified medieval manor near Paignton, home of the Gilbert family and birthplace of Sir Humphrey Gilbert.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/compton-castle",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Compton_Castle_in_Devon_enh.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Tintagel Old Post Office",
    slug: slugify("Tintagel Old Post Office"),
    category: "historic-site",
    region: "Cornwall",
    latitude: "50.6633300",
    longitude: "-4.7516420",
    description: "Tintagel Old Post Office is a remarkably well-preserved 14th-century stone longhouse in the heart of Tintagel village. One of the oldest domestic buildings in Cornwall, its dramatically undulating slate roof has become an iconic image of the village. The building served as a receiving office for mail in the Victorian era and has been furnished to recreate that period, with one room set up as a parlour and another as the postal office complete with original letter rack and stamps.",
    shortDescription: "14th-century stone longhouse in Tintagel with a famously wavy roof, once a Victorian post office.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cornwall/tintagel-old-post-office",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/Tintagel_Old_Post_Office.JPG",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "8.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "20.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Finch Foundry",
    slug: slugify("Finch Foundry"),
    category: "historic-site",
    region: "Devon",
    latitude: "50.7304195",
    longitude: "-3.9258703",
    description: "Finch Foundry is the last working water-powered forge in England, located in the village of Sticklepath on the northern edge of Dartmoor. Built in 1814, the foundry used three waterwheels to power massive trip hammers and a grinding stone to produce agricultural hand tools — sickles, scythes, and shovels — for farms across the South West. The original machinery still operates during demonstrations, offering a vivid glimpse of the industrial heritage that once powered rural England.",
    shortDescription: "Last working water-powered forge in England with original 19th-century machinery on the edge of Dartmoor.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/devon/finch-foundry",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Finch_Foundary_Water_Wheel%2C_Devon%2C_UK_-_Diliff.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "11.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "5.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "27.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Snowshill Manor",
    slug: slugify("Snowshill Manor"),
    category: "house",
    region: "Gloucestershire",
    latitude: "52.0055989",
    longitude: "-1.8628864",
    description: "Snowshill Manor is a Cotswold manor house containing the extraordinary collection of Charles Paget Wade, an architect, artist-craftsman and compulsive collector. From 1919 Wade filled the manor's 22 rooms with over 22,000 objects — samurai armour, musical instruments, bicycles, clocks, toys and tools — creating a cabinet of curiosities unlike any other. Wade himself lived in a small cottage in the garden, leaving every room of the manor for his treasures. The terraced Arts and Crafts garden, designed by Wade, descends through a series of outdoor rooms.",
    shortDescription: "Cotswold manor filled with 22,000 extraordinary objects and an Arts and Crafts terraced garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/snowshill-manor-and-garden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Snowshill_Manor_exterior.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "family", nonMemberPrice: "45.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Westbury Court Garden",
    slug: slugify("Westbury Court Garden"),
    category: "garden",
    region: "Gloucestershire",
    latitude: "51.8222386",
    longitude: "-2.4109609",
    description: "Westbury Court Garden is a rare surviving example of a late 17th-century Dutch water garden, one of the finest of its kind in England. Originally laid out between 1696 and 1705, the garden features long formal canals flanked by clipped hedges, a tall pavilion and a restored summer house. After falling into neglect, the National Trust restored the garden using the original account books of its creator, Maynard Colchester. The walled garden contains varieties of fruit, vegetables and flowers known to have been grown in English gardens before 1700.",
    shortDescription: "Rare late 17th-century Dutch water garden with formal canals, clipped hedges and a period walled garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/westbury-court-garden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/49/Canal%2C_Westbury_Court_Garden_-_geograph.org.uk_-_1416966.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "11.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "5.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "family", nonMemberPrice: "27.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Smallhythe Place",
    slug: slugify("Smallhythe Place"),
    category: "house",
    region: "Kent",
    latitude: "51.0381296",
    longitude: "0.6993867",
    description: "Smallhythe Place is a charming early 16th-century half-timbered house near Tenterden that was the home of the great Victorian actress Ellen Terry from 1899 until her death in 1928. The house is preserved as a shrine to her career, containing her theatrical costumes, personal possessions and a remarkable collection of memorabilia from the golden age of the Victorian and Edwardian stage. The cottage garden and orchard surround a small barn theatre where performances are still held each summer.",
    shortDescription: "Ellen Terry's half-timbered home near Tenterden, filled with Victorian theatrical costumes and memorabilia.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/kent/smallhythe-place",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a4/The_facade%2C_Smallhythe_Place.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Houghton Mill",
    slug: slugify("Houghton Mill"),
    category: "historic-site",
    region: "Cambridgeshire",
    latitude: "52.3308955",
    longitude: "-0.1206316",
    description: "Houghton Mill is the last remaining working watermill on the Great Ouse, set on an island in the river near St Ives in Cambridgeshire. The present mill dates from the 17th century, though milling has taken place on this site since the 10th century as recorded in the Domesday Book. On milling days, visitors can watch the traditional millstones grinding organic wheat into flour, which is sold in the mill shop. The surrounding Waterclose Meadows provide tranquil riverside walks and picnic spots.",
    shortDescription: "Last working watermill on the Great Ouse, grinding flour since the 10th century on a Cambridgeshire river island.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/cambridgeshire/houghton-mill-and-waterclose-meadows",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Cmglee_Houghton_Mill.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "8.50", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.25", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "21.25", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Quebec House",
    slug: slugify("Quebec House"),
    category: "house",
    region: "Kent",
    latitude: "51.2671839",
    longitude: "0.0759984",
    description: "Quebec House is a red-brick Tudor house in the centre of Westerham, Kent, the childhood home of General James Wolfe, who famously captured Quebec from the French in 1759 and established British rule in Canada. The house contains family portraits, prints and memorabilia relating to the Battle of Quebec, along with period furnishings that evoke 18th-century domestic life. The garden includes an exhibition about the battle and the wider Seven Years' War.",
    shortDescription: "Tudor childhood home of General Wolfe in Westerham, with memorabilia from the capture of Quebec in 1759.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/kent/quebec-house",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/40/Quebec_House%2C_Quebec_Square%2C_Westerham%2C_Kent_-_geograph.org.uk_-_1296826.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "22.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Formby",
    slug: slugify("Formby"),
    category: "coast",
    region: "Merseyside",
    latitude: "53.5638578",
    longitude: "-3.1002607",
    description: "Formby is a stretch of wild dune coast on the Sefton shore between Liverpool and Southport, one of the finest dune systems in England. The pine woodlands behind the beach are home to one of the country's few remaining colonies of native red squirrels, while the beach itself reveals ancient footprints preserved in the mud — 5,000-year-old tracks of humans, deer and aurochs dating to the Mesolithic period. The asparagus fields behind the dunes continue a centuries-old tradition of growing the crop in Formby's sandy soil.",
    shortDescription: "Wild Sefton dune coast with red squirrel woodland, ancient footprints and miles of sandy beach.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/liverpool-lancashire/formby",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/4/41/Formby_Beach_sand_dunes_-_geograph.org.uk_-_7042888.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.00", memberPrice: null, label: "Car parking" },
    ],
  },
  {
    name: "Horsey Windpump",
    slug: slugify("Horsey Windpump"),
    category: "historic-site",
    region: "Norfolk",
    latitude: "52.7410882",
    longitude: "1.6390133",
    description: "Horsey Windpump is a restored drainage windpump on the edge of Horsey Mere in the Norfolk Broads, built in 1912 to drain the surrounding marshes for farming. The four-storey windpump has been restored to working condition and visitors can climb to the top for panoramic views across Horsey Mere and the Broads landscape. The surrounding estate is one of the best places in England to see grey seals, with hundreds hauling out on Horsey beach each winter to pup, making it one of the largest mainland seal colonies in the country.",
    shortDescription: "Restored Norfolk Broads windpump with panoramic views and one of England's largest grey seal colonies.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/norfolk/horsey-windpump",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Horsey_Windpump_01.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "8.50", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.25", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "21.25", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Sutton Hoo",
    slug: slugify("Sutton Hoo"),
    category: "historic-site",
    region: "Suffolk",
    latitude: "52.0943714",
    longitude: "1.3409679",
    description: "Sutton Hoo is one of the most important archaeological sites in Britain, where in 1939 an Anglo-Saxon ship burial was discovered containing a spectacular treasure hoard belonging to an East Anglian king. The exhibition hall displays a full-size reconstruction of the burial chamber and replicas of the helmet, sword and gold fittings found in the grave. Walking trails lead through the ancient burial mounds overlooking the River Deben, and the Tranmer House tells the story of Edith Pretty, the landowner who commissioned the excavation that changed our understanding of the so-called Dark Ages.",
    shortDescription: "Anglo-Saxon ship burial site with treasure exhibition, royal burial mounds and views over the River Deben.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/suffolk/sutton-hoo",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/88/Sutton_Hoo_burial_site.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "18.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "9.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "45.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Barrington Court",
    slug: slugify("Barrington Court"),
    category: "house",
    region: "Somerset",
    latitude: "50.9607907",
    longitude: "-2.8584461",
    description: "Barrington Court is a Tudor manor house near Ilminster, one of the first properties acquired by the National Trust in 1907. The house was rescued from near-dereliction by Colonel Arthur Lyle of the Tate & Lyle sugar dynasty, who restored it in the 1920s and filled the adjacent Strode House with his collection of decorative arts. The garden, laid out by Gertrude Jekyll, is one of her finest surviving designs — a series of interconnected garden rooms including a white garden, rose and iris garden, and a productive kitchen garden that still supplies the estate restaurant.",
    shortDescription: "Tudor manor with Gertrude Jekyll gardens and a restored Strode House near Ilminster in Somerset.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/somerset/barrington-court",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/5/55/Barrington_Court%2C_South_facade.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Coleridge Cottage",
    slug: slugify("Coleridge Cottage"),
    category: "house",
    region: "Somerset",
    latitude: "51.1522680",
    longitude: "-3.1578890",
    description: "Coleridge Cottage in Nether Stowey is where the poet Samuel Taylor Coleridge lived with his family from 1797 to 1800 and wrote some of his greatest works, including The Rime of the Ancient Mariner and Kubla Khan. The modest cottage has been preserved with period furnishings and contains displays about Coleridge's life and the extraordinary literary circle that gathered in the Quantock Hills, including William and Dorothy Wordsworth who moved to nearby Alfoxden to be close to their friend.",
    shortDescription: "Somerset cottage where Coleridge wrote The Rime of the Ancient Mariner and Kubla Khan in the 1790s.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/somerset/coleridge-cottage",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Coleridge_cottage.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.50", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.75", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "23.75", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Ilam Park",
    slug: slugify("Ilam Park"),
    category: "countryside",
    region: "Derbyshire",
    latitude: "53.1223220",
    longitude: "-1.5136821",
    description: "Ilam Park is a beautiful parkland estate in the Manifold Valley on the southern edge of the Peak District, forming the gateway to the dramatic limestone dale of Dovedale. The park surrounds Ilam Hall, a Gothic Revival mansion partly demolished in the 1930s but now serving as a youth hostel. The grounds feature the 'Paradise Walk' along the River Manifold, which famously disappears underground before re-emerging at 'boil holes' in the park. Dovedale itself, with its famous stepping stones and towering limestone pinnacles, is one of the Peak District's most celebrated landscapes.",
    shortDescription: "Peak District parkland at the gateway to Dovedale, with riverside walks and the famous stepping stones.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/ilam-park-dovedale-and-the-white-peak",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Ilam_Hall_In_Dovedale_-_geograph.org.uk_-_1282705.jpg",
    pricing: [
      { pricingType: "parking", pricingCategory: "standard", tier: "adult", nonMemberPrice: "6.00", memberPrice: null, label: "Car park (up to 4 hours)" },
    ],
  },
  {
    name: "Stoneywell",
    slug: slugify("Stoneywell"),
    category: "house",
    region: "Leicestershire",
    latitude: "52.7014847",
    longitude: "-1.2646239",
    description: "Stoneywell is a remarkable Arts and Crafts cottage in Charnwood Forest, designed by the Leicester architect Ernest Gimson in 1899 for his brother Sydney. Built of local stone and slate, the cottage appears to grow organically from the rocky outcrop on which it sits, with rooms at different levels following the contours of the ground. The cottage remained in the Gimson family for over a century, its interior virtually unchanged, preserving an authentic example of Arts and Crafts domestic life. The surrounding woodland garden is rich with bluebells in spring.",
    shortDescription: "Arts and Crafts cottage in Charnwood Forest by Ernest Gimson, growing from the rocks in century-old woodland.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/stoneywell",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8d/Stoneywell%2C_Leicestershire.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Moseley Old Hall",
    slug: slugify("Moseley Old Hall"),
    category: "house",
    region: "Staffordshire",
    latitude: "52.6374425",
    longitude: "-2.1023395",
    description: "Moseley Old Hall is an Elizabethan farmhouse near Wolverhampton where King Charles II hid in a secret hole after his defeat at the Battle of Worcester in 1651, one of the most dramatic episodes of the English Civil War. The house still contains the bed in which the fugitive king slept and the priest hole where he concealed himself from Parliamentarian soldiers. The knot garden has been recreated in 17th-century style with box hedges, gravel paths and period plants that would have been familiar to the king during his desperate flight.",
    shortDescription: "Elizabethan farmhouse where Charles II hid after the Battle of Worcester, with Civil War history and a knot garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/moseley-old-hall",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/aa/Moseley_Old_Hall_2015_003.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Great Chalfield Manor",
    slug: slugify("Great Chalfield Manor"),
    category: "house",
    region: "Wiltshire",
    latitude: "51.3675991",
    longitude: "-2.2022462",
    description: "Great Chalfield Manor is a moated 15th-century manor house near Melksham, one of the finest examples of late medieval domestic architecture in England. The house was built around 1480 by Thomas Tropenell, a wealthy cloth merchant, and features an impressive great hall with an oriel window, a screens passage and a remarkable set of peeping masks through which the lord could observe his guests. The Arts and Crafts garden, created by Major Robert Fuller in the early 20th century, complements the medieval architecture with rose gardens, topiary and a gazebo overlooking the moat.",
    shortDescription: "Moated 15th-century manor near Melksham with medieval great hall, peeping masks and an Arts and Crafts garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/wiltshire/great-chalfield-manor-and-garden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1b/Great_Chalfield_Manor_north_elevation_-_geograph.org.uk_-_2512310.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "11.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "5.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "family", nonMemberPrice: "27.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "15.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "7.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "family", nonMemberPrice: "37.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "The Courts Garden",
    slug: slugify("The Courts Garden"),
    category: "garden",
    region: "Wiltshire",
    latitude: "51.3556034",
    longitude: "-2.2004642",
    description: "The Courts Garden in the village of Holt is an English country garden of great charm and variety, designed around a mid-18th-century house originally used as the village's court and cloth-weaving centre. The garden blends formal and naturalistic styles with herbaceous borders, topiary, a lily pond, an arboretum and a kitchen garden. Unusual plants thrive in sheltered corners, and the garden is particularly striking in summer when the borders reach their peak. The garden was developed from the 1920s by Major T.C.E. Goff and later Lady Cecilie Goff.",
    shortDescription: "Charming English country garden at Holt with herbaceous borders, topiary and a lily pond beside a Georgian house.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/wiltshire/the-courts-garden",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Courts_Garden_Temple_Borders.JPG",
    pricing: [
      { pricingType: "entry", pricingCategory: "garden-only", tier: "adult", nonMemberPrice: "14.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "child", nonMemberPrice: "7.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "garden-only", tier: "family", nonMemberPrice: "35.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Westwood Manor",
    slug: slugify("Westwood Manor"),
    category: "house",
    region: "Wiltshire",
    latitude: "51.3301157",
    longitude: "-2.2708915",
    description: "Westwood Manor is a small stone manor house near Bradford-on-Avon with origins in the 15th century, modified and extended over the following 200 years to create a fascinating patchwork of medieval, Tudor and Stuart architecture. The interior contains remarkable late Gothic and Jacobean plasterwork, stained glass and fine examples of 17th-century panelling. The manor was saved from dereliction by Edgar Lister in 1911, who filled it with his collection of keyboard instruments and period furnishings, creating a home that feels authentically lived in across the centuries.",
    shortDescription: "Stone manor near Bradford-on-Avon spanning five centuries of architecture, with fine plasterwork and stained glass.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/wiltshire/westwood-manor",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/Westwood_Manor_-_geograph.org.uk_-_86874.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "13.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "6.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "32.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Farnborough Hall",
    slug: slugify("Farnborough Hall"),
    category: "house",
    region: "Warwickshire",
    latitude: "52.1414124",
    longitude: "-1.3719010",
    description: "Farnborough Hall is an elegant honey-coloured stone house set on a hilltop in Warwickshire, home to the Holbech family for over 300 years. The interior features outstanding 18th-century rococo plasterwork ceilings and the Holbech family's collection of paintings and sculpture acquired on the Grand Tour. The real treasure is the remarkable half-mile terrace walk designed in the 1740s, adorned with temples, an obelisk and a dramatic oval pavilion — one of the finest landscape terraces in England, offering sweeping views across the Warwickshire countryside.",
    shortDescription: "Honey-stone Warwickshire hall with rococo interiors and a spectacular 18th-century terrace walk.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/warwickshire/farnborough-hall",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/71/Farnborough_Hall_North.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "9.50", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "4.75", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "23.75", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Dudmaston Hall",
    slug: slugify("Dudmaston Hall"),
    category: "house",
    region: "Shropshire",
    latitude: "52.4956703",
    longitude: "-2.3679104",
    description: "Dudmaston Hall is a late 17th-century house set in parkland above a large pool known as the Big Pool near Bridgnorth in Shropshire. The house contains an unusual collection that spans 300 years, from Dutch flower paintings and family portraits to a striking collection of modern art including works by Henry Moore, Barbara Hepworth and Ben Nicholson, collected by Sir George and Lady Rachel Labouchere in the 20th century. The extensive grounds include lakeside walks, a dingle with tree ferns and a productive orchard.",
    shortDescription: "17th-century Shropshire house with an eclectic mix of Old Masters and modern art beside a tranquil lake.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/dudmaston",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b7/Dudmaston_Hall_-_geograph.org.uk_-_1057709.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "16.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "8.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "40.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Wilderhope Manor",
    slug: slugify("Wilderhope Manor"),
    category: "house",
    region: "Shropshire",
    latitude: "52.5319188",
    longitude: "-2.6717417",
    description: "Wilderhope Manor is a fine Elizabethan manor house perched on the edge of Wenlock Edge in the Shropshire Hills, built in 1585 by Francis Smallman. The house retains its original plaster ceilings with elaborate decorative motifs and a handsome oak spiral staircase. During the Civil War, Major Thomas Smallman famously escaped Parliamentarian captors by leaping his horse from the limestone cliff behind the house — a spot still known as the Major's Leap. Now a YHA youth hostel, the manor is open for guided tours on certain days.",
    shortDescription: "Elizabethan manor on Wenlock Edge with original plaster ceilings and a famous Civil War escape story.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/wilderhope-manor",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/85/Wilderhope_Manor_and_Youth_Hostel_-_geograph.org.uk_-_687216.jpg",
    pricing: [],
  },
  {
    name: "Sunnycroft",
    slug: slugify("Sunnycroft"),
    category: "house",
    region: "Shropshire",
    latitude: "52.6954459",
    longitude: "-2.5161598",
    description: "Sunnycroft is a rare surviving example of a suburban Victorian villa in Wellington, Shropshire, the kind of genteel family home that once lined the streets of every English market town but has largely been swept away by development. The house and its contents were left virtually unchanged by the last owner, Joan Lander, who bequeathed it to the National Trust in 1997. The interiors are filled with original furniture, family photographs and everyday objects, creating an extraordinarily evocative time capsule of middle-class domestic life from the Edwardian era to the 1990s.",
    shortDescription: "Rare Victorian suburban villa in Wellington, a time capsule of domestic life from the 1880s to the 1990s.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/sunnycroft",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Sunnycroft_Facing_Garden.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "10.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "5.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "25.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Treasurer's House",
    slug: slugify("Treasurer's House"),
    category: "house",
    region: "Yorkshire",
    latitude: "53.9629956",
    longitude: "-1.0807761",
    description: "Treasurer's House in York stands in the shadow of York Minster on a site occupied since Roman times. Named after the medieval Treasurers of York Minster who lived here, the present house dates mainly from the 17th and 18th centuries but incorporates medieval fabric. It was lavishly restored by the industrialist Frank Green between 1897 and 1930 and filled with his outstanding collection of furniture, ceramics and paintings spanning three centuries. The house is also famous for the 1953 account of a plumber's apprentice who claimed to have seen a column of Roman soldiers marching through the cellar.",
    shortDescription: "Historic York house beside the Minster with period interiors and a famous Roman ghost story.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/yorkshire/treasurers-house-york",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a2/Treasurer%E2%80%99s_House_2023.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "adult", nonMemberPrice: "12.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "child", nonMemberPrice: "6.00", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "house-and-garden", tier: "family", nonMemberPrice: "30.00", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "Ormesby Hall",
    slug: slugify("Ormesby Hall"),
    category: "house",
    region: "North Yorkshire",
    latitude: "54.5432401",
    longitude: "-1.1830097",
    description: "Ormesby Hall is a mid-18th-century Palladian mansion on the outskirts of Middlesbrough, a surprising oasis of Georgian elegance surrounded by modern suburbs. The house was built for the Pennyman family and features a fine entrance hall with intricate plasterwork attributed to the Italian stuccodore Cortese, and a striking Victorian laundry and stable block designed by the celebrated architect Detmar Blow. The walled garden has been restored with herbaceous borders and a cutting garden, while the wider estate includes woodland walks and a model railway.",
    shortDescription: "Georgian Palladian mansion near Middlesbrough with fine plasterwork, a Victorian stable block and walled garden.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/north-east/ormesby-hall",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/94/Ormesby_Hall_%28geograph_7778382%29.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "7.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "3.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "17.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
  },
  {
    name: "The Workhouse, Southwell",
    slug: slugify("The Workhouse, Southwell"),
    category: "historic-site",
    region: "Nottinghamshire",
    latitude: "53.0810628",
    longitude: "-0.9392270",
    description: "The Workhouse in Southwell is the best-preserved workhouse in England, built in 1824 to the design of the Reverend John T. Becher as a model for the national system established by the Poor Law Amendment Act of 1834. The building's austere rooms, exercise yards and segregated quarters for men, women and children tell the harsh story of poverty and welfare in 19th-century England. The adjacent infirmary, restored by the National Trust, reveals how the workhouse also served as a rudimentary hospital. The Workhouse offers a powerful and sobering insight into social history that shaped the modern welfare state.",
    shortDescription: "Best-preserved workhouse in England, telling the story of 19th-century poverty and the origins of welfare.",
    websiteUrl: "https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/the-workhouse-southwell",
    heroImageUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/The_Workhouse%2C_Southwell_-_geograph.org.uk_-_4723390.jpg",
    pricing: [
      { pricingType: "entry", pricingCategory: "standard", tier: "adult", nonMemberPrice: "15.00", memberPrice: null, label: "Adult (18+)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "child", nonMemberPrice: "7.50", memberPrice: null, label: "Child (5-17)" },
      { pricingType: "entry", pricingCategory: "standard", tier: "family", nonMemberPrice: "37.50", memberPrice: null, label: "Family (2 adults + 3 children)" },
    ],
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
        heroImageUrl: loc.heroImageUrl,
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
