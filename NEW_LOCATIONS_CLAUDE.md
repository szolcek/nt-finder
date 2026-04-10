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

As of April 2026, TrustQuest has **293 locations**. The following **277 properties** from the Wikipedia lists of NT properties are not yet in the database. URLs follow the standard NT pattern but should be verified before scraping.

### ENGLAND

#### Bedfordshire
- **Dunstable Downs** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/dunstable-downs-and-whipsnade-estate) — countryside
- **Sharpenhoe** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/sharpenhoe) — countryside
- **Whipsnade Tree Cathedral** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/whipsnade-tree-cathedral) — historic-site
- **Willington Dovecote and Stables** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/willington-dovecote-and-stables) — historic-site

#### Berkshire / Oxfordshire
- **Ashdown House** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/ashdown-house) — house
- **Cock Marsh** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/cock-marsh) — countryside
- **Lardon Chase, the Holies and Lough Down** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/lardon-chase-the-holies-and-lough-down) — countryside
- **Buscot Park** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/buscot-park) — house
- **Great Coxwell Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/great-coxwell-barn) — historic-site
- **Lock Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/lock-cottage) — historic-site
- **Priory Cottages** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/priory-cottages) — historic-site
- **Uffington White Horse** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/white-horse-hill) — historic-site

#### Bristol
- **Blaise Hamlet** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/blaise-hamlet) — historic-site
- **Westbury College Gatehouse** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/westbury-college-gatehouse) — historic-site

#### Buckinghamshire
- **Boarstall Duck Decoy** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/boarstall-duck-decoy) — countryside
- **Boarstall Tower** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/boarstall-tower) — historic-site
- **Bradenham Village** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/bradenham-village) — countryside
- **Buckingham Chantry Chapel** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/buckingham-chantry-chapel) — historic-site
- **Coombe Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/coombe-hill) — countryside
- **Dorneywood Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/dorneywood-garden) — garden
- **Hartwell House** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/hartwell-house) — house
- **King's Head Inn, Aylesbury** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/kings-head-aylesbury) — historic-site
- **Long Crendon Courthouse** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/long-crendon-courthouse) — historic-site
- **Pitstone Windmill** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/pitstone-windmill) — historic-site
- **Princes Risborough Manor House** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/princes-risborough-manor-house) — house
- **West Wycombe Village** — [NT Website](https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/west-wycombe-village) — historic-site

#### Cambridgeshire
- **Ramsey Abbey Gatehouse** — [NT Website](https://www.nationaltrust.org.uk/visit/cambridgeshire/ramsey-abbey-gatehouse) — historic-site

#### Cheshire
- **Helsby Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/cheshire-greater-manchester/helsby-hill) — countryside

#### Cornwall
- **Boscastle** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/boscastle) — coast
- **Botallack Mine** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/botallack) — historic-site
- **Cadsonbury** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/cadsonbury) — countryside
- **Carnewas & Bedruthan Steps** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/carnewas-at-bedruthan) — coast
- **Cornish Mines & Engines** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/cornish-mines-and-engines) — historic-site
- **Godrevy** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/godrevy) — coast
- **Hawker's Hut** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/hawkers-hut) — historic-site
- **Kynance Cove** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/kynance-cove) — coast
- **Lawrence House** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/lawrence-house) — house
- **Penrose** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/penrose) — countryside
- **Sandymouth Beach** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/sandymouth) — coast
- **St Anthony Head** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/st-anthony-head) — coast
- **Wheal Coates** — [NT Website](https://www.nationaltrust.org.uk/visit/cornwall/wheal-coates) — historic-site

#### County Durham
- **Crook Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/crook-hall-and-gardens) — house

