"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { photos } from "@/lib/db/schema";
import { confirmPhotoSchema } from "@/lib/validators";
import { verifyObjectExists } from "@/lib/s3";
import { eq, and } from "drizzle-orm";

export async function confirmPhotoUpload(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = confirmPhotoSchema.parse(input);

  const exists = await verifyObjectExists(data.s3Key);
  if (!exists) throw new Error("Photo not found in storage");

  const [photo] = await db
    .insert(photos)
    .values({
      userId: session.user.id,
      s3Key: data.s3Key,
      url: data.url,
      caption: data.caption,
      tripId: data.tripId,
      locationId: data.locationId,
      width: data.width,
      height: data.height,
      sizeBytes: data.sizeBytes,
      mimeType: data.mimeType,
    })
    .returning();

  return photo;
}

export async function deletePhoto(photoId: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db
    .delete(photos)
    .where(and(eq(photos.id, photoId), eq(photos.userId, session.user.id)));
}
