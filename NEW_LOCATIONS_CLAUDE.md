# Adding New National Trust Locations

Step-by-step process for adding new properties to the TrustQuest database. Follow this exactly — do not guess or use search results for pricing or coordinates.

## 1. Identify Missing Locations

Compare existing locations against the Wikipedia list of NT properties:

```js
// Get existing names
const data = require('./src/lib/db/locations-full-data.json');
const existing = new Set(data.map(d => d.name.toLowerCase()));
```

Cross-reference with: https://en.wikipedia.org/wiki/List_of_National_Trust_properties_in_England

## 2. Get Coordinates — Google Geocoding API

**Never use coordinates from search results, Wikipedia, or the NT website.**

Use the Google Geocoding API with the `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` env var:

```bash
# Script: scrape-coords-google.mjs
source .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" node scrape-coords-google.mjs
```

Query format: `"Property Name National Trust, Town, County"`

API endpoint:
```
https://maps.googleapis.com/maps/api/geocode/json?address={query}&key={API_KEY}
```

Result: `data.results[0].geometry.location.lat` / `.lng`

## 3. Get Pricing — Playwright Browser Scraping

**Never guess pricing from search results.** Third-party sites show Gift Aid prices (~10% higher).

```bash
# Script: scrape-prices.mjs
node scrape-prices.mjs 'https://www.nationaltrust.org.uk/visit/{region}/{property-slug}'
```

The script:
1. Opens the NT page in headless Chromium
2. Waits for JavaScript to render
3. Expands the "Prices" accordion
4. Extracts all £ amounts and ticket types
5. Saves screenshot to `/tmp/nt-prices.png`

### Reading the output
- Use the **"Without Gift Aid"** column — that's the standard price
- Look for categories: "Standard", "House and Garden", "Garden only", "Grounds only"
- Tiers: Adult (18+), Child (5-17), Family (2 adults + 3 children)
- Free properties may have parking charges (e.g., Formby: free entry, £9 parking)
- If text extraction is unclear, read the screenshot at `/tmp/nt-prices.png`

### NT URL pattern
```
https://www.nationaltrust.org.uk/visit/{region}/{property-slug}
```
Find the region/slug by searching the NT website or checking Wikipedia links.

## 4. Get Hero Images — Wikipedia API

All existing locations use Wikimedia Commons URLs.

```
https://en.wikipedia.org/api/rest_v1/page/summary/{WIKI_ARTICLE_NAME}
```

Use `originalimage.source` for the full-resolution image URL.

```bash
# Script: scrape-images.mjs
node scrape-images.mjs
```

If the main article has no image, try:
- Alternative article names (e.g., `Formby_coast` instead of `Formby`)
- Direct Wikimedia Commons file URLs
- Wikimedia Commons search API

## 5. Prepare Location Data

Each location needs:

| Field | Source | Required |
|-------|--------|----------|
| `name` | NT website / Wikipedia | Yes |
| `slug` | Auto-generated from name | Yes |
| `category` | `house`, `garden`, `castle`, `countryside`, `coast`, `historic-site` | Yes |
| `region` | County name | Yes |
| `latitude` | Google Geocoding API | Yes |
| `longitude` | Google Geocoding API | Yes |
| `description` | NT website / Wikipedia (2-3 sentences) | Yes |
| `shortDescription` | 1 sentence summary | Yes |
| `websiteUrl` | NT website URL | Yes |
| `heroImageUrl` | Wikipedia/Wikimedia Commons | Preferred |
| `pricing` | Playwright scrape of NT website | If applicable |

### Category mapping
```
House & Garden → house
Garden → garden
Castle → castle
Countryside → countryside
Coast → coast
Historic Site → historic-site
```

## 6. Insert into Database

Use the pattern in `src/lib/db/add-locations.ts`:

```bash
source .env.local
DATABASE_URL="$DATABASE_URL" npx tsx src/lib/db/add-locations.ts
```

The script checks for duplicates by slug before inserting.

## 7. Verify

After inserting, check each location page:
```
http://localhost:3000/locations/{slug}
```

Verify:
- [ ] Name and description correct
- [ ] Map pin in the right location
- [ ] Pricing matches the NT website (use "Without Gift Aid" column)
- [ ] Hero image loads and looks appropriate
- [ ] Category/region correct

## 8. Update This Document

After successfully adding locations, remove them from the "Missing NT Locations" list at the bottom of this file. Also update the total counts in the list header and footer to reflect the new numbers. This keeps the list accurate for future batches.

## Helper Scripts