#### Cumbria / Lake District
- **Beatrix Potter Gallery** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/beatrix-potter-gallery) — historic-site
- **Bowder Stone** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/bowder-stone) — countryside
- **Cartmel Priory Gatehouse** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/cartmel-priory-gatehouse) — historic-site
- **Cross Keys Inn, Sedbergh** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/cross-keys-inn) — historic-site
- **Derwent Island House** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/derwent-island-house) — house
- **Old Dungeon Ghyll** — [NT Website](https://www.nationaltrust.org.uk/visit/lake-district/old-dungeon-ghyll) — historic-site

#### Derbyshire / Peak District
- **Duffield Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/duffield-castle) — castle
- **High Peak Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/high-peak-estate) — countryside
- **Stainsby Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/stainsby-mill) — historic-site
- **The Old Manor** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/the-old-manor) — house
- **White Peak Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/white-peak-estate) — countryside
- **Winster Market House** — [NT Website](https://www.nationaltrust.org.uk/visit/peak-district-derbyshire/winster-market-house) — historic-site

#### Devon
- **Baggy Point** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/baggy-point) — coast
- **Bolberry Down** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/bolberry-down) — coast
- **Branscombe** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/branscombe) — historic-site
- **The Church House** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/the-church-house) — historic-site
- **Heddon Valley** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/heddon-valley) — countryside
- **Loughwood Meeting House** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/loughwood-meeting-house) — historic-site
- **Morte Point** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/morte-point) — coast
- **The Old Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/the-old-mill) — historic-site
- **Parke** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/parke) — countryside
- **Plymbridge Woods** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/plymbridge-woods) — countryside
- **Shute Barton** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/shute-barton) — house
- **Watersmeet House** — [NT Website](https://www.nationaltrust.org.uk/visit/devon/watersmeet) — countryside

#### Dorset
- **Ballard Down** — [NT Website](https://www.nationaltrust.org.uk/visit/dorset/ballard-down) — countryside
- **Old Harry Rocks** — [NT Website](https://www.nationaltrust.org.uk/visit/dorset/old-harry-rocks) — coast
- **Portland House** — [NT Website](https://www.nationaltrust.org.uk/visit/dorset/portland) — historic-site

#### Essex
- **Bourne Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/bourne-mill) — historic-site
- **Coggeshall Grange Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/coggeshall-grange-barn) — historic-site
- **Danbury Commons & Blakes Wood** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/danbury-commons-and-blakes-wood) — countryside
- **Northey Island** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/northey-island) — coast
- **Ray Island** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ray-island) — coast
- **Rayleigh Mount** — [NT Website](https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/rayleigh-mount) — historic-site

#### Gloucestershire & Cotswolds
- **Ashleworth Tithe Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/ashleworth-tithe-barn) — historic-site
- **Bibury** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/bibury) — countryside
- **Hailes Abbey** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/hailes-abbey) — historic-site
- **Haresfield Beacon** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/haresfield-beacon-and-standish-wood) — countryside
- **Horton Court** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/horton-court) — house
- **Little Fleece Bookshop** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/little-fleece-bookshop) — historic-site
- **Lodge Park & Sherborne Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/lodge-park-and-sherborne-estate) — house
- **May Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/may-hill) — countryside
- **Minchinhampton Common** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/minchinhampton-and-rodborough-commons) — countryside
- **Woodchester Park** — [NT Website](https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/woodchester-park) — countryside

#### Hampshire
- **Ludshott Common & Waggoners Wells** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/ludshott-common-and-waggoners-wells) — countryside
- **Selborne Common** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/selborne-common) — countryside
- **Stockbridge Down** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/stockbridge-down) — countryside
- **Stockbridge Marsh** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/stockbridge-marsh) — countryside
- **West Green House** — [NT Website](https://www.nationaltrust.org.uk/visit/hampshire/west-green-house-garden) — garden

#### Herefordshire
- **Cwmmau Farmhouse** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/cwmmau-farmhouse) — historic-site
- **The Weir Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/the-weir-garden) — garden

#### Isle of Wight
- **Bembridge Fort** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/bembridge-fort) — historic-site
- **Bembridge Windmill** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/bembridge-windmill) — historic-site
- **Brighstone Shop** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/brighstone-shop-and-museum) — historic-site
- **Borthwood Copse** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/borthwood-copse) — countryside
- **Chillerton Down** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/chillerton-down) — countryside
- **Mottistone Manor** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/mottistone-gardens-and-estate) — garden
- **The Needles** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/the-needles-headland-and-tennyson-down) — coast
- **The Needles Batteries** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/the-needles-old-battery-and-new-battery) — historic-site
- **Newtown Old Town Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/newtown-old-town-hall) — historic-site
- **St Catherine's Oratory** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/st-catherines-oratory) — historic-site
- **Rosetta Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/isle-of-wight/rosetta-cottage) — historic-site

