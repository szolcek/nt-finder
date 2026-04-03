"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, MessageCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  const [submitted, setSubmitted] = useState(false);
  const [isOpen, setIsOpen] = useState(isEditing);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    if (!title.trim()) {
      setError("Need title");
      return;
    }

    const payload = {
      locationId,
      rating,
      title: title.trim(),
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
      setSubmitted(true);
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

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-700"
      >
        <MessageCircle className="h-3.5 w-3.5" />
        <span>{isEditing ? "Edit your review" : "Write a review"}</span>
        <ChevronDown className="ml-auto h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Stars inline */}
      <div className="flex items-center gap-3">
        <div
          className="flex gap-0.5"
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
                className="transition-transform hover:scale-110 focus-visible:outline-none"
                aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
              >
                <Star
                  className={cn(
                    "h-5 w-5 transition-colors",
                    starValue <= displayRating
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-200"
                  )}
                />
              </button>
            );
          })}
        </div>
        {rating > 0 && <span className="text-xs text-slate-400">{rating}/5</span>}
      </div>

      {/* Single text area for the review */}
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title your review..."
        maxLength={200}
        className="border-0 bg-transparent px-0 text-sm font-medium text-slate-800 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was your visit?"
        maxLength={5000}
        rows={2}
        className="min-h-0 resize-none border-0 bg-transparent px-0 text-sm text-slate-600 placeholder:text-slate-400 shadow-none focus-visible:ring-0"
      />

      {/* Tip & date row — compact */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[180px]">
          <Textarea
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            placeholder="Got a tip? (optional)"
            maxLength={1000}
            rows={1}
            className="min-h-0 resize-none rounded-lg border-slate-200 bg-teal-50/50 px-3 py-2 text-xs text-slate-600 placeholder:text-slate-400"
          />
        </div>
        <Input
          type="date"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
          className="h-8 w-auto rounded-lg border-slate-200 px-3 text-xs text-slate-500"
        />
        <Button
          type="submit"
          disabled={isSubmitting || rating === 0}
          size="sm"
          className="h-8 rounded-lg bg-teal-600 px-4 text-xs font-medium hover:bg-teal-700"
        >
          {isSubmitting ? "Posting..." : isEditing ? "Update" : "Post"}
        </Button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
      {submitted && (
        <p className="text-xs text-teal-600">
          Your review has been submitted and will be visible to others once approved.
        </p>
      )}
    </form>
  );
}
