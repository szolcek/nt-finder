import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, reviews, userVisits, trips, photos } from "@/lib/db/schema";
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
  const [[visitStats], [reviewStats], [tripStats], [photoStats]] =
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
    ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold">My Account</h1>
      <p className="mt-1 text-muted-foreground">
        Manage your profile and account settings.
      </p>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
