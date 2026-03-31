"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export async function updateProfile(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = updateProfileSchema.parse(input);

  const [user] = await db
    .update(users)
    .set({ name: data.name, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning();

  return user;
}

export async function deleteAccount() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.delete(users).where(eq(users.id, session.user.id));
}
