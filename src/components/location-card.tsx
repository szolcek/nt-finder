import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/categories";
import type { LocationData } from "./location-map";

interface LocationCardProps {
  location: LocationData;
  isSelected?: boolean;
  compact?: boolean;
  onSelect?: (id: number) => void;
}

export function LocationCard({
  location,
  isSelected,
  compact,
  onSelect,
}: LocationCardProps) {
  return (
    <div
      className={cn(
        "group cursor-pointer rounded-lg border bg-card transition-all",
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-md"
          : "border-border hover:shadow-sm hover:border-primary/40",
        compact ? "p-3" : "p-0"
      )}
      onClick={() => onSelect?.(location.id)}
    >
      {!compact && location.heroImageUrl && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={location.heroImageUrl}
            alt={location.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}
      <div className={cn(!compact && "p-3")}>
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/locations/${location.slug}`}
            className="text-sm font-semibold hover:text-primary hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {location.name}
          </Link>
          {location.category && (() => {
            const cat = getCategoryConfig(location.category);
            return (
              <Badge variant="outline" className={cn("shrink-0 border-0 text-[11px]", cat.bg, cat.text)}>
                {cat.label}
              </Badge>
            );
          })()}
        </div>
        {!compact && location.shortDescription && (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {location.shortDescription}
          </p>
        )}
        {location.region && (
          <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{location.region}</span>
          </div>
        )}
      </div>
    </div>
  );
}
