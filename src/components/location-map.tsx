"use client";

import { useEffect, useMemo, useRef, useCallback, useState } from "react";
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
    @keyframes nt-marker-drop {
      0% { opacity: 0; transform: translateY(-30px) scale(0.6); }
      60% { opacity: 1; transform: translateY(4px) scale(1.05); }
      80% { transform: translateY(-2px) scale(0.98); }
      100% { opacity: 1; transform: translateY(0) scale(1); }
    }
    .nt-marker-drop {
      animation: nt-marker-drop 500ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }
    /* Tighten InfoWindow chrome */
    .gm-style-iw-d { overflow: visible !important; padding: 0 !important; }
    .gm-style .gm-style-iw { padding: 0 !important; }
    .gm-style .gm-style-iw-tc::after { background: #fff; }
  `;
  document.head.appendChild(style);
}

const TYPE_ICONS: Record<string, string> = {
  house: "🏠",
  garden: "🌳",
  castle: "🏰",
  countryside: "🏞️",
  coast: "🏖️",
  "historic-site": "🏛️",
};

/** Marker color map matching the source project */
const MARKER_TYPE_COLORS: Record<string, string> = {
  house: "#3b71ca",
  garden: "#007a3d",
  castle: "#7c3aed",
  countryside: "#b45309",
  coast: "#0284c7",
  "historic-site": "#be123c",
};

function darkenHex(hex: string, pct: number): string {
  const r = Math.max(0, Math.round(parseInt(hex.slice(1, 3), 16) * (1 - pct / 100)));
  const g = Math.max(0, Math.round(parseInt(hex.slice(3, 5), 16) * (1 - pct / 100)));
  const b = Math.max(0, Math.round(parseInt(hex.slice(5, 7), 16) * (1 - pct / 100)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Marker size scales with zoom: small dots when zoomed out, larger with border when zoomed in */
function markerSize(zoom: number, isSelected: boolean): { size: number; border: number } {
  if (isSelected) {
    const s = zoom <= 7 ? 18 : zoom <= 10 ? 22 : zoom <= 13 ? 26 : 30;
    return { size: s, border: 3 };
  }
  //            z≤7  z8-10  z11-13  z14+
  const s = zoom <= 7 ? 18 : zoom <= 10 ? 24 : zoom <= 13 ? 28 : 32;
  const b = zoom <= 7 ? 2.5 : zoom <= 10 ? 3 : 3.5;
  return { size: s, border: b };
}

/** Creates a DOM element for a location marker — type-colored dot, or special pin for visited/wishlisted */
function createMarkerContent(
  category: string | null,
  isSelected: boolean,
  isVisited: boolean,
  isWishlisted: boolean,
  zoom: number = 6
): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "nt-marker-enter";

  const { size, border } = markerSize(zoom, false);
  // Scale pins proportionally with zoom
  const pinScale = zoom <= 7 ? 0.7 : zoom <= 10 ? 0.85 : zoom <= 13 ? 1 : 1.15;
  const pinW = Math.round(26 * pinScale);
  const pinH = Math.round(34 * pinScale);
  const fontSize = Math.round(11 * pinScale);

  // Visited → gold pin with ✓ — 20% larger than other pins for emphasis
  if (isVisited) {
    const vW = Math.round(pinW * 1.2);
    const vH = Math.round(pinH * 1.2);
    const vFont = Math.round(fontSize * 1.15);
    wrapper.style.cssText = "filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));";
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="${vW}" height="${vH}">
      <path d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z" fill="#c79b1a" stroke="#fff" stroke-width="2"/>
      <text x="13" y="13" text-anchor="middle" dominant-baseline="middle" font-size="${vFont}" fill="white" font-weight="bold" font-family="sans-serif">✓</text>
    </svg>`;
    return wrapper;
  }

  // Wishlisted → cyan pin with ★
  if (isWishlisted) {
    const [fill, stroke, symbol] = ["#06b6d4", "#0891b2", "★"];
    wrapper.style.cssText = "filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45));";
    wrapper.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 34" width="${pinW}" height="${pinH}">
      <path d="M13 0C7.477 0 3 4.477 3 10c0 7.5 10 24 10 24S23 17.5 23 10c0-5.523-4.477-10-10-10z" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
      <text x="13" y="14" text-anchor="middle" dominant-baseline="middle" font-size="${fontSize}" fill="white" font-weight="bold" font-family="sans-serif">${symbol}</text>
    </svg>`;
    return wrapper;
  }

  // Selected → enlarged circle with white ring
  if (isSelected) {
    const { size: selSize } = markerSize(zoom, true);
    const color = MARKER_TYPE_COLORS[category ?? ""] ?? "#3b71ca";
    wrapper.style.cssText = "filter: drop-shadow(0 2px 6px rgba(0,0,0,0.45));";
    wrapper.innerHTML = `<div style="width:${selSize}px;height:${selSize}px;background:${color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 2px ${color};"></div>`;
    return wrapper;
  }

  // Default → type-colored dot with white border for visibility + 44px touch target
  const color = MARKER_TYPE_COLORS[category ?? ""] ?? "#3b71ca";
  const tapSize = Math.max(44, size);
  wrapper.style.cssText = `filter: drop-shadow(0 1px 3px rgba(0,0,0,0.45)); display:flex; align-items:center; justify-content:center; width:${tapSize}px; height:${tapSize}px;`;
  wrapper.innerHTML = `<div style="width:${size}px;height:${size}px;background:${color};border:${border}px solid rgba(255,255,255,0.9);border-radius:50%;"></div>`;

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
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onCameraChanged?: (center: { lat: number; lng: number }, zoom: number) => void;
  userLocation?: { lat: number; lng: number } | null;
  nearMeRadius?: number; // miles
  categoryFilter?: string;
  onCategoryFilter?: (category: string) => void;
  viewFilter?: string;
  className?: string;
}

const UK_CENTER = { lat: 54.0, lng: -2.5 };
const UK_ZOOM = 6;

/** When the view filter changes (e.g. "Visited"), fit the map to the new set of markers with a bounce */
function FitBoundsOnFilter({ locations, viewFilter }: { locations: LocationData[]; viewFilter?: string }) {
  const map = useMap();
  const prevFilter = useRef(viewFilter);

  useEffect(() => {
    if (!map || prevFilter.current === viewFilter) return;
    prevFilter.current = viewFilter;

    if (!viewFilter || viewFilter === "all" || locations.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    locations.forEach((loc) => {
      bounds.extend({ lat: Number(loc.latitude), lng: Number(loc.longitude) });
    });

    if (locations.length === 1) {
      map.panTo({ lat: Number(locations[0].latitude), lng: Number(locations[0].longitude) });
      map.setZoom(12);
    } else {
      map.fitBounds(bounds, 80);
    }
  }, [map, locations, viewFilter]);

  return null;
}

/** Fits map to show all locations on initial load — skips if initial position was provided */
function MapController({ locations, skipFit }: { locations: LocationData[]; skipFit?: boolean }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!map || fitted.current || locations.length === 0 || skipFit) return;
    fitted.current = true;

    // On mobile, the default UK_CENTER/UK_ZOOM is already a good fit — skip fitBounds to avoid jarring zoom
    if (window.innerWidth < 768) return;

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
  }, [map, locations, skipFit]);

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
  viewFilter,
}: {
  locations: LocationData[];
  selectedLocationId?: number | null;
  onLocationSelect?: (locationId: number | null) => void;
  visited?: Record<string, { date: string }[]>;
  wishlist?: Record<string, true>;
  onToggleVisited?: (name: string) => void;
  onToggleWishlist?: (name: string) => void;
  viewFilter?: string;
}) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<
    Map<number, google.maps.marker.AdvancedMarkerElement>
  >(new Map());
  const zoomRef = useRef(6);
  const prevViewFilter = useRef(viewFilter);

  // Track zoom and re-render markers when zoom bracket changes
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("zoom_changed", () => {
      const newZoom = map.getZoom() || 6;
      const oldBracket = zoomRef.current <= 7 ? 0 : zoomRef.current <= 10 ? 1 : zoomRef.current <= 13 ? 2 : 3;
      const newBracket = newZoom <= 7 ? 0 : newZoom <= 10 ? 1 : newZoom <= 13 ? 2 : 3;
      zoomRef.current = newZoom;
      if (oldBracket !== newBracket) {
        // Update all marker contents at new size
        markersRef.current.forEach((marker, id) => {
          const loc = locations.find((l) => l.id === id);
          if (!loc) return;
          const isSelected = id === selectedLocationId;
          marker.content = createMarkerContent(
            loc.category, isSelected,
            !!visited?.[loc.name], !!wishlist?.[loc.name],
            newZoom
          );
        });
      }
    });
    return () => google.maps.event.removeListener(listener);
  }, [map, locations, selectedLocationId, visited, wishlist]);

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
        onLocationSelect?.(null);
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
        content: createMarkerContent(loc.category, false, !!visited?.[loc.name], !!wishlist?.[loc.name], zoomRef.current),
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

    // Staggered drop animation when view filter changes
    const filterChanged = prevViewFilter.current !== viewFilter;
    if (filterChanged && viewFilter && viewFilter !== "all") {
      prevViewFilter.current = viewFilter;
      let i = 0;
      newMarkers.forEach((marker) => {
        const el = marker.content as HTMLElement;
        if (el) {
          el.className = "";
          el.style.opacity = "0";
          const delay = Math.min(i * 40, 800);
          setTimeout(() => {
            el.style.opacity = "";
            el.className = "nt-marker-drop";
          }, delay);
          i++;
        }
      });
    } else if (filterChanged) {
      prevViewFilter.current = viewFilter;
    }

    markersRef.current = newMarkers;
    clustererRef.current.clearMarkers();
    clustererRef.current.addMarkers(Array.from(newMarkers.values()));

    return () => {
      newMarkers.forEach((m) => {
        m.map = null;
      });
    };
  }, [map, markerLib, locations, onLocationSelect, viewFilter]);

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
        !!wishlist?.[loc.name],
        zoomRef.current
      );
      if (isSelected) {
        content.className = "nt-marker-select";
      }
      marker.content = content;
      marker.zIndex = isSelected ? 10000 : null;
    });
  }, [selectedLocationId, locations, visited, wishlist]);

  // Pan to selected location — only when selection changes
  const prevSelectedRef = useRef<number | null | undefined>(null);
  useEffect(() => {
    if (!map || !selectedLocationId) return;
    if (prevSelectedRef.current === selectedLocationId) return;
    prevSelectedRef.current = selectedLocationId;
    const loc = locations.find((l) => l.id === selectedLocationId);
    if (!loc) return;
    map.panTo({
      lat: Number(loc.latitude),
      lng: Number(loc.longitude),
    });
  }, [map, selectedLocationId, locations]);

  // InfoWindow for selected location
  const selectedLocation = selectedLocationId
    ? locations.find((l) => l.id === selectedLocationId)
    : null;

  if (!selectedLocation) return null;

  const v = visited?.[selectedLocation.name];
  const w = !!wishlist?.[selectedLocation.name];
  const catConfig = selectedLocation.category ? getCategoryConfig(selectedLocation.category) : null;

  const hasImage = !!selectedLocation.heroImageUrl;
  const catColor = MARKER_TYPE_COLORS[selectedLocation.category ?? ""] ?? "#3b71ca";

  return (
    <InfoWindow
      position={{
        lat: Number(selectedLocation.latitude),
        lng: Number(selectedLocation.longitude),
      }}
      onCloseClick={() => onLocationSelect?.(null)}
      headerDisabled
      pixelOffset={[0, -10]}
      maxWidth={320}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", minWidth: 240 }}
      >
        {/* ── Image hero ── */}
        {hasImage && (
          <div style={{
            position: "relative", height: 150,
            overflow: "hidden", marginBottom: 12,
          }}>
            <img
              src={selectedLocation.heroImageUrl!}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(15,15,15,0.85) 0%, rgba(15,15,15,0.25) 45%, transparent 70%)",
            }} />
            {/* Top row: category pill (left) + close button (right) */}
            <div style={{
              position: "absolute", top: 8, left: 10, right: 10,
              display: "flex", justifyContent: "space-between", alignItems: "flex-start",
            }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {catConfig && (
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: 0.6,
                    padding: "3px 8px", borderRadius: 4,
                    background: "rgba(0,0,0,0.45)", color: "#fff",
                    backdropFilter: "blur(8px)",
                    textTransform: "uppercase",
                    borderLeft: `3px solid ${catColor}`,
                  }}>
                    {catConfig.label}
                  </span>
                )}
                {v && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                    background: "rgba(212,168,67,0.92)", color: "#fff",
                    backdropFilter: "blur(4px)",
                  }}>✓ Visited</span>
                )}
                {w && !v && (
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                    background: "rgba(13,148,136,0.92)", color: "#fff",
                    backdropFilter: "blur(4px)",
                  }}>★ Wishlist</span>
                )}
              </div>
              {/* Custom close button */}
              <button
                onClick={() => onLocationSelect?.(null)}
                style={{
                  width: 26, height: 26, borderRadius: 6,
                  border: "none", cursor: "pointer",
                  background: "rgba(0,0,0,0.45)", color: "#fff",
                  backdropFilter: "blur(8px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 400, lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            {/* Name + region on image */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 12px 10px" }}>
              <div style={{
                fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.15,
                letterSpacing: -0.4,
              }}>
                {selectedLocation.name}
              </div>
              <div style={{
                fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 3,
                fontWeight: 500, letterSpacing: 0.1,
              }}>
                📍 {selectedLocation.region}
              </div>
            </div>
          </div>
        )}

        {/* ── No-image header ── */}
        {!hasImage && (
          <div style={{ marginBottom: 12, padding: "12px 12px 0" }}>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "2px 0",
            }}>
              <div style={{
                width: 4, alignSelf: "stretch", borderRadius: 2,
                background: `linear-gradient(to bottom, ${catColor}, ${catColor}88)`,
                flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{
                    fontSize: 17, fontWeight: 700, color: "#1a1a1a",
                    lineHeight: 1.2, letterSpacing: -0.3,
                  }}>
                    {selectedLocation.name}
                  </div>
                  <button
                    onClick={() => onLocationSelect?.(null)}
                    style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: "1px solid #e0e0e0", cursor: "pointer",
                      background: "#f5f5f5", color: "#999",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, lineHeight: 1,
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>
                  📍 {selectedLocation.region}
                  {catConfig && (
                    <span style={{ color: catColor, fontWeight: 600 }}> · {catConfig.label}</span>
                  )}
                </div>
                {(v || (w && !v)) && (
                  <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                    {v && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: "#fef9ee", color: "#92700c", border: "1px solid #e5cc6c",
                      }}>✓ Visited</span>
                    )}
                    {w && !v && (
                      <span style={{
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10,
                        background: "#f0fdfa", color: "#0d9488", border: "1px solid #99f6e4",
                      }}>★ Wishlist</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Primary CTA: View Details ── */}
        <div style={{ padding: "0 12px 12px" }}>
        <Link
          href={`/locations/${selectedLocation.slug}`}
          className="info-window-cta"
          style={{
            display: "block", textAlign: "center",
            padding: "9px 0", borderRadius: 8,
            background: "#0d9488", color: "#fff",
            fontSize: 13, fontWeight: 600, letterSpacing: 0.1,
            textDecoration: "none",
            boxShadow: "0 1px 3px rgba(0,122,61,0.25)",
          }}
        >
          View Details
        </Link>

        {/* ── Secondary actions row ── */}
        <div style={{
          display: "flex", gap: 6, marginTop: 8,
        }}>
          <button
            onClick={() => onToggleVisited?.(selectedLocation.name)}
            style={{
              flex: 1, padding: "7px 0", borderRadius: 6,
              border: v ? "1.5px solid #d4a843" : "1.5px solid #ddd",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
              background: v ? "#fef9ee" : "#fff",
              color: v ? "#92700c" : "#555",
            }}
          >
            {v ? "✓ Visited" : "☐ Mark Visited"}
          </button>
          <button
            onClick={() => onToggleWishlist?.(selectedLocation.name)}
            style={{
              padding: "7px 12px", borderRadius: 6,
              border: w ? "1.5px solid #0d9488" : "1.5px solid #ddd",
              fontSize: 13, cursor: "pointer",
              background: w ? "#f0fdfa" : "#fff",
              color: w ? "#0d9488" : "#bbb",
            }}
            title={w ? "Remove from wishlist" : "Add to wishlist"}
          >
            {w ? "★" : "☆"}
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "7px 12px", borderRadius: 6,
              border: "1.5px solid #ddd",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, background: "#fff", color: "#888",
              textDecoration: "none",
            }}
            title="Get directions"
          >
            🧭
          </a>
        </div>
        </div>
      </div>
    </InfoWindow>
  );
}

/** Draws a pulsing blue dot for user location and a radius circle */
function UserLocationOverlay({
  position,
  radiusMiles,
}: {
  position: { lat: number; lng: number };
  radiusMiles: number;
}) {
  const map = useMap();
  const markerLib = useMapsLibrary("marker");
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const circleRef = useRef<google.maps.Circle | null>(null);

  // Create/update marker
  useEffect(() => {
    if (!map || !markerLib) return;

    if (!markerRef.current) {
      const el = document.createElement("div");
      el.innerHTML = `<div style="
        width:16px;height:16px;background:#4285F4;border:3px solid #fff;
        border-radius:50%;box-shadow:0 0 0 2px rgba(66,133,244,0.3), 0 2px 6px rgba(0,0,0,0.3);
      "></div>`;
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: el,
        zIndex: 9999,
      });
    } else {
      markerRef.current.position = position;
    }

    return () => {
      if (markerRef.current) {
        markerRef.current.map = null;
        markerRef.current = null;
      }
    };
  }, [map, markerLib, position]);

  // Create/update circle
  useEffect(() => {
    if (!map) return;
    const radiusMeters = radiusMiles * 1609.34;

    if (!circleRef.current) {
      circleRef.current = new google.maps.Circle({
        map,
        center: position,
        radius: radiusMeters,
        fillColor: "#4285F4",
        fillOpacity: 0.08,
        strokeColor: "#4285F4",
        strokeOpacity: 0.4,
        strokeWeight: 2,
      });
    } else {
      circleRef.current.setCenter(position);
      circleRef.current.setRadius(radiusMeters);
    }

    return () => {
      if (circleRef.current) {
        circleRef.current.setMap(null);
        circleRef.current = null;
      }
    };
  }, [map, position, radiusMiles]);

  // Fit map to circle bounds
  useEffect(() => {
    if (!map || !circleRef.current) return;
    const bounds = circleRef.current.getBounds();
    if (bounds) map.fitBounds(bounds, 40);
  }, [map, radiusMiles, position]);

  return null;
}

