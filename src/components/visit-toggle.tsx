"use client";

import { useCallback, useOptimistic, useTransition } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toggleVisit } from "@/actions/visits";

interface VisitToggleProps {
  locationId: number;
  locationName: string;
  initialVisited: boolean;
  isAuthenticated: boolean;
}

const STORAGE_KEY = "nt_visited";

function readLocalVisits(): Record<string, { date: string }[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeLocalVisits(visits: Record<string, { date: string }[]>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
}

export function VisitToggle({
  locationId,
  locationName,
  initialVisited,
  isAuthenticated,
}: VisitToggleProps) {
  const [optimisticVisited, setOptimisticVisited] =
    useOptimistic(initialVisited);
  const [isPending, startTransition] = useTransition();

  const handleToggle = useCallback(() => {
    if (isAuthenticated) {
      startTransition(async () => {
        setOptimisticVisited((prev) => !prev);
        try {
          await toggleVisit({ locationId });
        } catch {
          // Optimistic state automatically reverts when the transition settles
          // because initialVisited (the source of truth) hasn't changed.
        }
      });
    } else {
      const visits = readLocalVisits();
      if (visits[locationName]) {
        delete visits[locationName];
      } else {
        visits[locationName] = [{ date: new Date().toISOString() }];
      }
      writeLocalVisits(visits);
      // Force a re-render by wrapping in a transition with the opposite value
      startTransition(() => {
        setOptimisticVisited((prev) => !prev);
      });
    }
  }, [isAuthenticated, locationId, locationName, setOptimisticVisited]);

  const visited = optimisticVisited;

  return (
    <Button
      variant="outline"
      size="lg"
      disabled={isPending}
      onClick={handleToggle}
      className={cn(
        "cursor-pointer gap-2 transition-colors",
        visited
          ? "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-900"
          : "border-primary text-primary hover:bg-primary/10"
      )}
    >
      {visited && <Check className="size-4" />}
      {visited ? "Visited" : "Mark as Visited"}
    </Button>
  );
}
