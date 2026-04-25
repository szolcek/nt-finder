export type AssetKey =
  | "house"
  | "garden"
  | "park"
  | "cafe"
  | "shop"
  | "carPark";

export const ASSET_LABELS: Record<AssetKey, string> = {
  house: "House",
  garden: "Garden",
  park: "Park",
  cafe: "Café",
  shop: "Shop",
  carPark: "Car park",
};

export const ASSET_KEYS: AssetKey[] = [
  "house",
  "garden",
  "park",
  "cafe",
  "shop",
  "carPark",
];

const NORMALISE: { match: RegExp; key: AssetKey }[] = [
  // Order matters: more specific first.
  { match: /\b(car ?park|parking)\b/i, key: "carPark" },
  {
    match:
      /\b(caf[ée]|tea[- ]?room|coffee shop|restaurant|kiosk|pub|tearoom)\b/i,
    key: "cafe",
  },
  {
    match: /\b(shop|bookshop|book shop|plant centre|cobblestones)\b/i,
    key: "shop",
  },
  {
    match: /\b(house|manor|mansion|hall|cottage|tŷ)\b/i,
    key: "house",
  },
  {
    match: /\b(garden|gardd|walled garden)\b/i,
    key: "garden",
  },
  {
    match: /\b(park|parkland|estate|grounds|gardens? and grounds)\b/i,
    key: "park",
  },
];

export function normaliseAssetName(raw: string): AssetKey | null {
  const s = raw.trim();
  if (!s) return null;
  for (const { match, key } of NORMALISE) {
    if (match.test(s)) return key;
  }
  return null;
}

/**
 * Parse a single hours string into open/close minute-of-day.
 * Returns null for "Closed" / unparseable.
 *
 * Examples:
 *   "11:00 - 16:15" -> { openMin: 660, closeMin: 975 }
 *   "Closed"        -> null
 */
export function parseHoursRange(
  raw: string,
): { openMin: number; closeMin: number } | null {
  if (!raw) return null;
  if (/closed/i.test(raw)) return null;
  // Treat dashes (-, –, —) as separator
  const m = raw.match(/(\d{1,2}):(\d{2})\s*[-–—]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const openMin = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  const closeMin = parseInt(m[3], 10) * 60 + parseInt(m[4], 10);
  if (Number.isNaN(openMin) || Number.isNaN(closeMin)) return null;
  return { openMin, closeMin };
}

export type AssetSlot = { openMin: number; closeMin: number };
export type LocationOpenings = Partial<Record<AssetKey, AssetSlot>>;

type RawHoursShape = {
  today?: { assets?: { name?: string; hours?: string }[] } | null;
} | null;

export function extractOpenings(json: unknown): LocationOpenings {
  const data = json as RawHoursShape;
  const assets = data?.today?.assets;
  if (!assets || assets.length === 0) return {};
  const out: LocationOpenings = {};
  for (const a of assets) {
    const key = normaliseAssetName(a.name ?? "");
    if (!key) continue;
    const slot = parseHoursRange(a.hours ?? "");
    if (!slot) continue;
    // If multiple raw assets map to the same key (e.g. "Café" + "Tea-room"),
    // keep the widest window — most permissive.
    const prev = out[key];
    if (!prev) {
      out[key] = slot;
    } else {
      out[key] = {
        openMin: Math.min(prev.openMin, slot.openMin),
        closeMin: Math.max(prev.closeMin, slot.closeMin),
      };
    }
  }
  return out;
}

export function isOpenAt(slot: AssetSlot | undefined, minute: number): boolean {
  if (!slot) return false;
  return minute >= slot.openMin && minute < slot.closeMin;
}

export function timeToMinutes(hhmm: string): number | null {
  const m = hhmm.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10);
  if (h < 0 || h > 23 || mm < 0 || mm > 59) return null;
  return h * 60 + mm;
}

export function minutesToTime(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
