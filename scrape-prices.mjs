import { chromium } from 'playwright';

const url = process.argv[2] || 'https://www.nationaltrust.org.uk/visit/essex-bedfordshire-hertfordshire/ashridge-estate';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

console.log('Loading:', url);
await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(5000);

// Try to dismiss cookie banner
try {
  await page.click('button:has-text("Accept"), button:has-text("Reject"), [id*=cookie] button', { timeout: 2000 });
} catch {}

// Click the Prices accordion to expand it
try {
  const pricesButton = await page.locator('button:has-text("Prices"), summary:has-text("Prices"), [aria-label*="Prices"]').first();
  if (pricesButton) {
    await pricesButton.click();
    console.log('Clicked Prices accordion');
    await page.waitForTimeout(2000);
  }
} catch (e) {
  console.log('Could not find/click Prices accordion');
}

// Extract all table data which typically contains pricing
const tables = await page.$$eval('table', tables => {
  return tables.map(t => {
    const rows = [...t.querySelectorAll('tr')];
    return rows.map(r => {
      const cells = [...r.querySelectorAll('th, td')];
      return cells.map(c => c.textContent?.trim()).join(' | ');
    }).join('\n');
  });
});

if (tables.length > 0) {
  console.log('\n=== Tables found ===');
  tables.forEach((t, i) => {
    console.log(`\nTable ${i + 1}:`);
    console.log(t);
  });
}

// Get pricing text
const text = await page.textContent('body');
const pricingSection = text.match(/Prices[\s\S]{0,3000}/i);
if (pricingSection) {
  console.log('\n=== Text near "Prices" ===');
  console.log(pricingSection[0].substring(0, 2000));
}

const prices = text.match(/£[\d.]+/g);
if (prices) {
  console.log('\n=== All £ amounts found ===');
  console.log([...new Set(prices)].join(', '));
}

await page.screenshot({ path: '/tmp/nt-prices.png', fullPage: true });
console.log('\nScreenshot saved to /tmp/nt-prices.png');

await browser.close();
