"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userVisits, locations } from "@/lib/db/schema";
import { toggleVisitSchema, syncVisitsSchema } from "@/lib/validators";
import { eq, and, inArray } from "drizzle-orm";

export async function toggleVisit(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { locationId } = toggleVisitSchema.parse(input);

  const existing = await db
    .select({ id: userVisits.id })
    .from(userVisits)
    .where(
      and(
        eq(userVisits.userId, session.user.id),
        eq(userVisits.locationId, locationId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove all visits for this user+location
    await db
      .delete(userVisits)
      .where(
        and(
          eq(userVisits.userId, session.user.id),
          eq(userVisits.locationId, locationId)
        )
      );
    return { visited: false };
  }

  // Add a visit with today's date
  await db.insert(userVisits).values({
    userId: session.user.id,
    locationId,
  });
  return { visited: true };
}

export async function getUserVisits(): Promise<
  Record<number, { visitedAt: string }[]>
> {
  const session = await auth();
  if (!session?.user?.id) return {};

  const rows = await db
    .select({
      locationId: userVisits.locationId,
      visitedAt: userVisits.visitedAt,
    })
    .from(userVisits)
    .where(eq(userVisits.userId, session.user.id));

  const grouped: Record<number, { visitedAt: string }[]> = {};
  for (const row of rows) {
    if (!grouped[row.locationId]) grouped[row.locationId] = [];
    grouped[row.locationId].push({ visitedAt: row.visitedAt.toISOString() });
  }
  return grouped;
}

export async function syncLocalStorageVisits(input: unknown) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const { visits } = syncVisitsSchema.parse(input);
  if (visits.length === 0) return { synced: 0 };

  // Resolve location names to IDs
  const names = visits.map((v) => v.locationName);
  const locs = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .where(inArray(locations.name, names));

  const nameToId = new Map(locs.map((l) => [l.name, l.id]));

  // Get existing visits to avoid duplicates
  const existingVisits = await db
    .select({
      locationId: userVisits.locationId,
      visitedAt: userVisits.visitedAt,
    })
    .from(userVisits)
    .where(eq(userVisits.userId, session.user.id));

  const existingSet = new Set(
    existingVisits.map(
      (v) => `${v.locationId}_${v.visitedAt.toISOString().split("T")[0]}`
    )
  );

  // Build insert rows
  const rows: { userId: string; locationId: number; visitedAt: Date }[] = [];
  for (const v of visits) {
    const locId = nameToId.get(v.locationName);
    if (!locId) continue;
    for (const dateStr of v.dates) {
      const d = new Date(dateStr);
      const key = `${locId}_${d.toISOString().split("T")[0]}`;
      if (existingSet.has(key)) continue;
      rows.push({ userId: session.user.id, locationId: locId, visitedAt: d });
    }
  }

  if (rows.length > 0) {
    // Batch insert
    for (let i = 0; i < rows.length; i += 50) {
      await db.insert(userVisits).values(rows.slice(i, i + 50));
    }
  }

  return { synced: rows.length };
}
