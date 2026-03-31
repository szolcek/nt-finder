"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LocationMap, type LocationData } from "./location-map";
import Link from "next/link";
import { Search, Navigation, MapPin, X, GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCategoryConfig, CATEGORY_COLORS } from "@/lib/categories";
import { LocationCard } from "./location-card";

// ─── Types ──────────────────────────────────────────────────────────────────

interface LocationsMapViewProps {
  locations: LocationData[];
}

type CategoryFilter = "all" | "house" | "garden" | "castle" | "countryside" | "coast";
type ViewFilter = "all" | "visited" | "unvisited" | "wishlist";

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "house", label: "Houses" },
  { value: "garden", label: "Gardens" },
  { value: "castle", label: "Castles" },
  { value: "countryside", label: "Country" },
  { value: "coast", label: "Coast" },
];

const VIEW_FILTERS: { value: ViewFilter; label: string }[] = [
  { value: "all", label: "Show All" },
  { value: "visited", label: "Visited" },
  { value: "unvisited", label: "Not Visited" },
  { value: "wishlist", label: "★ Wishlist" },
];

const TYPE_ICONS: Record<string, string> = {
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

function groupByRegion(locs: LocationData[]): { region: string; items: LocationData[] }[] {
  const map = new Map<string, LocationData[]>();
  for (const loc of locs) {
    const key = loc.region || "Other";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(loc);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, items]) => ({
      region,
      items: items.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

// ─── Sidebar Property Item ──────────────────────────────────────────────────

function PropertyItem({
  location,
  isSelected,
  visited,
  wishlisted,
  distance,
  onSelect,
  onLocate,
  onToggleWishlist,
}: {
  location: LocationData;
  isSelected: boolean;
  visited: { date: string }[] | null;
  wishlisted: boolean;
  distance?: number;
  onSelect: (id: number) => void;
  onLocate: (id: number) => void;
  onToggleWishlist: (name: string) => void;
}) {
  const cat = location.category ? getCategoryConfig(location.category) : null;
  const catColors = location.category ? CATEGORY_COLORS[location.category] : null;
  const icon = location.category ? TYPE_ICONS[location.category] : "";

  return (
    <div
      className={cn(
        "flex items-center gap-3 cursor-pointer border-b border-border/40 px-5 py-2.5 transition-colors",
        visited
          ? "bg-visited-bg border-l-4 border-l-primary pl-4"
          : "hover:bg-muted/50",
        wishlisted && !visited && "bg-wishlist-bg",
        isSelected && "bg-primary/5"
      )}
      onClick={() => onSelect(location.id)}
    >
      {/* Checkbox */}
      <div
        className={cn(
          "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded border-2 text-sm",
          visited
            ? "border-visited-gold bg-visited-gold text-white"
            : "border-muted-foreground/30"
        )}
      >
        {visited && "✓"}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className={cn(
          "truncate text-sm",
          visited ? "font-semibold text-primary" : "font-medium text-foreground"
        )}>
          {location.name}
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
          {distance !== undefined && (
            <span className="font-semibold text-sky-600">
              📍 {distance < 1 ? `${Math.round(distance * 5280)} ft` : `${distance.toFixed(1)} mi`}
            </span>
          )}
          {cat && catColors && (
            <span
              className="rounded px-1.5 py-px font-medium"
              style={{ background: catColors.bg, color: catColors.text }}
            >
              {icon} {cat.label}
            </span>
          )}
          {visited && visited.length > 0 && (
            <span className="font-medium text-primary">
              📅 {formatVisitDate(visited[visited.length - 1].date)}
              {visited.length > 1 && (
                <em className="ml-1">(+{visited.length - 1} more)</em>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Wishlist button */}
      <button
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base transition-colors",
          wishlisted
            ? "text-wishlist"
            : "text-muted-foreground/30 hover:bg-wishlist-bg hover:text-wishlist"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleWishlist(location.name);
        }}
        title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        ★
      </button>

      {/* Locate button */}
      <button
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base text-muted-foreground/40 transition-colors hover:bg-nt-green-light hover:text-primary"
        onClick={(e) => {
          e.stopPropagation();
          onLocate(location.id);
        }}
        title="Show on map"
      >
        🌍
      </button>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function LocationsMapView({ locations }: LocationsMapViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

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
  const [visited, setVisited] = useState<Record<string, { date: string }[]>>({});
  const [wishlist, setWishlist] = useState<Record<string, true>>({});
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const listRef = useRef<HTMLDivElement>(null);

  // Map camera state — initialise from URL params if present
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(() => {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    return lat && lng ? { lat: Number(lat), lng: Number(lng) } : null;
  });
  const [mapZoom, setMapZoom] = useState<number | null>(() => {
    const z = searchParams.get("z");
    return z ? Number(z) : null;
  });
  const cameraRef = useRef({ center: mapCenter, zoom: mapZoom });

  const handleCameraChanged = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    cameraRef.current = { center, zoom };
  }, []);

  // Sync state → URL search params (replaceState so it doesn't create history noise)
  // Use an interval to batch camera updates instead of re-rendering on every pan
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

  // Load persisted state
  useEffect(() => {
    setVisited(loadVisited());
    setWishlist(loadWishlist());
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback((name: string) => {
    setWishlist((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = true;
      }
      saveWishlist(next);
      return next;
    });
  }, []);

  // Toggle visited (simple — adds today if not visited, removes if visited)
  const toggleVisited = useCallback((name: string) => {
    setVisited((prev) => {
      const next = { ...prev };
      if (next[name]) {
        delete next[name];
      } else {
        next[name] = [{ date: new Date().toISOString() }];
      }
      saveVisited(next);
      return next;
    });
  }, []);

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

  // Compute filtered + sorted list
  const filtered = useMemo(() => {
    let result = locations;

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((l) => l.category === categoryFilter);
    }

    // View filter (visited/unvisited/wishlist)
    if (viewFilter === "visited") {
      result = result.filter((l) => !!visited[l.name]);
    } else if (viewFilter === "unvisited") {
      result = result.filter((l) => !visited[l.name]);
    } else if (viewFilter === "wishlist") {
      result = result.filter((l) => !!wishlist[l.name]);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.shortDescription?.toLowerCase().includes(q) ||
          l.region?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [locations, categoryFilter, viewFilter, search, visited, wishlist]);

  // Near me sorted list
  const nearMeList = useMemo(() => {
    if (!nearMe || !userCoords) return null;
    return filtered
      .map((l) => ({
        ...l,
        dist: haversine(userCoords.lat, userCoords.lng, Number(l.latitude), Number(l.longitude)),
      }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 25);
  }, [nearMe, userCoords, filtered]);

  // Region-grouped list
  const grouped = useMemo(() => groupByRegion(filtered), [filtered]);

  // Progress stats
  const visitedCount = useMemo(
    () => locations.filter((l) => !!visited[l.name]).length,
    [locations, visited]
  );
  const progressPct = Math.round((visitedCount / locations.length) * 100);

  // Scroll selected into view
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

  const handleLocate = useCallback((id: number) => {
    setSelectedId(id);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setMobileView("map");
    }
  }, []);

  const selectedLocation = selectedId
    ? locations.find((l) => l.id === selectedId)
    : null;

  // ── Sidebar content (shared between desktop and mobile list) ────────────
  const sidebarContent = (
    <>
      {/* Header */}
      <div className="bg-primary px-5 py-4 text-center text-primary-foreground">
        <h1 className="text-lg font-bold tracking-wide">National Trust Finder</h1>
        <p className="mt-0.5 text-xs opacity-85">
          {locations.length} properties across England &amp; Wales
        </p>
      </div>

      {/* Progress bar */}
      <div className="border-b border-primary/10 bg-nt-green-light px-5 py-3">
        <div className="mb-2 flex items-center justify-between text-[13px] font-medium text-foreground">
          <span>{visitedCount} of {locations.length} visited</span>
          <span>{progressPct}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-primary/15">
          <div
            className="h-full rounded-full bg-primary transition-all duration-400"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-2 border-b px-4 py-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search properties or regions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setCategoryFilter(f.value)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                categoryFilter === f.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Near Me */}
        <button
          onClick={handleNearMe}
          disabled={locating}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium transition-colors",
            nearMe
              ? "bg-sky-600 text-white hover:bg-sky-700"
              : "bg-[#1c1c2e] text-white hover:bg-[#2e2e4a]",
            locating && "opacity-60"
          )}
        >
          <Navigation className="h-3.5 w-3.5" />
          {locating ? "Locating…" : nearMe ? "📍 Near Me" : "Use My Location"}
        </button>

        {/* View filters */}
        <div className="flex flex-wrap gap-1.5">
          {VIEW_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => {
                setViewFilter(f.value);
                if (nearMe) {
                  setNearMe(false);
                  setUserCoords(null);
                }
              }}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
                viewFilter === f.value
                  ? "border-visited-gold bg-visited-gold text-white"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property list */}
      <div ref={listRef} className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20">
        {nearMe && nearMeList ? (
          <>
            <div className="sticky top-0 z-10 border-b bg-muted/80 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
              Nearest {nearMeList.length} properties to you
            </div>
            {nearMeList.map((loc) => (
              <div key={loc.id} data-location-id={loc.id}>
                <PropertyItem
                  location={loc}
                  isSelected={loc.id === selectedId}
                  visited={visited[loc.name] || null}
                  wishlisted={!!wishlist[loc.name]}
                  distance={loc.dist}
                  onSelect={handleSelect}
                  onLocate={handleLocate}
                  onToggleWishlist={toggleWishlist}
                />
              </div>
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            No properties found
          </div>
        ) : (
          grouped.map((group) => (
            <div key={group.region}>
              <div className="sticky top-0 z-10 border-b bg-muted/80 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
                {group.region} ({group.items.length})
              </div>
              {group.items.map((loc) => (
                <div key={loc.id} data-location-id={loc.id}>
                  <PropertyItem
                    location={loc}
                    isSelected={loc.id === selectedId}
                    visited={visited[loc.name] || null}
                    wishlisted={!!wishlist[loc.name]}
                    onSelect={handleSelect}
                    onLocate={handleLocate}
                    onToggleWishlist={toggleWishlist}
                  />
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/40 px-5 py-2.5">
        <button
          onClick={handleReset}
          className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
        >
          Reset All
        </button>
        <button
          onClick={() => {
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
          }}
          className="rounded-md border border-primary bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-colors hover:bg-nt-green-dark"
        >
          Share Progress
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
        <Button
          variant={mobileView === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("map")}
        >
          <MapPin className="mr-1.5 h-3.5 w-3.5" />
          Map
        </Button>
        <Button
          variant={mobileView === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setMobileView("list")}
        >
          <Search className="mr-1.5 h-3.5 w-3.5" />
          List
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} locations
        </span>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden w-[420px] shrink-0 flex-col border-r md:flex">
          {sidebarContent}
        </div>

        {/* Map */}
        <div className={cn("flex-1", mobileView !== "map" && "hidden md:block")}>
          <LocationMap
            locations={filtered}
            selectedLocationId={selectedId}
            onLocationSelect={handleSelect}
            visited={visited}
            wishlist={wishlist}
            onToggleVisited={toggleVisited}
            onToggleWishlist={toggleWishlist}
            initialCenter={mapCenter ?? undefined}
            initialZoom={mapZoom ?? undefined}
            onCameraChanged={handleCameraChanged}
            className="h-full"
          />
        </div>

        {/* Mobile list view */}
        <div className={cn("flex-1 flex-col md:hidden", mobileView === "list" ? "flex" : "hidden")}>
          {sidebarContent}
        </div>

        {/* Mobile bottom sheet */}
        {mobileView === "map" && selectedLocation && (
          <div className="absolute inset-x-0 bottom-0 z-10 md:hidden">
            <div className="mx-3 mb-3 overflow-hidden rounded-lg border bg-card shadow-lg">
              {/* Hero image header */}
              {selectedLocation.heroImageUrl ? (
                <div
                  className="relative h-28 bg-cover bg-center"
                  style={{ backgroundImage: `url(${selectedLocation.heroImageUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <button
                    onClick={() => setSelectedId(null)}
                    className="absolute right-2 top-2 rounded-full bg-black/40 p-1 text-white backdrop-blur-sm hover:bg-black/60"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 px-3 pb-2">
                    <div className="text-sm font-bold text-white drop-shadow-sm">
                      {selectedLocation.name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-white/80">
                      <span>{selectedLocation.region}</span>
                      {selectedLocation.category && (
                        <span className="rounded-full bg-white/20 px-1.5 py-px text-[10px] font-semibold backdrop-blur-sm">
                          {getCategoryConfig(selectedLocation.category).label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between border-b px-3 py-2">
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">
                      {selectedLocation.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="rounded-full p-1 hover:bg-muted"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <div className="border-t px-3 py-2">
                <Button
                  render={<a href={`/locations/${selectedLocation.slug}`} />}
                  nativeButton={false}
                  size="sm"
                  className="w-full"
                >
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
