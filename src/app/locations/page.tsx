import { Suspense } from "react";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LocationsMapView } from "@/components/locations-map-view";

export const metadata = {
  title: "Locations",
  description: "Browse National Trust locations across the UK.",
};

export const revalidate = 3600;

export default async function LocationsPage() {
  const allLocations = await db
    .select({
      id: locations.id,
      slug: locations.slug,
      name: locations.name,
      shortDescription: locations.shortDescription,
      latitude: locations.latitude,
      longitude: locations.longitude,
      region: locations.region,
      category: locations.category,
      heroImageUrl: locations.heroImageUrl,
    })
    .from(locations)
    .where(eq(locations.isPublished, true));

  return (
    <Suspense>
      <LocationsMapView locations={allLocations} />
    </Suspense>
  );
}
