import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  trips,
  tripLocations,
  locations,
  photos,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Calendar } from "lucide-react";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const tripId = parseInt(id, 10);
  if (isNaN(tripId)) notFound();

  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)));

  if (!trip) notFound();

  const [tripLocs, tripPhotos] = await Promise.all([
    db
      .select({
        id: tripLocations.id,
        visitOrder: tripLocations.visitOrder,
        notes: tripLocations.notes,
        location: {
          id: locations.id,
          slug: locations.slug,
          name: locations.name,
          shortDescription: locations.shortDescription,
          region: locations.region,
          category: locations.category,
        },
      })
      .from(tripLocations)
      .innerJoin(locations, eq(tripLocations.locationId, locations.id))
      .where(eq(tripLocations.tripId, tripId))
      .orderBy(tripLocations.visitOrder),
    db
      .select()
      .from(photos)
      .where(eq(photos.tripId, tripId)),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{trip.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge
              variant={trip.status === "visited" ? "default" : "secondary"}
            >
              {trip.status}
            </Badge>
            {trip.tripDate && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(trip.tripDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>

      {trip.description && (
        <p className="mb-6 text-muted-foreground">{trip.description}</p>
      )}

      <Separator className="my-6" />

      <h2 className="mb-4 text-xl font-semibold">
        Locations ({tripLocs.length})
      </h2>

      {tripLocs.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No locations added to this trip yet. Browse{" "}
          <Link href="/locations" className="underline">
            locations
          </Link>{" "}
          to add some.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {tripLocs.map((tl) => (
            <Link key={tl.id} href={`/locations/${tl.location.slug}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {tl.location.name}
                    </CardTitle>
                    {tl.location.category && (
                      <Badge variant="secondary" className="text-xs">
                        {tl.location.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {tl.location.region && (
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {tl.location.region}
                    </span>
                  )}
                  {tl.notes && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {tl.notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {tripPhotos.length > 0 && (
        <>
          <Separator className="my-6" />
          <h2 className="mb-4 text-xl font-semibold">
            Photos ({tripPhotos.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {tripPhotos.map((photo) => (
              <div
                key={photo.id}
                className="aspect-square overflow-hidden rounded-lg"
              >
                <img
                  src={photo.url}
                  alt={photo.caption ?? "Trip photo"}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
