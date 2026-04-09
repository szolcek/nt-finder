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
