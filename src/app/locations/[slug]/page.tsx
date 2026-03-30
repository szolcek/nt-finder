import { db } from "@/lib/db";
import {
  locations,
  locationPricing,
  reviews,
  users,
} from "@/lib/db/schema";
import { eq, and, or, sql, isNull, gte, lte } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Globe, Clock } from "lucide-react";
import { getCategoryConfig } from "@/lib/categories";
import { PricingTable } from "@/components/pricing-table";
import { ReviewList } from "@/components/review-list";
import { auth } from "@/lib/auth";

export const revalidate = 3600;

export async function generateStaticParams() {
  const allLocations = await db
    .select({ slug: locations.slug })
    .from(locations)
    .where(eq(locations.isPublished, true));

  return allLocations.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.slug, slug), eq(locations.isPublished, true)));

  if (!location) return { title: "Location Not Found" };

  return {
    title: location.name,
    description:
      location.shortDescription ?? `Visit ${location.name} with the National Trust.`,
    openGraph: {
      images: location.heroImageUrl ? [location.heroImageUrl] : [],
    },
  };
}

export default async function LocationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [location] = await db
    .select()
    .from(locations)
    .where(and(eq(locations.slug, slug), eq(locations.isPublished, true)));

  if (!location) notFound();

  const today = new Date().toISOString().split("T")[0];

  const [pricing, locationReviews, session] = await Promise.all([
    db
      .select()
      .from(locationPricing)
      .where(
        and(
          eq(locationPricing.locationId, location.id),
          or(
            isNull(locationPricing.validFrom),
            lte(locationPricing.validFrom, today)
          ),
          or(
            isNull(locationPricing.validTo),
            gte(locationPricing.validTo, today)
          )
        )
      ),
    db
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
          image: users.image,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(
        and(
          eq(reviews.locationId, location.id),
          eq(reviews.isPublished, true)
        )
      )
      .orderBy(sql`${reviews.createdAt} desc`),
    auth(),
  ]);

  const avgRating =
    locationReviews.length > 0
      ? locationReviews.reduce((sum, r) => sum + r.rating, 0) /
        locationReviews.length
      : null;

  const facilities = (location.facilities as string[]) ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {location.heroImageUrl && (
        <div className="mb-8 aspect-[3/1] overflow-hidden rounded-xl">
          <img
            src={location.heroImageUrl}
            alt={location.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex items-start gap-3">
              <h1 className="text-3xl font-bold">{location.name}</h1>
              {location.category && (() => {
                const cat = getCategoryConfig(location.category);
                return (
                  <Badge variant="outline" className={`mt-1 border-0 ${cat.bg} ${cat.text}`}>
                    {cat.label}
                  </Badge>
                );
              })()}
            </div>

            {avgRating && (
              <p className="mt-1 text-sm text-muted-foreground">
                {avgRating.toFixed(1)} average from {locationReviews.length}{" "}
                {locationReviews.length === 1 ? "review" : "reviews"}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {location.address && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {location.address}
                  {location.postcode && `, ${location.postcode}`}
                </span>
              )}
              {location.websiteUrl && (
                <a
                  href={location.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                  Website
                </a>
              )}
            </div>
          </div>

          {location.description && (
            <div>
              <h2 className="mb-3 text-xl font-semibold">About</h2>
              <p className="text-muted-foreground leading-relaxed">
                {location.description}
              </p>
            </div>
          )}

          {facilities.length > 0 && (
            <div>
              <h2 className="mb-3 text-xl font-semibold">Facilities</h2>
              <div className="flex flex-wrap gap-2">
                {facilities.map((f) => (
                  <Badge key={f} variant="outline">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Reviews & Tips ({locationReviews.length})
            </h2>
            <ReviewList reviews={locationReviews} />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-xl font-semibold">Pricing</h2>
            <PricingTable pricing={pricing} isMember={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
