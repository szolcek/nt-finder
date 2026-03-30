"use client";

import { useEffect, useMemo, useRef, useCallback } from "react";
import {
  APIProvider,
  Map as GoogleMap,
  useMap,
  useMapsLibrary,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import Link from "next/link";
import { getCategoryConfig, CATEGORY_COLORS } from "@/lib/categories";
import { MapPin, Trees, Landmark, Waves, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";

// Inject marker animation CSS once at module load
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = `
    @keyframes nt-marker-pop {
      from { opacity: 0; transform: scale(0.4); }
      to { opacity: 1; transform: scale(1); }
    }
    .nt-marker-enter {
      animation: nt-marker-pop 250ms cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
    }
    @keyframes nt-marker-select {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    .nt-marker-select {
      animation: nt-marker-select 300ms ease-out;
    }
  `;
  document.head.appendChild(style);
}

/** Marker color map matching the source project */
const MARKER_TYPE_COLORS: Record<string, string> = {
  house: "#3b71ca",
  garden: "#007a3d",
  castle: "#7c3aed",
  countryside: "#b45309",
  coast: "#0284c7",
};

function darkenHex(hex: string, pct: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - pct / 100)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - pct / 100)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - pct / 100)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Creates a DOM element for a location marker — type-colored dot, or special pin for visited/wishlisted */
function createMarkerContent(
  category: string | null,
  isSelected: boolean,
  isVisited: boolean,
  isWishlisted: boolean
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "nt-marker-enter";

  // Visited → gold pin with ✓
  if (isVisited) {
    const [fill, stroke, symbol] = ["#D4A843", "#a07020", "✓"];
    wrapper.style.cssText = "filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));";
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="26" height="34">
      <path d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="13" y="14" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">${symbol}</text>
    </svg>`;
    return wrapper;
  }

  // Wishlisted → cyan pin with ★
  if (isWishlisted) {
    const [fill, stroke, symbol] = ["#06b6d4", "#0891b2", "★"];
    wrapper.style.cssText = "filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));";
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="26" height="34">
      <path d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="13" y="14" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="white" font-weight="bold" font-family="sans-serif">${symbol}</text>
    </svg>`;
    return wrapper;
  }

  // Selected → larger green pin
  if (isSelected) {
    wrapper.style.cssText = "filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));";
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="30" height="40">
      <path d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z" fill="#007A3D" stroke="#fff" stroke-width="2"/>
      <circle cx="13" cy="10" r="4" fill="#fff"/>
    </svg>`;
    return wrapper;
  }

  // Default → type-colored dot
  const color = MARKER_TYPE_COLORS[category ?? ""] ?? "#3b71ca";
  const border = darkenHex(color, 20);
  wrapper.style.cssText = "filter: drop-shadow(0 1px 3px rgba(0,0,0,0.35));";
  wrapper.innerHTML = `<div style="width:16px;height:16px;background:${color};border:2.5px solid ${border};border-radius:50%;"></div>`;

  return wrapper;
}

/** Creates a DOM element for a cluster marker */
function createClusterContent(count: number): HTMLDivElement {
  let size = 32;
  let fontSize = 12;
  if (count >= 10) {
    size = 40;
    fontSize = 14;
  }
  if (count >= 25) {
    size = 48;
    fontSize = 16;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "nt-marker-enter";
  wrapper.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#4ade80" stroke="#005a2d" stroke-width="1.5" opacity="0.9"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".35em" fill="#fff" font-family="system-ui,sans-serif" font-weight="bold" font-size="${fontSize}">${count}</text>
  </svg>`;

  return wrapper;
}

export interface LocationData {
  id: number;
  slug: string;
  name: string;
  shortDescription: string | null;
  latitude: string;
  longitude: string;
  region: string | null;
  category: string | null;
  heroImageUrl: string | null;
}

export interface LocationMapProps {
  locations: LocationData[];
  selectedLocationId?: number | null;
  onLocationSelect?: (locationId: number | null) => void;
  visited?: Record<string, { date: string }[]>;
  wishlist?: Record<string, true>;
  onToggleVisited?: (name: string) => void;
  onToggleWishlist?: (name: string) => void;
  className?: string;
}

const UK_CENTER = { lat: 54.0, lng: -2.5 };
const UK_ZOOM = 6;

/** Fits map to show all locations on initial load */
function MapController({ locations }: { locations: LocationData[] }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!map || fitted.current || locations.length === 0) return;
    fitted.current = true;

    if (locations.length === 1) {
      map.setCenter({
        lat: Number(locations[0].latitude),
        lng: Number(locations[0].longitude),
      });
      map.setZoom(12);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => {
      bounds.extend({
        lat: Number(loc.latitude),
        lng: Number(loc.longitude),
      });
    });
    map.fitBounds(bounds, 50);
  }, [map, locations]);

  return null;
}

