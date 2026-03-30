"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { createReviewSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

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
    })
    .returning();

  return review;
}

export async function deleteReview(reviewId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.userId, session.user.id)));
}
