import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No reviews yet. Be the first to share your experience!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.user.image ?? undefined} />
                  <AvatarFallback>
                    {review.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {review.user.name ?? "Anonymous"}
                  </p>
                  {review.visitDate && (
                    <p className="text-xs text-muted-foreground">
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
          </CardHeader>
          <CardContent className="space-y-2">
            {review.title && (
              <p className="font-medium">{review.title}</p>
            )}
            {review.body && (
              <p className="text-sm text-muted-foreground">{review.body}</p>
            )}
            {review.tip && (
              <div className="mt-2 rounded-md bg-nt-green-light p-3">
                <p className="text-sm">
                  <span className="font-medium text-nt-green-dark">Tip: </span>
                  <span className="text-primary">{review.tip}</span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