| Script | Purpose |
|--------|---------|
| `scrape-prices.mjs` | Playwright: scrape pricing from NT website |
| `scrape-coords-google.mjs` | Google Geocoding API: get accurate coordinates |
| `scrape-images.mjs` | Wikipedia API: get hero images |
| `src/lib/db/add-locations.ts` | Insert new locations + pricing into database |
| `src/lib/db/fix-pricing.ts` | Fix/update pricing for existing locations |
| `src/lib/db/fix-coords.ts` | Fix/update coordinates for existing locations |
| `src/lib/db/fix-images.ts` | Fix/update hero images for existing locations |

## Common Mistakes to Avoid

- **Gift Aid prices**: Always use "Without Gift Aid" — Gift Aid adds ~10%
- **Search result coordinates**: Often approximate; always use Google Geocoding API
- **NT website coordinates**: Also inaccurate; Google API matches what users see on the map
- **Missing parking prices**: Free-entry properties often charge for parking
- **Seasonal pricing**: Some properties have different prices in winter vs summer

---

## Missing NT Locations (Not Yet in Database)

As of April 2026, TrustQuest has **430 locations**. The following **131 properties** from the Wikipedia lists of NT properties are not yet in the database. URLs follow the standard NT pattern but should be verified before scraping.

### ENGLAND

#### Bedfordshire
All Bedfordshire properties added. ✓

#### Berkshire / Oxfordshire
- **Cock Marsh** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/cock-marsh) — countryside
- **Lardon Chase, the Holies and Lough Down** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/lardon-chase-the-holies-and-lough-down) — countryside
- ~~**Great Coxwell Barn**~~ — Added ✓
- **Lock Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/lock-cottage) — historic-site — ⚠️ 404
- **Priory Cottages** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/priory-cottages) — historic-site — ⚠️ 404

#### Bristol
- **Westbury College Gatehouse** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/westbury-college-gatehouse) — historic-site — ⚠️ 404

#### Buckinghamshire
- ~~**Boarstall Duck Decoy**~~ — Added ✓
- ~~**Boarstall Tower**~~ — Added ✓
- **Bradenham Village** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/bradenham-village) — countryside — ⚠️ 404
- ~~**Buckingham Chantry Chapel**~~ — Added ✓
- ~~**Dorneywood Garden**~~ — Added ✓
- **Hartwell House** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/hartwell-house) — house — ⚠️ 404
- **King's Head Inn, Aylesbury** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/kings-head-aylesbury) — historic-site — ⚠️ 404
- ~~**Long Crendon Courthouse**~~ — Added ✓
- ~~**Pitstone Windmill**~~ — Added ✓
- **Princes Risborough Manor House** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/princes-risborough-manor-house) — house — ⚠️ 404
- **West Wycombe Village** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/west-wycombe-village) — historic-site — ⚠️ 404

#### Cambridgeshire
- ~~**Ramsey Abbey Gatehouse**~~ — Added ✓

#### Cheshire
- **Helsby Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/cheshire-greater-manchester/helsby-hill) — countryside — ⚠️ 404

#### Cornwall
- ~~**Cadsonbury**~~ — Added ✓
- **Cornish Mines & Engines** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/cornish-mines-and-engines) — historic-site — ⚠️ 404
- **Hawker's Hut** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/hawkers-hut) — historic-site — ⚠️ 404
- ~~**Lawrence House**~~ — Added ✓

#### Cumbria / Lake District
- **Bowder Stone** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/bowder-stone) — countryside
- **Cartmel Priory Gatehouse** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/cartmel-priory-gatehouse) — historic-site
- **Cross Keys Inn, Sedbergh** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/cross-keys-inn) — historic-site
- **Old Dungeon Ghyll** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/old-dungeon-ghyll) — historic-site

#### Derbyshire / Peak District
- ~~**Duffield Castle**~~ — Added ✓
- **High Peak Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/high-peak-estate) — countryside — ⚠️ 404
- ~~**The Old Manor**~~ — Added ✓
- **White Peak Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/white-peak-estate) — countryside — ⚠️ 404
- ~~**Winster Market House**~~ — Added ✓

#### Devon
- ~~**Bolberry Down** (Salcombe Countryside)~~ — Added ✓
- ~~**Branscombe**~~ — Added ✓
- **The Church House** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/the-church-house) — historic-site — ⚠️ 404
- ~~**Loughwood Meeting House**~~ — Added ✓
- **Morte Point** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/morte-point) — coast — ⚠️ 404
- **The Old Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/the-old-mill) — historic-site
- ~~**Plymbridge Woods**~~ — Added ✓
- **Watersmeet** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/watersmeet) — countryside

#### Dorset
- **Portland House** — [NT Website](https://www.nationaltrust.org.uk/visit/dorset/portland) — historic-site

#### Essex
- **Northey Island** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/northey-island) — coast
- **Ray Island** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ray-island) — coast
- **Rayleigh Mount** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/rayleigh-mount) — historic-site

