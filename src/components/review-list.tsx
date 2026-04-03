import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

interface Review {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  tip: string | null;
  visitDate: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    image: string | null;
  };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No reviews yet. Be the first to share your experience!
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={review.user.image ?? undefined} />
                <AvatarFallback className="bg-amber-100 text-xs font-bold text-amber-700">
                  {review.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {review.user.name ?? "Anonymous"}
                </p>
                {review.visitDate && (
                  <p className="text-xs text-slate-400">
                    Visited{" "}
                    {new Date(review.visitDate).toLocaleDateString("en-GB", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
              </div>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <div className="mt-3 space-y-2">
            {review.title && (
              <p className="text-sm font-semibold text-slate-800">{review.title}</p>
            )}
            {review.body && (
              <p className="text-sm leading-relaxed text-slate-600">{review.body}</p>
            )}
            {review.tip && (
              <div className="mt-2 rounded-lg border-l-[3px] border-l-teal-400 bg-teal-50/50 p-3">
                <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-teal-600">Visitor tip</div>
                <p className="text-sm text-slate-600">{review.tip}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
