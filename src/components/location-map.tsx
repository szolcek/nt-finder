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

/** Creates a DOM element for a location pin marker */
function createPinContent(isSelected: boolean): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "nt-marker-enter";

  if (isSelected) {
    wrapper.style.cssText = "filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));";
    wrapper.innerHTML = `<svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 42C18 42 33 25.5 33 15.5C33 7.49 26.51 1 18 1C9.49 1 3 7.49 3 15.5C3 25.5 18 42 18 42Z" fill="#15803d" stroke="#fff" stroke-width="2.5"/>
      <circle cx="18" cy="15.5" r="5.5" fill="#fff"/>
    </svg>`;
  } else {
    wrapper.style.cssText =
      "filter: drop-shadow(0 1px 1.5px rgba(0,0,0,0.4));";
    wrapper.innerHTML = `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 38C16 38 29 23 29 14C29 6.82 23.18 1 16 1C8.82 1 3 6.82 3 14C3 23 16 38 16 38Z" fill="#166534" stroke="#22c55e" stroke-width="2"/>
      <circle cx="16" cy="14" r="5" fill="#22c55e"/>
    </svg>`;
  }

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
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="#22c55e" stroke="#166534" stroke-width="1.5" opacity="0.9"/>
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
}: {
  locations: LocationData[];
  selectedLocationId?: number | null;
  onLocationSelect?: (locationId: number | null) => void;
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
        content: createPinContent(false),
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

  // Update selected marker style
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const isSelected = id === selectedLocationId;
      const content = createPinContent(isSelected);
      if (isSelected) {
        content.className = "nt-marker-select";
      }
      marker.content = content;
      marker.zIndex = isSelected ? 10000 : null;
    });
  }, [selectedLocationId, locations]);

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

  return (
    <InfoWindow
      position={{
        lat: Number(selectedLocation.latitude),
        lng: Number(selectedLocation.longitude),
      }}
      onCloseClick={() => onLocationSelect?.(null)}
      maxWidth={320}
    >
      <div style={{ padding: 4, fontFamily: "system-ui, sans-serif" }}>
        {selectedLocation.heroImageUrl && (
          <div
            style={{
              aspectRatio: "16/9",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 12,
            }}
          >
            <img
              src={selectedLocation.heroImageUrl}
              alt={selectedLocation.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        <Link
          href={`/locations/${selectedLocation.slug}`}
          style={{ textDecoration: "none" }}
        >
          <h3
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "#1a1a2e",
              margin: 0,
            }}
          >
            {selectedLocation.name}
          </h3>
        </Link>
        {selectedLocation.shortDescription && (
          <p
            style={{
              fontSize: 13,
              color: "#666",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            {selectedLocation.shortDescription}
          </p>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 8,
            fontSize: 13,
            color: "#666",
          }}
        >
          {selectedLocation.region && (
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {selectedLocation.region}
            </span>
          )}
          {selectedLocation.category && (
            <span
              style={{
                background: "#f0fdf4",
                color: "#15803d",
                padding: "2px 8px",
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 500,
              }}
            >
              {selectedLocation.category}
            </span>
          )}
        </div>
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid #eee",
            textAlign: "right",
          }}
        >
          <Link
            href={`/locations/${selectedLocation.slug}`}
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: "#15803d",
              textDecoration: "none",
            }}
          >
            View Details →
          </Link>
        </div>
      </div>
    </InfoWindow>
  );
}

export function LocationMap({
  locations,
  selectedLocationId,
  onLocationSelect,
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
          />
        </GoogleMap>
      </APIProvider>
    </div>
  );
}
