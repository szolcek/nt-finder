import { chromium } from "playwright";
import { writeFileSync } from "fs";

const url = process.argv[2];
const outPath = process.argv[3];
if (!url) {
  console.error(
    "Usage: node scrape-hours.mjs <NT_URL> [output.json] [screenshotPath]",
  );
  process.exit(1);
}
const screenshotPath = process.argv[4] || "/tmp/nt-hours.png";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 1600 },
});

console.log("Loading:", url);
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

try {
  await page.click(
    'button:has-text("Accept"), button:has-text("Reject"), [id*=cookie] button',
    { timeout: 2000 },
  );
  await page.waitForTimeout(500);
} catch {}

const triggers = [
  'button:has-text("Opening")',
  'summary:has-text("Opening")',
  'button:has-text("times")',
];
for (const sel of triggers) {
  try {
    const el = page.locator(sel).first();
    if ((await el.count()) > 0) {
      await el.click({ timeout: 1500 });
      await page.waitForTimeout(800);
    }
  } catch {}
}

await page.waitForTimeout(1500);

const data = await page.evaluate(() => {
  const result = {
    today: null,
    notes: [],
  };

  // Find the per-asset opening table
  const tables = [...document.querySelectorAll("table")];
  for (const t of tables) {
    const rows = [...t.querySelectorAll("tr")];
    if (rows.length < 2) continue;
    const headerCells = [...rows[0].querySelectorAll("th,td")].map((c) =>
      (c.textContent || "").trim().toLowerCase(),
    );
    const isAssetTable =
      headerCells.includes("asset") ||
      headerCells.some((c) => c.includes("opening time"));
    if (!isAssetTable) continue;

    const assets = rows
      .slice(1)
      .map((r) => {
        const cells = [...r.querySelectorAll("td,th")].map((c) =>
          (c.textContent || "").trim(),
        );
        return { name: cells[0], hours: cells[1] };
      })
      .filter((a) => a.name && a.hours);

    // Look for the date heading near this table
    let date = null;
    let prev = t.previousElementSibling;
    for (let i = 0; i < 5 && prev; i++) {
      const m = (prev.textContent || "").match(
        /Opening times for ([^\n]+?)(?:Asset|$)/i,
      );
      if (m) {
        date = m[1].trim();
        break;
      }
      prev = prev.previousElementSibling;
    }
    if (!date) {
      // climb up and search wider
      const wider = t.closest("section, article, div") || document.body;
      const m = (wider.textContent || "").match(
        /Opening times for ([^\n]+?)Asset/i,
      );
      if (m) date = m[1].trim();
    }

    result.today = { date, assets };
    break;
  }

  const noteRegex = /(Last admission[^.]*\.|Pre-booking[^.]*\.)/g;
  const bodyText = (document.body.textContent || "").slice(0, 20000);
  let m;
  while ((m = noteRegex.exec(bodyText)) !== null) {
    if (!result.notes.includes(m[1])) result.notes.push(m[1]);
  }

  return result;
});

const output = {
  source: url,
  scrapedAt: new Date().toISOString(),
  ...data,
};

console.log("\n=== Extracted ===");
console.log(JSON.stringify(output, null, 2));

if (outPath) {
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);
}

try {
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
    timeout: 60000,
  });
  console.log(`Screenshot: ${screenshotPath}`);
} catch (e) {
  console.log(`Screenshot failed: ${e.message}`);
}

await browser.close();
