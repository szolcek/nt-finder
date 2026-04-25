import { Suspense } from "react";
import { db } from "@/lib/db";
import { locations, userVisits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LocationsMapView } from "@/components/locations-map-view";
import { auth } from "@/lib/auth";
import { extractOpenings } from "@/lib/opening-hours";

export const metadata = {
  title: "Locations",
  description: "Browse National Trust locations across the UK.",
};

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const [rawLocations, session] = await Promise.all([
    db
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
        openingHours: locations.openingHours,
      })
      .from(locations)
      .where(eq(locations.isPublished, true)),
    auth(),
  ]);

  const allLocations = rawLocations.map(({ openingHours, ...rest }) => {
    const openings = extractOpenings(openingHours);
    return Object.keys(openings).length > 0
      ? { ...rest, openings }
      : rest;
  });

  // Fetch DB visits for authenticated users
  let dbVisits: Record<number, { visitedAt: string }[]> | null = null;
  if (session?.user?.id) {
    const rows = await db
      .select({
        locationId: userVisits.locationId,
        visitedAt: userVisits.visitedAt,
      })
      .from(userVisits)
      .where(eq(userVisits.userId, session.user.id));

    dbVisits = {};
    for (const row of rows) {
      if (!dbVisits[row.locationId]) dbVisits[row.locationId] = [];
      dbVisits[row.locationId].push({ visitedAt: row.visitedAt.toISOString() });
    }
  }

  return (
    <Suspense>
      <LocationsMapView
        locations={allLocations}
        dbVisits={dbVisits}
        isAuthenticated={!!session?.user?.id}
      />
    </Suspense>
  );
}