#### Kent
- **Chiddingstone** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/chiddingstone) — historic-site
- **Cobham Wood & Mausoleum** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/cobham-wood-and-mausoleum) — countryside
- **Coldrum Long Barrow** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/coldrum-long-barrow) — historic-site
- **Old Soar Manor** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/old-soar-manor) — house
- **Oldbury Camp** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/oldbury-hill) — countryside
- **One Tree Hill & Bitchet Common** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/one-tree-hill) — countryside
- **Owletts** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/owletts) — house
- **South Foreland Lighthouse** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/south-foreland-lighthouse) — historic-site
- **Sprivers Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/sprivers-garden) — garden
- **St John's Jerusalem** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/st-johns-jerusalem) — garden
- **Stoneacre** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/stoneacre) — house
- **Toys Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/kent/toys-hill) — countryside

#### Lancashire
- **Heysham Head** — [NT Website](https://www.nationaltrust.org.uk/visit/liverpool-lancashire/heysham-head) — coast

#### Leicestershire
- **Staunton Harold Church** — [NT Website](https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/staunton-harold-church) — historic-site
- **Ulverscroft Nature Reserve** — [NT Website](https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/ulverscroft) — countryside

#### Lincolnshire
- **Grantham House** — [NT Website](https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/grantham-house) — house
- **Sandilands** — [NT Website](https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/sandilands) — coast

#### London
- **575 Wandsworth Road** — [NT Website](https://www.nationaltrust.org.uk/visit/london/575-wandsworth-road) — house
- **Blewcoat School** — [NT Website](https://www.nationaltrust.org.uk/visit/london/blewcoat-school) — historic-site
- **Eastbury Manor House** — [NT Website](https://www.nationaltrust.org.uk/visit/london/eastbury-manor-house) — house
- **East Sheen Common** — [NT Website](https://www.nationaltrust.org.uk/visit/london/east-sheen-common) — countryside
- **George Inn** — [NT Website](https://www.nationaltrust.org.uk/visit/london/george-inn) — historic-site
- **Lindsey House** — [NT Website](https://www.nationaltrust.org.uk/visit/london/lindsey-house) — house
- **Petts Wood & Hawkwood** — [NT Website](https://www.nationaltrust.org.uk/visit/london/petts-wood-and-hawkwood) — countryside
- **Rainham Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/london/rainham-hall) — house
- **Roman Baths, Strand Lane** — [NT Website](https://www.nationaltrust.org.uk/visit/london/roman-bath) — historic-site
- **Selsdon Wood** — [NT Website](https://www.nationaltrust.org.uk/visit/london/selsdon-wood) — countryside
- **Watermeads** — [NT Website](https://www.nationaltrust.org.uk/visit/london/watermeads) — countryside

#### Merseyside
- **59 Rodney Street** — [NT Website](https://www.nationaltrust.org.uk/visit/liverpool-lancashire/59-rodney-street) — house

#### Norfolk
- **Blakeney Point** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/blakeney-national-nature-reserve) — coast
- **Brancaster** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/brancaster-estate) — coast
- **Darrow Wood** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/darrow-wood) — countryside
- **Elizabethan House Museum** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/elizabethan-house-museum) — house
- **St George's Guildhall** — [NT Website](https://www.nationaltrust.org.uk/visit/norfolk/st-georges-guildhall) — historic-site

#### Northamptonshire
- **Priest's House** — [NT Website](https://www.nationaltrust.org.uk/visit/leicestershire-northamptonshire/priests-house-easton-on-the-hill) — historic-site

#### Northumberland
- **Allen Banks & Staward Gorge** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/allen-banks-and-staward-gorge) — countryside
- **Dunstanburgh Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/dunstanburgh-castle) — castle
- **George Stephenson's Birthplace** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/george-stephensons-birthplace) — house
- **Hadrian's Wall & Housesteads** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/hadrians-wall-and-housesteads-fort) — historic-site
- **Northumberland Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/northumberland-coast) — coast
- **Ros Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/ros-castle) — countryside
- **St Cuthbert's Cave** — [NT Website](https://www.nationaltrust.org.uk/visit/north-east/st-cuthberts-cave) — historic-site

#### Nottinghamshire
- **Monksthorpe Chapel** — [NT Website](https://www.nationaltrust.org.uk/visit/nottinghamshire-lincolnshire/monksthorpe-chapel) — historic-site

#### Shropshire
- **Cronkhill** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/cronkhill) — house
- **Morville Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/morville-hall) — house
- **Town Walls Tower** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/town-walls-tower) — historic-site

#### Somerset
- **Bath Assembly Rooms** — [NT Website](https://www.nationaltrust.org.uk/visit/bath-bristol/bath-assembly-rooms) — historic-site
- **Brean Down** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/brean-down) — coast
- **Brean Down Fort** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/brean-down-fort) — historic-site
- **Burrow Mump** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/burrow-mump) — historic-site
- **Cadbury Camp** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/cadbury-camp) — historic-site
- **Cheddar Gorge** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/cheddar-gorge) — countryside
- **Crook Peak to Shute Shelve Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/crook-peak-and-shute-shelve-hill) — countryside
- **Dolebury Warren** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/dolebury-warren) — countryside
- **Dunster Working Watermill** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/dunster-working-watermill) — historic-site
- **Ebbor Gorge** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/ebbor-gorge) — countryside
- **Fyne Court** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/fyne-court) — garden
- **Holnicote Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/holnicote-estate) — countryside
- **King Alfred's Tower** — [NT Website](https://www.nationaltrust.org.uk/visit/somerset/king-alfreds-tower) — historic-site
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
- **Mow Cop Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/mow-cop-castle) — castle
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
- **Birling Gap & Seven Sisters** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/birling-gap-and-the-seven-sisters) — coast
- **Cissbury Ring** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/cissbury-ring) — historic-site
- **Devil's Dyke** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/devils-dyke) — countryside
- **Harting Down** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/harting-down) — countryside
- **Lavington Common** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/lavington-common) — countryside
- **Litlington White Horse** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/litlington-white-horse) — historic-site
- **Swan Barn Farm** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/swan-barn-farm) — countryside
- **Wakehurst Place Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/sussex/wakehurst) — garden

