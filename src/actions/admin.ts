"use server";

import { auth } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { reviews, photos, users, locations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sql } from "drizzle-orm";

export async function getPendingReviews() {
  const session = await auth();
  await requireAdmin(session);

  return db
    .select({
      id: reviews.id,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      tip: reviews.tip,
      visitDate: reviews.visitDate,
      createdAt: reviews.createdAt,
      user: {
        name: users.name,
        email: users.email,
        image: users.image,
      },
      location: {
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
      },
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.userId, users.id))
    .innerJoin(locations, eq(reviews.locationId, locations.id))
    .where(eq(reviews.isPublished, false))
    .orderBy(sql`${reviews.createdAt} desc`);
}

export async function getPendingPhotos() {
  const session = await auth();
  await requireAdmin(session);

  return db
    .select({
      id: photos.id,
      url: photos.url,
      caption: photos.caption,
      createdAt: photos.createdAt,
      user: {
        name: users.name,
        email: users.email,
        image: users.image,
      },
      location: {
        id: locations.id,
        name: locations.name,
        slug: locations.slug,
      },
    })
    .from(photos)
    .innerJoin(users, eq(photos.userId, users.id))
    .leftJoin(locations, eq(photos.locationId, locations.id))
    .where(eq(photos.isApproved, false))
    .orderBy(sql`${photos.createdAt} desc`);
}

export async function approveReview(reviewId: number) {
  const session = await auth();
  await requireAdmin(session);

  const [review] = await db
    .update(reviews)
    .set({ isPublished: true })
    .where(eq(reviews.id, reviewId))
    .returning({ locationId: reviews.locationId });

  if (review) {
    const [loc] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, review.locationId));
    if (loc) revalidatePath(`/locations/${loc.slug}`);
  }
}

export async function rejectReview(reviewId: number) {
  const session = await auth();
  await requireAdmin(session);

  const [review] = await db
    .delete(reviews)
    .where(eq(reviews.id, reviewId))
    .returning({ locationId: reviews.locationId });

  if (review) {
    const [loc] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, review.locationId));
    if (loc) revalidatePath(`/locations/${loc.slug}`);
  }
}

export async function approvePhoto(photoId: number) {
  const session = await auth();
  await requireAdmin(session);

  const [photo] = await db
    .update(photos)
    .set({ isApproved: true })
    .where(eq(photos.id, photoId))
    .returning({ locationId: photos.locationId });

  if (photo?.locationId) {
    const [loc] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, photo.locationId));
    if (loc) revalidatePath(`/locations/${loc.slug}`);
  }
}

export async function rejectPhoto(photoId: number) {
  const session = await auth();
  await requireAdmin(session);

  const [photo] = await db
    .delete(photos)
    .where(eq(photos.id, photoId))
    .returning({ locationId: photos.locationId });

  if (photo?.locationId) {
    const [loc] = await db
      .select({ slug: locations.slug })
      .from(locations)
      .where(eq(locations.id, photo.locationId));
    if (loc) revalidatePath(`/locations/${loc.slug}`);
  }
}
