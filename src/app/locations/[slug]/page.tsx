import { db } from "@/lib/db";
import {
  locations,
  locationPricing,
  reviews,
  users,
  photos,
  userVisits,
} from "@/lib/db/schema";
import { eq, and, or, sql, isNull, gte, lte } from "drizzle-orm";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Clock, Star } from "lucide-react";
import { getCategoryConfig } from "@/lib/categories";
import { PricingTable } from "@/components/pricing-table";
import { OpeningHours, type OpeningHoursData } from "@/components/opening-hours";
import { ReviewList } from "@/components/review-list";
import { ReviewForm } from "@/components/review-form";
import { PhotoGallery } from "@/components/photo-gallery";
import { PhotoUpload } from "@/components/photo-upload";
import { VisitToggle } from "@/components/visit-toggle";
import { BackToMap } from "@/components/back-to-map";
import Image from "next/image";
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

  const [pricing, locationReviews, locationPhotos, session] = await Promise.all([
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
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        tip: reviews.tip,
        visitDate: reviews.visitDate,
        isPublished: reviews.isPublished,
        createdAt: reviews.createdAt,
        user: {
          name: users.name,
          image: users.image,
        },
      })
      .from(reviews)
      .innerJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.locationId, location.id))
      .orderBy(sql`${reviews.createdAt} desc`),
    db
      .select({
        id: photos.id,
        userId: photos.userId,
        url: photos.url,
        caption: photos.caption,
        isApproved: photos.isApproved,
        user: { name: users.name },
      })
      .from(photos)
      .innerJoin(users, eq(photos.userId, users.id))
      .where(eq(photos.locationId, location.id))
      .orderBy(sql`${photos.createdAt} desc`),
    auth(),
  ]);

  // Filter to approved + current user's own content
  const userId = session?.user?.id;
  const visibleReviews = locationReviews.filter(
    (r) => r.isPublished || r.userId === userId
  );
  const visiblePhotos = locationPhotos.filter(
    (p) => p.isApproved || p.userId === userId
  );

  // Check if current user has visited this location
  let hasVisited = false;
  let userReview: (typeof visibleReviews)[number] | null = null;
  if (userId) {
    const [visit] = await db
      .select({ id: userVisits.id })
      .from(userVisits)
      .where(
        and(
          eq(userVisits.userId, userId),
          eq(userVisits.locationId, location.id)
        )
      )
      .limit(1);
    hasVisited = !!visit;
    userReview = visibleReviews.find((r) => r.userId === userId) ?? null;
  }

  // Only count published reviews for public stats
  const publishedReviews = visibleReviews.filter((r) => r.isPublished);
  const avgRating =
    publishedReviews.length > 0
      ? publishedReviews.reduce((sum, r) => sum + r.rating, 0) /
        publishedReviews.length
      : null;

  const facilities = (location.facilities as string[]) ?? [];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <BackToMap />

        {location.heroImageUrl && (
          <div className="relative mt-4 aspect-[2/1] overflow-hidden rounded-2xl shadow-lg shadow-slate-200/50 ring-1 ring-slate-100 sm:aspect-[2.2/1]">
            <Image
              src={location.heroImageUrl}
              alt={location.name}
              fill
              sizes="(max-width: 1152px) 100vw, 1152px"
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Title */}
        <div className="mt-6">
          <div className="flex items-start gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{location.name}</h1>
            {location.category && (() => {
              const cat = getCategoryConfig(location.category);
              return (
                <Badge variant="outline" className={`mt-1 border-0 ${cat.bg} ${cat.text}`}>
                  {cat.label}
                </Badge>
              );
            })()}
            <div className="ml-auto shrink-0">
              <VisitToggle
                locationId={location.id}
                locationName={location.name}
                initialVisited={hasVisited}
                isAuthenticated={!!session?.user?.id}
              />
            </div>
          </div>

          {avgRating && (
            <div className="mt-2 flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < Math.round(avgRating) ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-slate-700">{avgRating.toFixed(1)}</span>
              <span className="text-xs text-slate-400">
                ({publishedReviews.length} {publishedReviews.length === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
            {location.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                {location.address}
                {location.postcode && `, ${location.postcode}`}
              </span>
            )}
            {location.websiteUrl && (
              <a
                href={location.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-teal-600 hover:text-teal-700 transition-colors"
              >
                <Globe className="h-3.5 w-3.5" />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            {location.description && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-50 via-sky-50/60 to-white p-6 sm:p-8">
                <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-teal-200/30 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-sky-200/30 blur-3xl" />
                <div className="relative">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">About</h2>
                  <div className="rounded-xl bg-white p-4 shadow-sm">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {location.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Facilities */}
            {facilities.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/60 to-sky-50/40 p-6 sm:p-8">
                <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-teal-200/20 blur-3xl" />
                <div className="relative">
                  <h2 className="mb-3 text-lg font-semibold text-slate-900">Facilities</h2>
                  <div className="flex flex-wrap gap-2">
                    {facilities.map((f) => (
                      <span key={f} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Photos */}
            {(visiblePhotos.length > 0 || session?.user?.id) && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-blue-50/40 to-teal-50/30 p-6 sm:p-8">
                <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Photos {visiblePhotos.length > 0 && `(${visiblePhotos.length})`}
                    </h2>
                    {session?.user?.id && <PhotoUpload locationId={location.id} />}
                  </div>
                  <PhotoGallery photos={visiblePhotos} />
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 via-orange-50/30 to-rose-50/40 p-6 sm:p-8">
              <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-amber-200/30 blur-3xl" />
              <div className="relative">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                  Reviews & Tips ({publishedReviews.length})
                </h2>
                {session?.user?.id && (
                  <div className="mb-3 rounded-xl bg-white p-4 shadow-sm">
                    <ReviewForm
                      locationId={location.id}
                      existingReview={userReview ? {
                        id: userReview.id,
                        rating: userReview.rating,
                        title: userReview.title,
                        body: userReview.body,
                        tip: userReview.tip,
                        visitDate: userReview.visitDate,
                      } : null}
                    />
                  </div>
                )}
                <ReviewList reviews={visibleReviews} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {location.openingHours && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 via-indigo-50/40 to-white p-6 sm:p-8">
                <div className="absolute -left-10 top-8 h-36 w-36 rounded-full bg-violet-200/30 blur-3xl" />
                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <h2 className="text-lg font-semibold text-slate-900">
                      Opening times
                    </h2>
                  </div>
                  <OpeningHours
                    data={location.openingHours as OpeningHoursData}
                  />
                </div>
              </div>
            )}

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-teal-50/40 to-white p-6 sm:p-8 lg:sticky lg:top-20">
              <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-sky-200/30 blur-3xl" />
              <div className="relative">
                <h2 className="mb-3 text-lg font-semibold text-slate-900">Pricing</h2>
                <PricingTable pricing={pricing} isMember={session?.user?.isMember ?? false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
