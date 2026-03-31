"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { createReview, updateReview } from "@/actions/reviews";

interface ExistingReview {
  id: number;
  rating: number;
  title: string | null;
  body: string | null;
  tip: string | null;
  visitDate: string | null;
}

interface ReviewFormProps {
  locationId: number;
  existingReview?: ExistingReview | null;
}

export function ReviewForm({ locationId, existingReview }: ReviewFormProps) {
  const router = useRouter();
  const isEditing = !!existingReview;

  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title ?? "");
  const [body, setBody] = useState(existingReview?.body ?? "");
  const [tip, setTip] = useState(existingReview?.tip ?? "");
  const [visitDate, setVisitDate] = useState(existingReview?.visitDate ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    const payload = {
      locationId,
      rating,
      title: title.trim() || null,
      body: body.trim() || null,
      tip: tip.trim() || null,
      visitDate: visitDate || null,
    };

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateReview(existingReview.id, payload);
      } else {
        await createReview(payload);
      }
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      if (
        message.toLowerCase().includes("unique") ||
        message.toLowerCase().includes("duplicate") ||
        message.toLowerCase().includes("already")
      ) {
        setError("You have already reviewed this location.");
      } else {
        setError(message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayRating = hoveredRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Your Review" : "Write a Review"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHoveredRating(0)}
            >
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1;
                return (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    className="rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={cn(
                        "h-6 w-6 transition-colors",
                        starValue <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <p className="text-xs text-muted-foreground">
                {rating} out of 5 stars
              </p>
            )}
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="review-title">Title</Label>
            <Input
              id="review-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarise your visit"
              maxLength={200}
            />
            {title.length > 150 && (
              <p className="text-xs text-muted-foreground">
                {title.length}/200 characters
              </p>
            )}
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="review-body">Review</Label>
            <Textarea
              id="review-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your experience..."
              maxLength={5000}
              rows={4}
            />
            {body.length > 4500 && (
              <p className="text-xs text-muted-foreground">
                {body.length}/5000 characters
              </p>
            )}
          </div>

          {/* Tip */}
          <div className="space-y-1.5">
            <Label htmlFor="review-tip">Tip</Label>
            <Textarea
              id="review-tip"
              value={tip}
              onChange={(e) => setTip(e.target.value)}
              placeholder="Any tips for future visitors?"
              maxLength={1000}
              rows={2}
              className="bg-nt-green-light"
            />
            {tip.length > 800 && (
              <p className="text-xs text-muted-foreground">
                {tip.length}/1000 characters
              </p>
            )}
          </div>

          {/* Visit Date */}
          <div className="space-y-1.5">
            <Label htmlFor="review-visit-date">Visit Date</Label>
            <Input
              id="review-visit-date"
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Submit */}
          <Button type="submit" disabled={isSubmitting || rating === 0}>
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Submitting..."
              : isEditing
                ? "Update Review"
                : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
