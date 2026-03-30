"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { trips, tripLocations } from "@/lib/db/schema";
import {
  createTripSchema,
  updateTripSchema,
  addTripLocationSchema,
} from "@/lib/validators";
import { eq, and } from "drizzle-orm";

export async function createTrip(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = createTripSchema.parse(input);

  const [trip] = await db
    .insert(trips)
    .values({
      userId: session.user.id,
      name: data.name,
      description: data.description,
      tripDate: data.tripDate,
      status: data.status,
    })
    .returning();

  return trip;
}

export async function updateTrip(tripId: number, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = updateTripSchema.parse(input);

  const [trip] = await db
    .update(trips)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)))
    .returning();

  return trip;
}

export async function deleteTrip(tripId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)));
}

export async function addLocationToTrip(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = addTripLocationSchema.parse(input);

  // Verify the trip belongs to the user
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, data.tripId), eq(trips.userId, session.user.id)));

  if (!trip) throw new Error("Trip not found");

  const [tripLocation] = await db
    .insert(tripLocations)
    .values({
      tripId: data.tripId,
      locationId: data.locationId,
      visitOrder: data.visitOrder,
      notes: data.notes,
    })
    .returning();

  return tripLocation;
}

export async function removeLocationFromTrip(
  tripId: number,
  locationId: number
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify ownership
  const [trip] = await db
    .select()
    .from(trips)
    .where(and(eq(trips.id, tripId), eq(trips.userId, session.user.id)));

  if (!trip) throw new Error("Trip not found");

  await db
    .delete(tripLocations)
    .where(
      and(
        eq(tripLocations.tripId, tripId),
        eq(tripLocations.locationId, locationId)
      )
    );
}
