import { chromium } from 'playwright';

const locations = [
  { name: 'St Johns Jerusalem', url: 'https://www.nationaltrust.org.uk/visit/kent/st-johns-jerusalem' },
  { name: 'Darrow Wood', url: 'https://www.nationaltrust.org.uk/visit/norfolk/darrow-wood' },
  { name: 'St Georges Guildhall', url: 'https://www.nationaltrust.org.uk/visit/norfolk/st-georges-guildhall' },
  { name: 'Brean Down', url: 'https://www.nationaltrust.org.uk/visit/somerset/brean-down' },
  { name: 'Wellington Monument', url: 'https://www.nationaltrust.org.uk/visit/somerset/wellington-monument' },
  { name: 'King Johns Hunting Lodge', url: 'https://www.nationaltrust.org.uk/visit/somerset/king-johns-hunting-lodge' },
  { name: 'Leigh Woods', url: 'https://www.nationaltrust.org.uk/visit/bath-bristol/leigh-woods' },
  { name: 'Stoke sub Hamdon Priory', url: 'https://www.nationaltrust.org.uk/visit/somerset/stoke-sub-hamdon-priory' },
  { name: 'Stembridge Tower Mill', url: 'https://www.nationaltrust.org.uk/visit/somerset/stembridge-tower-mill' },
  { name: 'Cadbury Camp', url: 'https://www.nationaltrust.org.uk/visit/somerset/cadbury-camp' },
  { name: 'Downs Banks', url: 'https://www.nationaltrust.org.uk/visit/shropshire-staffordshire/downs-banks' },
  { name: 'Knowles Mill', url: 'https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/knowles-mill' },
  { name: 'Middle Littleton Tithe Barn', url: 'https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/middle-littleton-tithe-barn' },
  { name: 'Rosedene', url: 'https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/rosedene' },
  { name: 'Wichenford Dovecote', url: 'https://www.nationaltrust.org.uk/visit/worcestershire-herefordshire/wichenford-dovecote' },
  { name: 'Maister House', url: 'https://www.nationaltrust.org.uk/visit/yorkshire/maister-house' },
  { name: 'Braithwaite Hall', url: 'https://www.nationaltrust.org.uk/visit/yorkshire/braithwaite-hall' },
  { name: 'Bridestones', url: 'https://www.nationaltrust.org.uk/visit/yorkshire/bridestones-crosscliff-and-blakey-topping' },
  { name: 'Yorkshire Coast', url: 'https://www.nationaltrust.org.uk/visit/yorkshire/yorkshire-coast' },
  { name: 'Bookham Commons', url: 'https://www.nationaltrust.org.uk/visit/surrey/bookham-commons' },
  { name: 'Clandon Park', url: 'https://www.nationaltrust.org.uk/visit/surrey/clandon-park' },
  { name: 'River Wey', url: 'https://www.nationaltrust.org.uk/visit/surrey/river-wey-and-godalming-navigations-and-dapdune-wharf' },
  { name: 'Reigate Hill', url: 'https://www.nationaltrust.org.uk/visit/surrey/reigate-hill-and-gatton-park' },
  { name: 'Harting Down', url: 'https://www.nationaltrust.org.uk/visit/sussex/harting-down' },
  { name: 'Wakehurst', url: 'https://www.nationaltrust.org.uk/visit/sussex/wakehurst' },
  { name: 'Kinwarton Dovecote', url: 'https://www.nationaltrust.org.uk/visit/warwickshire/kinwarton-dovecote' },
  { name: 'The Roundhouse', url: 'https://www.nationaltrust.org.uk/visit/birmingham-west-midlands/roundhouse' },
  { name: 'Cley Hill', url: 'https://www.nationaltrust.org.uk/visit/wiltshire/cley-hill' },
  { name: 'Figsbury Ring', url: 'https://www.nationaltrust.org.uk/visit/wiltshire/figsbury-ring' },
  { name: 'Pepperbox Hill', url: 'https://www.nationaltrust.org.uk/visit/wiltshire/pepperbox-hill' },
];

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

for (const loc of locations) {
  try {
    await page.goto(loc.url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    const text = await page.evaluate(() => document.body.innerText);
    const prices = text.match(/£[\d.]+/g);
    const hasPriceSection = text.toLowerCase().includes('prices') && !text.includes('Radware');
    
    // Try clicking Prices accordion
    try {
      const pricesBtn = page.locator('button:has-text("Prices"), summary:has-text("Prices")').first();
      if (await pricesBtn.isVisible({ timeout: 1000 })) {
        await pricesBtn.click();
        await page.waitForTimeout(1500);
        const expandedText = await page.evaluate(() => document.body.innerText);
        const expandedPrices = expandedText.match(/£[\d.]+/g);
        if (expandedPrices && expandedPrices.length > 0) {
          console.log('PAID    | ' + loc.name + ' | ' + [...new Set(expandedPrices)].join(', '));
          continue;
        }
      }
    } catch {}
    
    // Check tables with pricing
    const tableText = await page.evaluate(() => {
      return [...document.querySelectorAll('table')].map(t => t.textContent).filter(t => t.includes('£')).join(' ').substring(0, 300);
    });
    
    if (tableText.length > 0) {
      const tblPrices = tableText.match(/£[\d.]+/g);
      console.log('PAID    | ' + loc.name + ' | ' + [...new Set(tblPrices || [])].join(', '));
    } else if (prices && prices.length > 0 && hasPriceSection) {
      console.log('PAID    | ' + loc.name + ' | ' + [...new Set(prices)].join(', '));
    } else {
      console.log('FREE    | ' + loc.name);
    }
  } catch (e) {
    console.log('ERROR   | ' + loc.name + ' | ' + e.message.substring(0, 50));
  }
}

await browser.close();
