ALTER TABLE "reviews" ALTER COLUMN "is_published" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "photos" ADD COLUMN "is_approved" boolean DEFAULT false NOT NULL;