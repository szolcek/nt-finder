"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, locations } from "@/lib/db/schema";
import { createReviewSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin";

export async function createReview(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = createReviewSchema.parse(input);

  const [review] = await db
    .insert(reviews)
    .values({
      userId: session.user.id,
      locationId: data.locationId,
      rating: data.rating,
      title: data.title,
      body: data.body,
      tip: data.tip,
      visitDate: data.visitDate,
      isPublished: isAdmin(session),
    })
    .returning();

  // Revalidate the location page to show the new review
  const [loc] = await db
    .select({ slug: locations.slug })
    .from(locations)
    .where(eq(locations.id, data.locationId));
  if (loc) revalidatePath(`/locations/${loc.slug}`);

  return review;
}

export async function updateReview(reviewId: number, input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = createReviewSchema.parse(input);

  const [review] = await db
    .update(reviews)
    .set({
      rating: data.rating,
      title: data.title,
      body: data.body,
      tip: data.tip,
      visitDate: data.visitDate,
      isPublished: isAdmin(session),
      updatedAt: new Date(),
    })
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)))
    .returning();

  if (review) {
    const [loc] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, data.locationId));
    if (loc) revalidatePath(`/locations/${loc.slug}`);
  }

  return review;
}

export async function deleteReview(reviewId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)));
}