/** Creates all markers imperatively and groups them with MarkerClusterer */
function ClusteredMarkers({
  locations,
  selectedLocationId,
  onLocationSelect,
  visited,
  wishlist,
  onToggleVisited,
  onToggleWishlist,
}: {
  locations: LocationData[];
  selectedLocationId?: number | null;
  onLocationSelect?: (locationId: number | null) => void;
  visited?: Record<string, { date: string }[]>;
  wishlist?: Record<string, true>;
  onToggleVisited?: (name: string) => void;
  onToggleWishlist?: (name: string) => void;
}) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<
    Map<number, google.maps.marker.AdvancedMarkerElement>
  >(new Map());

  // Create clusterer
  useEffect(() => {
    if (!map || !markerLib) return;

    const renderer = {
      render: ({
        count,
        position,
      }: {
        count: number;
        position: google.maps.LatLng;
      }) => {
        return new google.maps.marker.AdvancedMarkerElement({
          position,
          content: createClusterContent(count),
          zIndex: 1000 + count,
        });
      },
    };

    clustererRef.current = new MarkerClusterer({
      map,
      algorithm: new SuperClusterAlgorithm({ radius: 80, maxZoom: 15 }),
      renderer,
      onClusterClick: (_event, cluster, map) => {
        const currentZoom = map.getZoom() || 0;
        map.panTo(cluster.position);
        map.setZoom(Math.min(currentZoom + 3, 18));
      },
    });

    return () => {
      clustererRef.current?.clearMarkers();
      clustererRef.current?.setMap(null);
      clustererRef.current = null;
    };
  }, [map, markerLib]);

  // Create/update markers when locations change
  useEffect(() => {
    if (!map || !markerLib || !clustererRef.current) return;

    const newMarkers = new Map<
      number,
      google.maps.marker.AdvancedMarkerElement
    >();

    locations.forEach((loc) => {
      const existing = markersRef.current.get(loc.id);
      if (existing) {
        newMarkers.set(loc.id, existing);
        return;
      }

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: {
          lat: Number(loc.latitude),
          lng: Number(loc.longitude),
        },
        content: createMarkerContent(loc.category, false, !!visited?.[loc.name], !!wishlist?.[loc.name]),
        title: loc.name,
      });

      marker.addListener("gmp-click", () => {
        onLocationSelect?.(loc.id);
      });

      newMarkers.set(loc.id, marker);
    });

    // Remove old markers
    markersRef.current.forEach((marker, id) => {
      if (!newMarkers.has(id)) {
        marker.map = null;
      }
    });

    markersRef.current = newMarkers;
    clustererRef.current.clearMarkers();
    clustererRef.current.addMarkers(Array.from(newMarkers.values()));

    return () => {
      newMarkers.forEach((m) => {
        m.map = null;
      });
    };
  }, [map, markerLib, locations, onLocationSelect]);

  // Update marker styles when selection, visited, or wishlist state changes
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      const isSelected = id === selectedLocationId;
      const content = createMarkerContent(
        loc.category,
        isSelected,
        !!visited?.[loc.name],
        !!wishlist?.[loc.name]
      );
      if (isSelected) {
        content.className = "nt-marker-select";
      }
      marker.content = content;
      marker.zIndex = isSelected ? 10000 : null;
    });
  }, [selectedLocationId, locations, visited, wishlist]);

  // Pan to selected location
  useEffect(() => {
    if (!map || !selectedLocationId) return;
    const loc = locations.find((l) => l.id === selectedLocationId);
    if (!loc) return;
    map.panTo({
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
    });
  }, [map, selectedLocationId, locations]);

  // InfoWindow for selected location — desktop only
  const selectedLocation = selectedLocationId
    ? locations.find((l) => l.id === selectedLocationId)
    : null;

  const isDesktop =
    typeof window !== "undefined" && window.innerWidth >= 768;
  if (!isDesktop || !selectedLocation) return null;

  const v = visited?.[selectedLocation.name];
  const w = !!wishlist?.[selectedLocation.name];
  const catConfig = selectedLocation.category ? getCategoryConfig(selectedLocation.category) : null;

  return (
    <InfoWindow
      position={{
        lat: Number(selectedLocation.latitude),
        lng: Number(selectedLocation.longitude),
      }}
      onCloseClick={() => onLocationSelect?.(null)}
      maxWidth={280}
    >
      <div style={{ padding: 2, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {/* Title */}
        <div style={{ fontSize: 15, fontWeight: 600, color: "#222", marginBottom: 4 }}>
          {selectedLocation.name}
        </div>

        {/* Region · Type */}
        <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
          {selectedLocation.region}
          {catConfig && <> · {catConfig.label}</>}
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
          {v && (
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 600,
              padding: "2px 7px", borderRadius: 10,
              background: "#fdf3d8", color: "#a07020", border: "1px solid #e9c66f",
            }}>
              ✓ Visited
            </span>
          )}
          {w && !v && (
            <span style={{
              display: "inline-block", fontSize: 11, fontWeight: 600,
              padding: "2px 7px", borderRadius: 10,
              background: "#ecfeff", color: "#0891b2", border: "1px solid #67e8f9",
            }}>
              ★ Wishlist
            </span>
          )}
        </div>

        {/* Visit dates */}
        {v && v.length > 0 && v.map((entry, i) => (
          <div key={i} style={{ fontSize: 12, color: "#007A3D", fontWeight: 500, marginBottom: 2 }}>
            📅 {new Date(entry.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </div>
        ))}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
          <button
            onClick={() => onToggleVisited?.(selectedLocation.name)}
            style={{
              padding: "6px 14px", borderRadius: 5, border: "none",
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: v ? "#D4A843" : "#007A3D", color: "#fff",
            }}
          >
            {v ? "✎ Edit visits" : "✓ Mark Visited"}
          </button>
          <button
            onClick={() => onToggleWishlist?.(selectedLocation.name)}
            style={{
              padding: "6px 12px", borderRadius: 5,
              border: `1.5px solid #06b6d4`,
              fontSize: 12, fontWeight: 500, cursor: "pointer",
              background: w ? "#06b6d4" : "#fff",
              color: w ? "#fff" : "#06b6d4",
            }}
          >
            {w ? "★ Wishlisted" : "☆ Wishlist"}
          </button>
        </div>

        {/* Parking & Directions */}
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid #eee" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>
            🚗 Parking &amp; Directions
          </div>
          <div style={{ fontSize: 11, color: "#666", lineHeight: 1.5, marginBottom: 6 }}>
            NT car park on site — free for members. Charges apply for non-members.
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "5px 11px", borderRadius: 5,
                border: "1.5px solid #0284c7",
                fontSize: 11, fontWeight: 500, cursor: "pointer",
                background: "#fff", color: "#0284c7",
                textDecoration: "none",
              }}
            >
              📍 Get Directions
            </a>
            <Link
              href={`/locations/${selectedLocation.slug}`}
              style={{
                padding: "5px 11px", borderRadius: 5,
                border: "1.5px solid #007A3D",
                fontSize: 11, fontWeight: 500,
                background: "#007A3D", color: "#fff",
                textDecoration: "none",
              }}
            >
              View Details →
            </Link>
          </div>
        </div>
      </div>
    </InfoWindow>
  );
}

