import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reviews, userVisits, trips, photos, locations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { AccountForm } from "@/components/account-form";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user) redirect("/sign-in");

  // Fetch stats
  const [[visitStats], [reviewStats], [tripStats], [photoStats], [locationStats], [uniqueVisits]] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)` })
        .from(userVisits)
        .where(eq(userVisits.userId, session.user.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.userId, session.user.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(trips)
        .where(eq(trips.userId, session.user.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(photos)
        .where(eq(photos.userId, session.user.id)),
      db
        .select({ count: sql<number>`count(*)` })
        .from(locations),
      db
        .select({ count: sql<number>`count(distinct ${userVisits.locationId})` })
        .from(userVisits)
        .where(eq(userVisits.userId, session.user.id)),
    ]);

  const totalLocations = locationStats.count;
  const visitedLocations = uniqueVisits.count;
  const progressPct = totalLocations > 0 ? Math.round((visitedLocations / totalLocations) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Account</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your profile and account settings.
      </p>

      {/* Progress */}
      <div className="mt-6 rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Your Progress</span>
          <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold tabular-nums text-teal-700">
            {progressPct}%
          </span>
        </div>
        <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-teal-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="mt-1.5 text-xs text-muted-foreground">
          {visitedLocations} of {totalLocations} properties visited
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Visited", value: visitStats.count },
          { label: "Reviews", value: reviewStats.count },
          { label: "Trips", value: tripStats.count },
          { label: "Photos", value: photoStats.count },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-card px-4 py-3 text-center"
          >
            <div className="text-2xl font-bold text-primary">
              {stat.value}
            </div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <AccountForm
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          isMember: user.isMember,
          createdAt: user.createdAt.toISOString(),
        }}
      />
    </div>
  );
}