const LEGEND_ITEMS: { key: string; color: string; label: string }[] = [
  { key: "house", color: "#3b71ca", label: "House & Garden" },
  { key: "garden", color: "#007a3d", label: "Garden" },
  { key: "castle", color: "#7c3aed", label: "Castle" },
  { key: "countryside", color: "#b45309", label: "Countryside" },
  { key: "coast", color: "#0284c7", label: "Coast" },
];

function MapLegend({
  categoryFilter,
  onCategoryFilter,
}: {
  categoryFilter?: string;
  onCategoryFilter?: (category: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="absolute bottom-8 left-3 z-10 rounded-lg bg-white text-xs shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-4 py-2.5 font-semibold text-muted-foreground md:hidden"
      >
        <span>Key</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("transition-transform", open ? "rotate-180" : "")}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div className={cn(
        "px-4 pb-3 md:block",
        open ? "block" : "hidden",
      )}>
        <h4 className="mb-2 font-semibold text-muted-foreground hidden md:block pt-3">Property Types</h4>
        {LEGEND_ITEMS.map(({ key, color, label }) => {
          const isActive = !categoryFilter || categoryFilter === "all" || categoryFilter === key;
          return (
            <button
              key={key}
              onClick={() => onCategoryFilter?.(categoryFilter === key ? "all" : key)}
              className={cn(
                "mb-1 flex w-full items-center gap-2 rounded px-1 -mx-1 py-0.5 transition-opacity",
                isActive ? "opacity-100" : "opacity-30",
                onCategoryFilter && "hover:bg-muted cursor-pointer",
              )}
            >
              <div className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: color }} />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
        <div className="mt-1.5 border-t pt-1.5">
          <div className="mb-1 flex items-center gap-2 px-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21" width="14" height="18" className="shrink-0">
              <path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 15 6 15s6-10.5 6-15c0-3.314-2.686-6-6-6z" fill="#D4A843" stroke="#a07020" strokeWidth="1"/>
              <text x="8" y="8" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">✓</text>
            </svg>
            <span>Visited</span>
          </div>
          <div className="flex items-center gap-2 px-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 21" width="14" height="18" className="shrink-0">
              <path d="M8 0C4.686 0 2 2.686 2 6c0 4.5 6 15 6 15s6-10.5 6-15c0-3.314-2.686-6-6-6z" fill="#06b6d4" stroke="#0891b2" strokeWidth="1"/>
              <text x="8" y="8" textAnchor="middle" dominantBaseline="middle" fontSize="7" fill="white" fontWeight="bold" fontFamily="sans-serif">★</text>
            </svg>
            <span>Wishlist</span>
          </div>
        </div>
      </div>
    </div>
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
  initialCenter,
  initialZoom,
  onCameraChanged,
  userLocation,
  nearMeRadius,
  categoryFilter,
  onCategoryFilter,
  viewFilter,
  className,
}: LocationMapProps) {
  const hasInitialPosition = !!(initialCenter && initialZoom);
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
          defaultCenter={initialCenter ?? UK_CENTER}
          defaultZoom={initialZoom ?? UK_ZOOM}
          gestureHandling="greedy"
          disableDefaultUI
          zoomControl
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID}
          onClick={() => onLocationSelect?.(null)}
          onDragstart={() => onLocationSelect?.(null)}
          onTilesLoaded={() => {
            console.log("[Map] tilesloaded event fired", Date.now());
            window.dispatchEvent(new Event("map-tiles-loaded"));
          }}
          onCameraChanged={(ev) => {
            const c = ev.detail.center;
            onCameraChanged?.({ lat: c.lat, lng: c.lng }, ev.detail.zoom);
          }}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "var(--radius-lg, 12px)",
          }}
        >
          <MapController locations={validLocations} skipFit={hasInitialPosition || !!userLocation} />
          <FitBoundsOnFilter locations={validLocations} viewFilter={viewFilter} />
          {userLocation && nearMeRadius && (
            <UserLocationOverlay position={userLocation} radiusMiles={nearMeRadius} />
          )}
          <ClusteredMarkers
            locations={validLocations}
            selectedLocationId={selectedLocationId}
            onLocationSelect={onLocationSelect}
            visited={visited}
            wishlist={wishlist}
            onToggleVisited={onToggleVisited}
            onToggleWishlist={onToggleWishlist}
            viewFilter={viewFilter}
          />
        </GoogleMap>
      </APIProvider>

      {/* Map Legend */}
      <MapLegend categoryFilter={categoryFilter} onCategoryFilter={onCategoryFilter} />
    </div>
  );
}
