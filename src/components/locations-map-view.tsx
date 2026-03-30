"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { LocationMap, type LocationData } from "./location-map";
import { LocationCard } from "./location-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Map, List, X, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface LocationsMapViewProps {
  locations: LocationData[];
}

export function LocationsMapView({ locations }: LocationsMapViewProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"map" | "list">("map");
  const [sheetOpen, setSheetOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = locations.filter((loc) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.shortDescription?.toLowerCase().includes(q) ||
      loc.region?.toLowerCase().includes(q)
    );
  });

  // Scroll selected card into view in sidebar
  useEffect(() => {
    if (!selectedId || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-location-id="${selectedId}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [selectedId]);

  const handleSelect = useCallback((id: number | null) => {
    setSelectedId(id);
    // On mobile, open the bottom sheet when a marker is tapped
    if (id && window.innerWidth < 768) {
      setSheetOpen(true);
    }
  }, []);

  const selectedLocation = selectedId
    ? filtered.find((l) => l.id === selectedId)
    : null;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Mobile toggle */}
      <div className="flex items-center gap-2 border-b px-4 py-2 md:hidden">
        <Button
          variant={view === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("map")}
        >
          <Map className="mr-1.5 h-3.5 w-3.5" />
          Map
        </Button>
        <Button
          variant={view === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setView("list")}
        >
          <List className="mr-1.5 h-3.5 w-3.5" />
          List
        </Button>
        <span className="ml-auto text-xs text-muted-foreground">
          {filtered.length} locations
        </span>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden w-[380px] shrink-0 flex-col border-r md:flex">
          <div className="border-b p-3">
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {filtered.length} locations
            </p>
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {filtered.map((loc) => (
              <div key={loc.id} data-location-id={loc.id}>
                <LocationCard
                  location={loc}
                  isSelected={loc.id === selectedId}
                  onSelect={handleSelect}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Map — always rendered, visibility toggled on mobile */}
        <div
          className={cn(
            "flex-1",
            view !== "map" && "hidden md:block"
          )}
        >
          <LocationMap
            locations={filtered}
            selectedLocationId={selectedId}
            onLocationSelect={handleSelect}
            className="h-full"
          />
        </div>

        {/* Mobile list view */}
        <div
          className={cn(
            "flex-1 flex-col md:hidden",
            view === "list" ? "flex" : "hidden"
          )}
        >
          <div className="border-b p-3">
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {filtered.map((loc) => (
              <div key={loc.id}>
                <LocationCard
                  location={loc}
                  onSelect={(id) => {
                    setSelectedId(id);
                    setView("map");
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile bottom sheet — selected location card overlay */}
        {view === "map" && selectedLocation && (
          <div className="absolute inset-x-0 bottom-0 z-10 md:hidden">
            <div className="mx-3 mb-3 rounded-lg border bg-card shadow-lg">
              <div className="flex items-center justify-between border-b px-3 py-2">
                <div className="flex items-center gap-2">
                  <GripHorizontal className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    Selected location
                  </span>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="rounded-full p-1 hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <LocationCard
                location={selectedLocation}
                isSelected
                compact
                onSelect={() => {}}
              />
              <div className="border-t px-3 py-2">
                <Button
                  render={
                    <a href={`/locations/${selectedLocation.slug}`} />
                  }
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
