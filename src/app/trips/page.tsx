import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, tripLocations, locations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Calendar } from "lucide-react";

export const metadata = {
  title: "My Trips",
};

export default async function TripsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userTrips = await db
    .select({
      id: trips.id,
      name: trips.name,
      description: trips.description,
      tripDate: trips.tripDate,
      status: trips.status,
      createdAt: trips.createdAt,
      locationCount: sql<number>`count(${tripLocations.id})`.as(
        "location_count"
      ),
    })
    .from(trips)
    .leftJoin(tripLocations, eq(trips.id, tripLocations.tripId))
    .where(eq(trips.userId, session.user.id))
    .groupBy(trips.id)
    .orderBy(sql`${trips.createdAt} desc`);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Trips</h1>
          <p className="mt-2 text-muted-foreground">
            Plan future visits and record your past adventures.
          </p>
        </div>
        <Button render={<Link href="/trips/new" />} nativeButton={false}>
          <Plus className="mr-2 h-4 w-4" />
          New Trip
        </Button>
      </div>

      {userTrips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t created any trips yet.
            </p>
            <Button render={<Link href="/trips/new" />} nativeButton={false} className="mt-4">
              Create your first trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {userTrips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{trip.name}</CardTitle>
                    <Badge
                      variant={
                        trip.status === "visited" ? "default" : "secondary"
                      }
                    >
                      {trip.status}
                    </Badge>
                  </div>
                  {trip.description && (
                    <CardDescription>{trip.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {trip.locationCount}{" "}
                      {trip.locationCount === 1 ? "location" : "locations"}
                    </span>
                    {trip.tripDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(trip.tripDate).toLocaleDateString("en-GB")}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