#### Gloucestershire & Cotswolds
- **Bibury** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/bibury) — countryside
- **Hailes Abbey** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/hailes-abbey) — historic-site
- **Little Fleece Bookshop** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/little-fleece-bookshop) — historic-site
- **May Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/may-hill) — countryside
- **Minchinhampton Common** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/minchinhampton-and-rodborough-commons) — countryside

#### Hampshire
- **Ludshott Common & Waggoners Wells** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/ludshott-common-and-waggoners-wells) — countryside
- **Selborne Common** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/selborne-common) — countryside
- **Stockbridge Down** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/stockbridge-down) — countryside
- **Stockbridge Marsh** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/stockbridge-marsh) — countryside

#### Herefordshire
- **Cwmmau Farmhouse** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/cwmmau-farmhouse) — historic-site

#### Isle of Wight
- **Brighstone Shop** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/brighstone-shop-and-museum) — historic-site
- **Borthwood Copse** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/borthwood-copse) — countryside
- **Chillerton Down** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/chillerton-down) — countryside
- **The Needles** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/the-needles-headland-and-tennyson-down) — coast
- **Newtown Old Town Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/newtown-old-town-hall) — historic-site
- **St Catherine's Oratory** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/st-catherines-oratory) — historic-site
- **Rosetta Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/rosetta-cottage) — historic-site

#### Kent
- **Cobham Wood & Mausoleum** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/cobham-wood-and-mausoleum) — countryside
- **Oldbury Camp** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/oldbury-hill) — countryside
- **One Tree Hill & Bitchet Common** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/one-tree-hill) — countryside
- **Sprivers Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/sprivers-garden) — garden
- **St John's Jerusalem** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/st-johns-jerusalem) — garden

#### Leicestershire
- **Ulverscroft Nature Reserve** — [NT Website](https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/ulverscroft) — countryside

#### Lincolnshire
- **Sandilands** — [NT Website](https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/sandilands) — coast

#### London
- **East Sheen Common** — [NT Website](https://www.nationaltrust.org.uk/visit/london/east-sheen-common) — countryside
- **Lindsey House** — [NT Website](https://www.nationaltrust.org.uk/visit/london/lindsey-house) — house
- **Petts Wood & Hawkwood** — [NT Website](https://www.nationaltrust.org.uk/visit/london/petts-wood-and-hawkwood) — countryside
- **Roman Baths, Strand Lane** — [NT Website](https://www.nationaltrust.org.uk/visit/london/roman-bath) — historic-site
- **Selsdon Wood** — [NT Website](https://www.nationaltrust.org.uk/visit/london/selsdon-wood) — countryside
- **Watermeads** — [NT Website](https://www.nationaltrust.org.uk/visit/london/watermeads) — countryside

#### Merseyside
- **59 Rodney Street** — [NT Website](https://www.nationaltrust.org.uk/visit/liverpool-lancashire/59-rodney-street) — house

#### Norfolk
- **Darrow Wood** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/darrow-wood) — countryside
- **Elizabethan House Museum** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/elizabethan-house-museum) — house
- **St George's Guildhall** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/st-georges-guildhall) — historic-site

#### Northamptonshire
- **Priest's House** — [NT Website](https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/priests-house-easton-on-the-hill) — historic-site

#### Northumberland
- **Northumberland Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/northumberland-coast) — coast
- **Ros Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/ros-castle) — countryside
- **St Cuthbert's Cave** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/st-cuthberts-cave) — historic-site

#### Nottinghamshire
- **Monksthorpe Chapel** — [NT Website](https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/monksthorpe-chapel) — historic-site

#### Shropshire
- **Morville Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/morville-hall) — house
- **Town Walls Tower** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/town-walls-tower) — historic-site

#### Somerset
- **Brean Down** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/brean-down) — coast
- **Brean Down Fort** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/brean-down-fort) — historic-site
- **Burrow Mump** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/burrow-mump) — historic-site
- **Cadbury Camp** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/cadbury-camp) — historic-site
- **Crook Peak to Shute Shelve Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/crook-peak-and-shute-shelve-hill) — countryside
- **Dolebury Warren** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/dolebury-warren) — countryside
- **Dunster Working Watermill** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/dunster-working-watermill) — historic-site
- **Ebbor Gorge** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/ebbor-gorge) — countryside
- **King John's Hunting Lodge** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/king-johns-hunting-lodge) — historic-site
- **Leigh Woods** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/leigh-woods) — countryside
- **The Priest's House, Muchelney** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/priests-house-muchelney) — historic-site
- **Sand Point** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/sand-point-and-middle-hope) — coast
- **Solsbury Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/little-solsbury-hill) — countryside
- **Stembridge Tower Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/stembridge-tower-mill) — historic-site
- **Stoke sub Hamdon Priory** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/stoke-sub-hamdon-priory) — historic-site
- **Walton & Ivythorn Hills** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/walton-hill-and-ivythorn-hill) — countryside
- **Wellington Monument** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/wellington-monument) — historic-site
- **West Pennard Court Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/west-pennard-court-barn) — historic-site
- **Yarn Market, Dunster** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/yarn-market-dunster) — historic-site