#### Warwickshire
- **Kinwarton Dovecote** — [NT Website](https://www.nationaltrust.org.uk/visit/warwickshire/kinwarton-dovecote) — historic-site
- **Roundhouse, Birmingham** — [NT Website](https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/roundhouse-birmingham) — historic-site

#### Wiltshire
- **Avebury Manor & Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/avebury-manor-and-garden) — house
- **Calstone & Cherhill Downs** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/cherhill-down-and-oldbury-castle) — countryside
- **Cley Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/cley-hill) — countryside
- **Figsbury Ring** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/figsbury-ring) — historic-site
- **Heelis** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/heelis) — historic-site
- **Fox Talbot Museum** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/lacock-abbey-fox-talbot-museum-and-village) — historic-site
- **Little Clarendon** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/little-clarendon) — house
- **Pepperbox Hill** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/pepperbox-hill) — countryside
- **Philipps House & Dinton Park** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/philipps-house-and-dinton-park) — house
- **Piggledene** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/piggledene) — countryside
- **Stonehenge Landscape** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/stonehenge-landscape) — historic-site
- **The Coombes** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/the-coombes) — countryside
- **White Barrow** — [NT Website](https://www.nationaltrust.org.uk/visit/wiltshire/white-barrow) — historic-site

#### Worcestershire
- **Bredon Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/bredon-barn) — historic-site
- **The Firs (Elgar Birthplace Museum)** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/the-firs-elgars-birthplace-museum) — house
- **The Fleece Inn** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/the-fleece-inn) — historic-site
- **The Greyfriars** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/the-greyfriars-house-and-garden) — house
- **Hawford Dovecote** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/hawford-dovecote) — historic-site
- **Knowles Mill** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/knowles-mill) — historic-site
- **Middle Littleton Tythe Barn** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/middle-littleton-tithe-barn) — historic-site
- **Rosedene (Chartist cottage)** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/rosedene) — house
- **Wichenford Dovecote** — [NT Website](https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/wichenford-dovecote) — historic-site

#### Yorkshire (East / Humberside)
- **Maister House** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/maister-house) — house