export function LocationMap({
  locations,
  selectedLocationId,
  onLocationSelect,
  visited,
  wishlist,
  onToggleVisited,
  onToggleWishlist,
  className,
}: LocationMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const validLocations = useMemo(
    () =>
      locations.filter(
        (l) =>
          l.latitude &&
          l.longitude &&
          !isNaN(Number(l.latitude)) &&
          !isNaN(Number(l.longitude))
      ),
    [locations]
  );

  if (!apiKey) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground rounded-lg",
          className
        )}
      >
        <p className="text-sm">Map unavailable — API key not configured</p>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full min-h-[400px]", className)}>
      <APIProvider apiKey={apiKey}>
        <GoogleMap
          defaultCenter={UK_CENTER}
          defaultZoom={UK_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "var(--radius-lg, 12px)",
          }}
        >
          <MapController locations={validLocations} />
          <ClusteredMarkers
            locations={validLocations}
            selectedLocationId={selectedLocationId}
            onLocationSelect={onLocationSelect}
            visited={visited}
            wishlist={wishlist}
            onToggleVisited={onToggleVisited}
            onToggleWishlist={onToggleWishlist}
          />
        </GoogleMap>
      </APIProvider>

      {/* Map Legend */}
      <div className="absolute bottom-8 right-3 z-10 rounded-lg bg-white px-4 py-3 text-xs shadow-lg">
        <h4 className="mb-2 font-semibold text-muted-foreground">Property Types</h4>
        {([
          ["#3b71ca", "House & Garden"],
          ["#007a3d", "Garden"],
          ["#7c3aed", "Castle"],
          ["#b45309", "Countryside"],
          ["#0284c7", "Coast"],
        ] as const).map(([color, label]) => (
          <div key={label} className="mb-1 flex items-center gap-2">
            <div className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />
            <span>{label}</span>
          </div>
        ))}
        <div className="mb-1 mt-1.5 flex items-center gap-2 border-t pt-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21" width="14" height="18" className="shrink-0">
            <path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 15 6 15s6-10.5 6-15c0-3.314-2.686-6-6-6z" fill="#D4A843" stroke="#a07020" strokeWidth="1"/>
            <text x="8" y="8" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">✓</text>
          </svg>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21" width="14" height="18" className="shrink-0">
            <path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 15 6 15s6-10.5 6-15c0-3.314-2.686-6-6-6z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1"/>
            <text x="8" y="8" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">★</text>
          </svg>
          <span>Wishlist</span>
        </div>
      </div>
    </div>
  );
}