#### Staffordshire
- **Downs Banks** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/downs-banks) — countryside
- **Letocetum** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/letocetum-wall-roman-site) — historic-site
- **South Peak Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/south-peak-estate) — countryside

#### Suffolk
- **Angel Corner** — [NT Website](https://www.nationaltrust.org.uk/visit/suffolk/angel-corner) — house
- **Theatre Royal, Bury St Edmunds** — [NT Website](https://www.nationaltrust.org.uk/visit/suffolk/theatre-royal-bury-st-edmunds) — historic-site
- **Thorington Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/suffolk/thorington-hall) — house

#### Surrey
- **Abinger Roughs & Netley Park** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/abinger-roughs-and-netley-park) — countryside
- **Bookham Commons** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/bookham-commons) — countryside
- **Clandon House** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/clandon-park) — house
- **The Homewood** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/the-homewood) — house
- **Hydon's Ball** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/hydons-ball) — countryside
- **Oakhurst Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/oakhurst-cottage) — house
- **Reigate Hill & Gatton Park** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/reigate-hill-and-gatton-park) — countryside
- **River Wey & Godalming Navigations** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/river-wey-and-godalming-navigations) — countryside
- **Witley Centre** — [NT Website](https://www.nationaltrust.org.uk/visit/surrey/witley-and-milford-commons) — countryside

#### Sussex
- **Harting Down** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/harting-down) — countryside
- **Lavington Common** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/lavington-common) — countryside
- **Litlington White Horse** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/litlington-white-horse) — historic-site
- **Swan Barn Farm** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/swan-barn-farm) — countryside
- **Wakehurst Place Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/wakehurst) — garden

#### Warwickshire
- **Kinwarton Dovecote** — [NT Website](https://www.nationaltrust.org.uk/visit/warwickshire/kinwarton-dovecote) — historic-site
- **Roundhouse, Birmingham** — [NT Website](https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/roundhouse-birmingham) — historic-site

#### Wiltshire
- **Calstone & Cherhill Downs** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/cherhill-down-and-oldbury-castle) — countryside
- **Cley Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/cley-hill) — countryside
- **Figsbury Ring** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/figsbury-ring) — historic-site
- **Heelis** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/heelis) — historic-site
- **Fox Talbot Museum** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/lacock-abbey-fox-talbot-museum-and-village) — historic-site
- **Little Clarendon** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/little-clarendon) — house
- **Pepperbox Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/pepperbox-hill) — countryside
- **Philipps House & Dinton Park** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/philipps-house-and-dinton-park) — house
- **Piggledene** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/piggledene) — countryside
- **The Coombes** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/the-coombes) — countryside
- **White Barrow** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/white-barrow) — historic-site

#### Worcestershire
- **The Firs (Elgar Birthplace Museum)** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/the-firs-elgars-birthplace-museum) — house
- **Knowles Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/knowles-mill) — historic-site
- **Middle Littleton Tythe Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/middle-littleton-tithe-barn) — historic-site
- **Rosedene (Chartist cottage)** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/rosedene) — house
- **Wichenford Dovecote** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/wichenford-dovecote) — historic-site

#### Yorkshire (East / Humberside)
- **Maister House** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/maister-house) — house

#### Yorkshire (North)
- **Braithwaite Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/braithwaite-hall) — house
- **Bridestones, Crosscliff & Blakey Topping** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/bridestones-crosscliff-and-blakey-topping) — countryside
- **Middlethorpe Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/middlethorpe-hall) — house
- **Moulton Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/moulton-hall) — house
- **Yorkshire Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/yorkshire-coast) — coast

---

### WALES

All Wales properties with valid NT website pages are now in the database. ✓

The following 6 properties from the original list were excluded — they have no dedicated NT visit page:
- **Swtan** — No dedicated page (cottage near Church Bay, Anglesey)
- **Aberdeunant** — No dedicated page (farmstead near Talley, Carmarthenshire)
- **Paxton's Tower** — No dedicated page (only a history subpage exists)
- **Bodysgallen Hall** — No dedicated page (NT-operated hotel, not a visit property)
- **Hafod y Llan** — Sub-area of Craflwyn & Beddgelert (already in database)
- **Segontium** — Not an NT property (managed by Cadw)

---

### NORTHERN IRELAND

All 24 Northern Ireland properties are already in the database. ✓

---

**Total missing: ~131 properties** (131 England, 0 Wales, 0 Northern Ireland)

> **Note:** NT website URLs above follow the standard pattern but should be verified before scraping — some may use different region slugs or combined pages. Many URLs in the original list were incorrect (14 of 34 Wales URLs were 404s). Always verify with WebFetch before scraping.