#### Yorkshire (North)
- **Braithwaite Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/braithwaite-hall) — house
- **Bridestones, Crosscliff & Blakey Topping** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/bridestones-crosscliff-and-blakey-topping) — countryside
- **Goddards House and Garden** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/goddards-house-and-garden) — house
- **Malham Tarn Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/malham-tarn) — countryside
- **Middlethorpe Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/middlethorpe-hall) — house
- **Moulton Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/moulton-hall) — house
- **Mount Grace Priory** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/mount-grace-priory) — historic-site
- **Robin Hood's Bay** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/robin-hoods-bay) — coast
- **Roseberry Topping** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/roseberry-topping) — countryside
- **Upper Wharfedale** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/upper-wharfedale) — countryside
- **Yorkshire Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/yorkshire-coast) — coast

#### Yorkshire (South)
- **Wentworth Castle Gardens** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/wentworth-castle-gardens) — garden

#### Yorkshire (West)
- **Marsden Moor Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/yorkshire/marsden-moor-estate) — countryside

---

### WALES

#### Anglesey
- **Cemlyn & North Anglesey Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/cemlyn-and-north-anglesey-coast) — coast
- **Swtan** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/swtan) — historic-site

#### Carmarthenshire
- **Aberdeunant** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/aberdeunant) — house
- **Dolaucothi Estate woodland** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/dolaucothi-estate) — countryside
- **Paxton's Tower** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/paxtons-tower) — historic-site

#### Ceredigion
- **Mwnt** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/mwnt) — coast
- **Penbryn** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/penbryn) — coast

#### Conwy
- **Aberconwy House** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/aberconwy-house) — house
- **Bodysgallen Hall** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/bodysgallen-hall-and-spa) — house
- **Conwy Suspension Bridge** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/conwy-suspension-bridge) — historic-site
- **Tŷ Mawr Wybrnant** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/ty-mawr-wybrnant) — house
- **Ysbyty Ifan** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/ysbyty-ifan) — countryside

#### Gwynedd / Snowdonia
- **Carneddau & Glyderau** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/carneddau-and-glyderau) — countryside
- **Craflwyn & Beddgelert** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/craflwyn-and-beddgelert) — countryside
- **Dolmelynllyn Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/dolmelynllyn) — countryside
- **Hafod y Llan** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/hafod-y-llan) — countryside
- **Llanbedrog Beach** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/llanbedrog) — coast
- **Ogwen Cottage** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/ogwen-cottage) — countryside
- **Porth Meudwy** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/porth-meudwy) — coast
- **Porth y Swnt** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/porth-y-swnt) — historic-site
- **Porthdinllaen** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/porthdinllaen) — coast
- **Porthor** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/porthor) — coast
- **Segontium** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/segontium) — historic-site

#### Monmouthshire
- **Clytha Park** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/clytha-park) — countryside
- **The Kymin** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/the-kymin) — historic-site
- **Skenfrith Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/skenfrith-castle) — castle

#### Pembrokeshire
- **Cilgerran Castle** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/cilgerran-castle) — castle
- **Marloes Sands & Mere** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/marloes-sands-and-mere) — coast
- **Martin's Haven** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/martins-haven) — coast
- **Cleddau Woodlands** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/cleddau-woodlands) — countryside
- **Solva Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/solva) — coast
- **Southwood Estate** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/southwood-estate) — countryside
- **St Davids Peninsula** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/st-davids-peninsula) — coast

#### Powys
- **Abergwesyn Common** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/abergwesyn-common) — countryside
- **Brecon Beacons** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/brecon-beacons) — countryside

#### Swansea / Gower
- **Rhossili & South Gower Coast** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/rhossili-and-south-gower-coast) — coast
- **Pennard, Pwll Du & Bishopston Valley** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/pennard-castle-and-three-cliffs-bay) — coast
- **Whiteford & North Gower** — [NT Website](https://www.nationaltrust.org.uk/visit/wales/whiteford-and-north-gower) — coast

---

### NORTHERN IRELAND

All 24 Northern Ireland properties are already in the database. ✓

---

**Total missing: ~277 properties** (240 England, 37 Wales, 0 Northern Ireland)

> **Note:** NT website URLs above follow the standard pattern but should be verified before scraping — some may use different region slugs or combined pages.
