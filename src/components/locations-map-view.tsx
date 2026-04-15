"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { LocationMap, type LocationData } from "./location-map";
import Link from "next/link";
import {
  Search,
  Navigation,
  MapPin,
  Heart,
  Star,
  Share2,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/categories";
import { toggleVisit, syncLocalStorageVisits } from "@/actions/visits";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LocationsMapViewProps {
  locations: LocationData[];
  dbVisits?: Record<number, { visitedAt: string }[]> | null;
  isAuthenticated?: boolean;
}

type CategoryFilter = "all" | "house" | "garden" | "castle" | "countryside" | "coast";
type ViewFilter = "all" | "visited" | "unvisited" | "wishlist";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "✨" },
  { value: "house", label: "Houses", icon: "🏠" },
  { value: "garden", label: "Gardens", icon: "🌳" },
  { value: "castle", label: "Castles", icon: "🏰" },
  { value: "countryside", label: "Countryside", icon: "🏞️" },
  { value: "coast", label: "Coast", icon: "🏖️" },
];

const VIEW_FILTERS: { value: ViewFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "visited", label: "Visited" },
  { value: "unvisited", label: "Not Visited" },
  { value: "wishlist", label: "★ Wishlist" },
];

const CATEGORY_FALLBACK_ICON: Record<string, string> = {
  house: "🏠",
  garden: "🌳",
  castle: "🏰",
  countryside: "🏞️",
  coast: "🏖️",
};

// ─── localStorage helpers ───────────────────────────────────────────────────

function loadVisited(): Record<string, { date: string }[]> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("nt_visited") || "{}");
  } catch {
    return {};
  }
}

function saveVisited(v: Record<string, { date: string }[]>) {
  localStorage.setItem("nt_visited", JSON.stringify(v));
}

function loadWishlist(): Record<string, true> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem("nt_wishlist") || "{}");
  } catch {
    return {};
  }
}

function saveWishlist(w: Record<string, true>) {
  localStorage.setItem("nt_wishlist", JSON.stringify(w));
}

function formatVisitDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function formatDistance(miles: number): string {
  return miles < 1
    ? `${Math.round(miles * 5280)} ft`
    : `${miles.toFixed(1)} mi`;
}

// ─── Haversine distance (miles) ─────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Region grouping helper ─────────────────────────────────────────────────

type CardLocation = LocationData & { dist?: number };

// ─── Property Card ──────────────────────────────────────────────────────────

