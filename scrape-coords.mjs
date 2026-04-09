import { chromium } from 'playwright';

const urls = [
  { id: 893, name: 'Hughenden Manor', url: 'https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/hughenden' },
  { id: 894, name: 'Ashridge Estate', url: 'https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ashridge-estate' },
  { id: 895, name: 'Ascott House', url: 'https://www.nationaltrust.org.uk/visit/oxfordshire-buckinghamshire-berkshire/ascott' },
  { id: 896, name: 'Snowshill Manor', url: 'https://www.nationaltrust.org.uk/visit/gloucestershire-cotswolds/snowshill-manor-and-garden' },
  { id: 897, name: 'Compton Castle', url: 'https://www.nationaltrust.org.uk/visit/devon/compton-castle' },
  { id: 898, name: 'Sutton Hoo', url: 'https://www.nationaltrust.org.uk/visit/suffolk/sutton-hoo' },
  { id: 899, name: 'Antony House', url: 'https://www.nationaltrust.org.uk/visit/cornwall/antony' },
  { id: 900, name: "St Michael's Mount", url: 'https://www.nationaltrust.org.uk/visit/cornwall/st-michaels-mount' },
  { id: 901, name: 'Formby', url: 'https://www.nationaltrust.org.uk/visit/liverpool-lancashire/formby' },
  { id: 902, name: 'Dunwich Heath', url: 'https://www.nationaltrust.org.uk/visit/suffolk/dunwich-heath-and-beach' },
];

const browser = await chromium.launch({ headless: true });

for (const loc of urls) {
  const page = await browser.newPage();
  try {
    await page.goto(loc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);

    // Look for coordinates in page source, map links, or meta tags
    const content = await page.content();

    // NT pages often have lat/lng in JSON-LD or data attributes
    const latLng = content.match(/"latitude"\s*:\s*([-\d.]+).*?"longitude"\s*:\s*([-\d.]+)/s)
      || content.match(/lat['"]\s*:\s*([-\d.]+).*?lng['"]\s*:\s*([-\d.]+)/s)
      || content.match(/data-lat=['"]([-\d.]+)['"].*?data-lng=['"]([-\d.]+)['"]/s);

    // Also try Google Maps links
    const mapsLink = content.match(/google\.com\/maps[^"']*@([-\d.]+),([-\d.]+)/)
      || content.match(/google\.com\/maps[^"']*destination=([-\d.]+),([-\d.]+)/)
      || content.match(/maps\.google[^"']*ll=([-\d.]+),([-\d.]+)/);

    // Try directions link
    const directions = content.match(/directions[^"']*destination=([-\d.]+)(?:%2C|,)([-\d.]+)/);

    const match = latLng || mapsLink || directions;
    if (match) {
      console.log(`${loc.id} | ${loc.name} | ${match[1]}, ${match[2]}`);
    } else {
      // Try postcode from page text
      const text = await page.textContent('body');
      const postcode = text.match(/[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}/);
      console.log(`${loc.id} | ${loc.name} | NO COORDS | postcode: ${postcode ? postcode[0] : 'none'}`);
    }
  } catch (e) {
    console.log(`${loc.id} | ${loc.name} | ERROR: ${e.message}`);
  }
  await page.close();
}

await browser.close();
