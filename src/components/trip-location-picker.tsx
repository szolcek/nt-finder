"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addLocationToTrip, removeLocationFromTrip } from "@/actions/trips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Location {
  id: number;
  name: string;
  region: string | null;
  category: string | null;
}

interface TripLocationPickerProps {
  tripId: number;
  allLocations: Location[];
  currentLocationIds: number[];
}

export function TripLocationPicker({
  tripId,
  allLocations,
  currentLocationIds,
}: TripLocationPickerProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState<number | null>(null);

  const available = useMemo(() => {
    const currentSet = new Set(currentLocationIds);
    let results = allLocations.filter((l) => !currentSet.has(l.id));
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.region?.toLowerCase().includes(q)
      );
    }
    return results.slice(0, 20);
  }, [allLocations, currentLocationIds, search]);

  async function handleAdd(locationId: number) {
    setAdding(locationId);
    try {
      await addLocationToTrip({ tripId, locationId });
      router.refresh();
    } catch {
      // ignore
    } finally {
      setAdding(null);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-3.5 w-3.5" />
        Add Location
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Add a location</span>
        <button
          onClick={() => { setOpen(false); setSearch(""); }}
          className="rounded-full p-1 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search locations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
          autoFocus
        />
      </div>

      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {available.length === 0 ? (
          <p className="py-3 text-center text-xs text-muted-foreground">
            {search ? "No matching locations" : "All locations already added"}
          </p>
        ) : (
          available.map((loc) => (
            <button
              key={loc.id}
              onClick={() => handleAdd(loc.id)}
              disabled={adding === loc.id}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                adding === loc.id && "opacity-50"
              )}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{loc.name}</div>
                {loc.region && (
                  <div className="truncate text-xs text-muted-foreground">
                    {loc.region}
                  </div>
                )}
              </div>
              {adding === loc.id ? (
                <span className="text-xs text-muted-foreground">Adding...</span>
              ) : (
                <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function RemoveLocationButton({
  tripId,
  locationId,
}: {
  tripId: number;
  locationId: number;
}) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeLocationFromTrip(tripId, locationId);
      router.refresh();
    } catch {
      setRemoving(false);
    }
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleRemove();
      }}
      disabled={removing}
      className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      title="Remove from trip"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
