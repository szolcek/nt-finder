"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Check, X } from "lucide-react";
import {
  approveReview,
  rejectReview,
  approvePhoto,
  rejectPhoto,
} from "@/actions/admin";

interface PendingReview {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  tip: string | null;
  visitDate: string | null;
  createdAt: Date;
  user: { name: string | null; email: string | null; image: string | null };
  location: { id: number; name: string; slug: string };
}

interface PendingPhoto {
  id: number;
  url: string;
  caption: string | null;
  createdAt: Date;
  user: { name: string | null; email: string | null; image: string | null };
  location: { id: number; name: string; slug: string } | null;
}

export function AdminDashboard({
  pendingReviews,
  pendingPhotos,
}: {
  pendingReviews: PendingReview[];
  pendingPhotos: PendingPhoto[];
}) {
  return (
    <div className="mt-8 space-y-10">
      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Pending Reviews ({pendingReviews.length})
        </h2>
        {pendingReviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No pending reviews.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pendingReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-900">
          Pending Photos ({pendingPhotos.length})
        </h2>
        {pendingPhotos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No pending photos.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pendingPhotos.map((photo) => (
              <PhotoCard key={photo.id} photo={photo} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewCard({ review }: { review: PendingReview }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    try {
      if (action === "approve") {
        await approveReview(review.id);
      } else {
        await rejectReview(review.id);
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={review.user.image ?? undefined} />
            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-600">
              {review.user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-slate-800">
              {review.user.name ?? "Anonymous"}
            </p>
            <p className="text-xs text-slate-400">{review.user.email}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < review.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-teal-600">
        {review.location.name}
      </p>

      <div className="mt-2 space-y-1">
        {review.title && (
          <p className="text-sm font-semibold text-slate-800">{review.title}</p>
        )}
        {review.body && (
          <p className="text-sm text-slate-600">{review.body}</p>
        )}
        {review.tip && (
          <p className="text-xs italic text-slate-500">Tip: {review.tip}</p>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {new Date(review.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={loading !== null}
            onClick={() => handleAction("reject")}
          >
            <X className="h-3 w-3" />
            {loading === "reject" ? "..." : "Reject"}
          </Button>
          <Button
            size="sm"
            className="h-7 gap-1 bg-teal-600 text-xs hover:bg-teal-700"
            disabled={loading !== null}
            onClick={() => handleAction("approve")}
          >
            <Check className="h-3 w-3" />
            {loading === "approve" ? "..." : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function PhotoCard({ photo }: { photo: PendingPhoto }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handleAction(action: "approve" | "reject") {
    setLoading(action);
    try {
      if (action === "approve") {
        await approvePhoto(photo.id);
      } else {
        await rejectPhoto(photo.id);
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <img
        src={photo.url}
        alt={photo.caption ?? "User photo"}
        className="aspect-square w-full object-cover"
      />
      <div className="p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-5 w-5">
            <AvatarImage src={photo.user.image ?? undefined} />
            <AvatarFallback className="bg-slate-100 text-[8px] font-bold text-slate-600">
              {photo.user.name?.charAt(0)?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
          <p className="text-xs font-medium text-slate-700">
            {photo.user.name ?? "Anonymous"}
          </p>
        </div>
        {photo.location?.name && (
          <p className="mt-1 text-xs text-teal-600">{photo.location.name}</p>
        )}
        {photo.caption && (
          <p className="mt-1 text-xs text-slate-500">{photo.caption}</p>
        )}
        <div className="mt-2 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 flex-1 gap-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
            disabled={loading !== null}
            onClick={() => handleAction("reject")}
          >
            <X className="h-3 w-3" />
            {loading === "reject" ? "..." : "Reject"}
          </Button>
          <Button
            size="sm"
            className="h-7 flex-1 gap-1 bg-teal-600 text-xs hover:bg-teal-700"
            disabled={loading !== null}
            onClick={() => handleAction("approve")}
          >
            <Check className="h-3 w-3" />
            {loading === "approve" ? "..." : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  );
}