function PropertyCard({
  location,
  isSelected,
  visited,
  wishlisted,
  distance,
  onSelect,
  onToggleVisited,
  onToggleWishlist,
}: {
  location: CardLocation;
  isSelected: boolean;
  visited: { date: string }[] | null;
  wishlisted: boolean;
  distance?: number;
  onSelect: (id: number) => void;
  onToggleVisited: (name: string) => void;
  onToggleWishlist: (name: string) => void;
}) {
  const cat = location.category ? getCategoryConfig(location.category) : null;
  const fallback = location.category ? CATEGORY_FALLBACK_ICON[location.category] : "🏠";

  return (
    <div
      data-location-id={location.id}
      className={cn(
        "group cursor-pointer rounded-2xl transition",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
      onClick={() => onSelect(location.id)}
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {location.heroImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={location.heroImageUrl}
            alt={location.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            {fallback}
          </div>
        )}

        {/* Visited checkmark (top-left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisited(location.name);
          }}
          title={visited ? "Mark as not visited" : "Mark as visited"}
          className={cn(
            "absolute left-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shadow-md backdrop-blur-md transition hover:scale-110",
            visited
              ? "bg-visited-gold text-white"
              : "bg-black/25 text-white/90 hover:bg-black/40"
          )}
        >
          {visited ? "✓" : <span className="text-[11px] font-semibold">Visit</span>}
        </button>

        {/* Wishlist heart (top-right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(location.name);
          }}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-md transition hover:scale-110 hover:bg-black/40"
        >
          <Heart
            className={cn("h-4 w-4", wishlisted && "fill-rose-500 text-rose-500")}
          />
        </button>

        {/* Distance chip (bottom-left, when Near Me is active) */}
        {distance !== undefined && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-sky-700 shadow-sm backdrop-blur-sm">
            <MapPin className="h-3 w-3" />
            {formatDistance(distance)}
          </div>
        )}
      </div>

      <div className="mt-3 space-y-0.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/locations/${location.slug}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "line-clamp-1 text-[15px] font-semibold text-foreground group-hover:underline",
              visited && "text-primary"
            )}
          >
            {location.name}
          </Link>
          <div className="flex shrink-0 items-center gap-0.5 text-xs">
            <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
            <span className="font-medium text-foreground">4.8</span>
          </div>
        </div>
        {(location.region || cat) && (
          <div className="line-clamp-1 text-sm text-muted-foreground">
            {location.region}
            {location.region && cat && " · "}
            {cat?.label}
          </div>
        )}
        {visited && visited.length > 0 ? (
          <div className="pt-1 text-sm font-medium text-primary">
            ✓ Visited {formatVisitDate(visited[visited.length - 1].date)}
            {visited.length > 1 && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                (+{visited.length - 1} more)
              </span>
            )}
          </div>
        ) : (
          <div className="pt-1 text-sm">
            <span className="font-semibold text-foreground">Free</span>
            <span className="text-muted-foreground"> for members</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function LocationsMapView({ locations, dbVisits, isAuthenticated }: LocationsMapViewProps) {
  const searchParams = useSearchParams();

  // Initialise state from URL search params so browser-back restores position
  const [selectedId, setSelectedId] = useState<number | null>(() => {
    const v = searchParams.get("selected");
    return v ? Number(v) : null;
  });
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>(
    () => (searchParams.get("cat") as CategoryFilter) || "all"
  );
  const [viewFilter, setViewFilter] = useState<ViewFilter>(
    () => (searchParams.get("view") as ViewFilter) || "all"
  );
  const [nearMe, setNearMe] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearMeRadius, setNearMeRadius] = useState(25); // miles
  const [visited, setVisited] = useState<Record<string, { date: string }[]>>({});
  const [wishlist, setWishlist] = useState<Record<string, true>>({});
  const [mobileView, setMobileView] = useState<"map" | "list">("list");
  const listRef = useRef<HTMLDivElement>(null);

  // Map camera state — initialise from URL params if present
  const [mapCenter] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  });
  const [mapZoom] = useState<number | null>(() => {
    const z = searchParams.get("z");
    return z ? Number(z) : null;
  });
  const cameraRef = useRef({ center: mapCenter, zoom: mapZoom });

  const handleCameraChanged = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    cameraRef.current = { center, zoom };
  }, []);

  // Sync state → URL search params
  useEffect(() => {
    const sync = () => {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (categoryFilter !== "all") params.set("cat", categoryFilter);
      if (viewFilter !== "all") params.set("view", viewFilter);
      if (selectedId) params.set("selected", String(selectedId));
      const cam = cameraRef.current;
      if (cam.center && cam.zoom) {
        params.set("lat", cam.center.lat.toFixed(4));
        params.set("lng", cam.center.lng.toFixed(4));
        params.set("z", cam.zoom.toFixed(1));
      }
      const qs = params.toString();
      const url = qs ? `/locations?${qs}` : "/locations";
      window.history.replaceState(null, "", url);
    };
    sync();
    const id = setInterval(sync, 1000);
    return () => clearInterval(id);
  }, [search, categoryFilter, viewFilter, selectedId]);

  // Build a locationId → name lookup
  const idToName = useMemo(() => {
    const map = new Map<number, string>();
    for (const l of locations) map.set(l.id, l.name);
    return map;
  }, [locations]);

  const nameToId = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of locations) map.set(l.name, l.id);
    return map;
  }, [locations]);

  // Load persisted state — merge DB visits + localStorage for resilience
  useEffect(() => {
    const local = loadVisited();

    if (isAuthenticated && dbVisits) {
      const v: Record<string, { date: string }[]> = { ...local };
      for (const [locId, dates] of Object.entries(dbVisits)) {
        const name = idToName.get(Number(locId));
        if (name) v[name] = dates.map((d) => ({ date: d.visitedAt }));
      }
      setVisited(v);

      const localEntries = Object.entries(local);
      if (localEntries.length > 0) {
        const visits = localEntries.map(([locationName, dates]) => ({
          locationName,
          dates: dates.map((d) => d.date),
        }));
        syncLocalStorageVisits({ visits }).catch((err) => {
          console.error("Failed to sync visits:", err);
        });
      }
    } else {
      setVisited(local);
    }
    setWishlist(loadWishlist());
  }, [isAuthenticated, dbVisits, idToName]);

  // Toggle wishlist
  const toggleWishlist = useCallback((name: string) => {
    setWishlist((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = true;
      saveWishlist(next);
      return next;
    });
  }, []);

  // Toggle visited — DB for authenticated, localStorage for anonymous
  const toggleVisited = useCallback((name: string) => {
    setVisited((prev) => {
      const next = { ...prev };
      if (next[name]) delete next[name];
      else next[name] = [{ date: new Date().toISOString() }];
      saveVisited(next);
      return next;
    });

    if (isAuthenticated) {
      const locId = nameToId.get(name);
      if (locId) {
        toggleVisit({ locationId: locId }).catch((err) => {
          console.error("Failed to save visit:", err);
        });
      }
    }
  }, [isAuthenticated, nameToId]);

  // Near Me
  const handleNearMe = useCallback(() => {
    if (nearMe) {
      setNearMe(false);
      setUserCoords(null);
      setViewFilter("all");
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMe(true);
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert("Could not get your location. Please allow location access.");
      }
    );
  }, [nearMe]);

  // Reset all
  const handleReset = useCallback(() => {
    if (!confirm("Are you sure you want to reset all visited properties?")) return;
    setVisited({});
    saveVisited({});
  }, []);

  // Share
  const handleShare = useCallback(() => {
    const names = locations
      .filter((l) => !!visited[l.name])
      .map((l) => l.name)
      .sort();
    const count = names.length;
    const pct = Math.round((count / locations.length) * 100);
    let text = `National Trust Progress\n${"=".repeat(30)}\n${count} of ${locations.length} visited (${pct}%)\n\n`;
    if (names.length > 0) {
      text += "Visited properties:\n";
      names.forEach((n) => {
        const v = visited[n];
        const dates = v?.map((e) => formatVisitDate(e.date)).join(", ") ?? "";
        text += `  ✓ ${n}${dates ? ` (${dates})` : ""}\n`;
      });
    }
    if (navigator.share) {
      navigator.share({ title: "My National Trust Progress", text });
    } else {
      navigator.clipboard.writeText(text).then(() => alert("Progress copied to clipboard!"));
    }
  }, [locations, visited]);

  // Apply search filter (shared base for all filter counts)
  const searchFiltered = useMemo(() => {
    if (!search) return locations;
    const q = search.toLowerCase();
    return locations.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.shortDescription?.toLowerCase().includes(q) ||
        l.region?.toLowerCase().includes(q)
    );
  }, [locations, search]);

  // Count results per category
  const categoryCounts = useMemo(() => {
    let base = searchFiltered;
    if (viewFilter === "visited") base = base.filter((l) => !!visited[l.name]);
    else if (viewFilter === "unvisited") base = base.filter((l) => !visited[l.name]);
    else if (viewFilter === "wishlist") base = base.filter((l) => !!wishlist[l.name]);

    const counts: Record<string, number> = { all: base.length };
    for (const f of CATEGORY_FILTERS) {
      if (f.value === "all") continue;
      counts[f.value] = base.filter((l) => l.category === f.value).length;
    }
    return counts;
  }, [searchFiltered, viewFilter, visited, wishlist]);

  // Count results per view option
  const viewCounts = useMemo(() => {
    let base = searchFiltered;
    if (categoryFilter !== "all") base = base.filter((l) => l.category === categoryFilter);

    return {
      all: base.length,
      visited: base.filter((l) => !!visited[l.name]).length,
      unvisited: base.filter((l) => !visited[l.name]).length,
      wishlist: base.filter((l) => !!wishlist[l.name]).length,
    } as Record<string, number>;
  }, [searchFiltered, categoryFilter, visited, wishlist]);

  // Compute filtered list
  const filtered = useMemo(() => {
    let result = searchFiltered;

    if (categoryFilter !== "all") {
      result = result.filter((l) => l.category === categoryFilter);
    }

    if (viewFilter === "visited") {
      result = result.filter((l) => !!visited[l.name]);
    } else if (viewFilter === "unvisited") {
      result = result.filter((l) => !visited[l.name]);
    } else if (viewFilter === "wishlist") {
      result = result.filter((l) => !!wishlist[l.name]);
    }

    return result;
  }, [searchFiltered, categoryFilter, viewFilter, visited, wishlist]);

  // Near me sorted list — filtered by radius
  const nearMeList = useMemo<CardLocation[] | null>(() => {
    if (!nearMe || !userCoords) return null;
    return filtered
      .map((l) => ({
        ...l,
        dist: haversine(userCoords.lat, userCoords.lng, Number(l.latitude), Number(l.longitude)),
      }))
      .filter((l) => l.dist <= nearMeRadius)
      .sort((a, b) => a.dist - b.dist);
  }, [nearMe, userCoords, filtered, nearMeRadius]);

  // Taste profile derived from the user's visits — drives the "Recommended" sort
  const tasteProfile = useMemo(() => {
    const regionCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};
    let totalVisits = 0;

    for (const loc of locations) {
      if (!visited[loc.name]) continue;
      totalVisits++;
      if (loc.region) regionCounts[loc.region] = (regionCounts[loc.region] ?? 0) + 1;
      if (loc.category) categoryCounts[loc.category] = (categoryCounts[loc.category] ?? 0) + 1;
    }

    const topCategory =
      Object.entries(categoryCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

    return { regionCounts, topCategory, totalVisits };
  }, [locations, visited]);

  // Recommended sort — visit-history-aware, with a featured fallback for first-time users
  const recommended = useMemo(() => {
    const { regionCounts, topCategory, totalVisits } = tasteProfile;

    const scored = filtered.map((loc) => {
      let score = 0;
      // Boost regions the user has already explored (more weight = stronger signal)
      if (loc.region && regionCounts[loc.region]) {
        score += regionCounts[loc.region] * 3;
      }
      // Boost the user's most-visited category
      if (topCategory && loc.category === topCategory) {
        score += 2;
      }
      // Featured-looking (has a hero image) — nudges curated-looking items up
      if (loc.heroImageUrl) score += 1;
      // Push already-visited ones down; user has been there
      if (visited[loc.name]) score -= 10;
      return { loc, score };
    });

    scored.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.loc.name.localeCompare(b.loc.name);
    });

    return { items: scored.map((s) => s.loc), hasSignal: totalVisits > 0 };
  }, [filtered, tasteProfile, visited]);

  // What the map shows — near-me radius filtered set when active, else full filtered set
  const mapLocations = useMemo<LocationData[]>(
    () => (nearMeList ? nearMeList : filtered),
    [nearMeList, filtered]
  );

  // Progress stats
  const visitedCount = useMemo(
    () => locations.filter((l) => !!visited[l.name]).length,
    [locations, visited]
  );
  const progressPct = Math.round((visitedCount / locations.length) * 100);

  // Scroll selected card into view
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-location-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(id);
    if (id && typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileView("map");
    }
  }, []);

  const activeCategoryLabel =
    CATEGORY_FILTERS.find((f) => f.value === categoryFilter)?.label ?? "All";

  // ── Toolbar (shared across desktop and mobile) ──────────────────────────
  const toolbar = (
    <div className="glass sticky top-0 z-20 border-b border-black/5">
      {/* Thin progress bar */}
      <div className="h-1 w-full bg-primary/10">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 md:px-6">
        {/* Row 1: Search + primary actions */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties, regions, or postcodes…"
              className="h-11 w-full rounded-full border border-black/10 bg-white pl-11 pr-4 text-sm shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition focus:border-primary/40 focus:shadow-[0_2px_12px_rgba(0,122,61,0.1)] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNearMe}
              disabled={locating}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold transition",
                nearMe
                  ? "border-sky-600 bg-sky-600 text-white hover:bg-sky-700"
                  : "border-black/10 bg-white text-foreground hover:border-primary/40",
                locating && "opacity-60"
              )}
            >
              <Navigation className="h-3.5 w-3.5" />
              {locating ? "Locating…" : nearMe ? "Near Me" : "Use My Location"}
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-semibold text-foreground transition hover:border-primary/40"
              title="Share progress"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-full border border-transparent bg-transparent px-2 py-2 text-xs font-medium text-muted-foreground transition hover:text-destructive"
              title="Reset all visited"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <div className="ml-auto hidden text-xs text-muted-foreground md:block">
              <span className="font-semibold text-foreground">{visitedCount}</span>
              <span> / {locations.length} visited · {progressPct}%</span>
            </div>
          </div>
        </div>

        {/* Row 2: Category pills + View filter pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 flex-wrap items-center gap-1.5">
            {CATEGORY_FILTERS.map((f) => {
              const count = categoryCounts[f.value] ?? 0;
              const isActive = categoryFilter === f.value;
              const isEmpty = f.value !== "all" && count === 0;
              return (
                <button
                  key={f.value}
                  onClick={() => !isEmpty && setCategoryFilter(f.value)}
                  disabled={isEmpty}
                  className={cn(
                    "flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
                    isActive
                      ? "border-primary bg-primary/5 text-primary shadow-[inset_0_0_0_1px_rgba(0,122,61,0.2)]"
                      : isEmpty
                        ? "border-transparent text-muted-foreground/30 cursor-not-allowed"
                        : "border-transparent text-muted-foreground hover:border-black/10 hover:bg-white hover:text-foreground"
                  )}
                >
                  <span className="text-sm leading-none">{f.icon}</span>
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            {VIEW_FILTERS.map((f) => {
              const count = viewCounts[f.value] ?? 0;
              const isActive = viewFilter === f.value;
              const isEmpty = f.value !== "all" && count === 0;
              return (
                <button
                  key={f.value}
                  onClick={() => {
                    if (isEmpty) return;
                    setViewFilter(f.value);
                    if (nearMe) {
                      setNearMe(false);
                      setUserCoords(null);
                    }
                  }}
                  disabled={isEmpty}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    isActive
                      ? "border-visited-gold bg-visited-gold text-white"
                      : isEmpty
                        ? "border-border/40 text-muted-foreground/30 cursor-not-allowed"
                        : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3 (conditional): Near-Me radius slider */}
        {nearMe && userCoords && (
          <div className="flex items-center gap-3 rounded-full border border-sky-100 bg-sky-50/80 px-4 py-2">
            <span className="text-xs font-medium text-sky-700 shrink-0">Radius</span>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={nearMeRadius}
              onChange={(e) => setNearMeRadius(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-sky-100 accent-sky-600 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-sky-600 [&::-webkit-slider-thumb]:shadow"
            />
            <span className="text-xs font-semibold text-sky-700 shrink-0 w-12 text-right">
              {nearMeRadius} mi
            </span>
          </div>
        )}
      </div>
    </div>
  );

  // ── Card grid (shared) ──────────────────────────────────────────────────
  const cardGrid = (
    <div ref={listRef} className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-[1100px] px-4 pb-12 pt-5 md:px-6">
        <div className="mb-5 flex items-baseline justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {nearMe
                ? `Near you (within ${nearMeRadius} mi)`
                : recommended.hasSignal
                  ? "Recommended for you"
                  : `${activeCategoryLabel} — National Trust`}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">
                {(nearMeList ?? recommended.items).length}
              </span>{" "}
              {(nearMeList ?? recommended.items).length === 1 ? "place" : "places"}
              {!nearMe && recommended.hasSignal && (
                <span>
                  {" "}· based on your {tasteProfile.totalVisits}{" "}
                  {tasteProfile.totalVisits === 1 ? "visit" : "visits"}
                </span>
              )}
              {viewFilter !== "all" && ` · ${viewFilter}`}
            </p>
          </div>
        </div>

        {(nearMeList ?? recommended.items).length === 0 ? (
          <div className="py-20 text-center text-sm text-muted-foreground">
            No properties match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
            {(nearMeList ?? recommended.items).map((loc) => (
              <PropertyCard
                key={loc.id}
                location={loc}
                isSelected={loc.id === selectedId}
                visited={visited[loc.name] || null}
                wishlisted={!!wishlist[loc.name]}
                distance={"dist" in loc ? (loc as CardLocation).dist : undefined}
                onSelect={handleSelect}
                onToggleVisited={toggleVisited}
                onToggleWishlist={toggleWishlist}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── Map pane (shared) ───────────────────────────────────────────────────
  const mapPane = (
    <div className="relative h-full overflow-hidden rounded-2xl border border-black/5 shadow-[0_8px_32px_rgba(0,0,0,0.06)]">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm">
        <MapPin className="h-3 w-3 text-primary" />
        {mapLocations.length} on map
      </div>
      <LocationMap
        locations={mapLocations}
        selectedLocationId={selectedId}
        onLocationSelect={handleSelect}
        visited={visited}
        wishlist={wishlist}
        onToggleVisited={toggleVisited}
        onToggleWishlist={toggleWishlist}
        initialCenter={mapCenter ?? undefined}
        initialZoom={mapZoom ?? undefined}
        onCameraChanged={handleCameraChanged}
        userLocation={nearMe ? userCoords : null}
        nearMeRadius={nearMe ? nearMeRadius : undefined}
        categoryFilter={categoryFilter}
        onCategoryFilter={(cat) => setCategoryFilter(cat as CategoryFilter)}
        viewFilter={viewFilter}
        className="h-full"
      />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col bg-[#fafaf7]">
      {toolbar}

      {/* Mobile map/list toggle */}
      <div className="flex items-center gap-2 border-b bg-white/60 px-4 py-2 md:hidden">
        <Button
          variant={mobileView === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("list")}
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          List
        </Button>
        <Button
          variant={mobileView === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("map")}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Map
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {(nearMeList ?? filtered).length} places
        </span>
      </div>

      {/* Desktop split: grid + map */}
      <div className="hidden flex-1 overflow-hidden md:flex">
        {cardGrid}
        <div className="w-[44%] border-l border-black/5 bg-[#fafaf7]">
          <div className="sticky top-0 h-full p-4">{mapPane}</div>
        </div>
      </div>

      {/* Mobile: show either grid or map */}
      <div className="flex flex-1 overflow-hidden md:hidden">
        {mobileView === "list" ? (
          cardGrid
        ) : (
          <div className="flex-1 p-3">{mapPane}</div>
        )}
      </div>
    </div>
  );
}
