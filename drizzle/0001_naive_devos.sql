CREATE TABLE "user_visits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"location_id" integer NOT NULL,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "location_pricing" DROP CONSTRAINT "location_pricing_location_id_pricing_type_tier_valid_from_unique";--> statement-breakpoint
ALTER TABLE "location_pricing" ADD COLUMN "pricing_category" text DEFAULT 'standard' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_visits" ADD CONSTRAINT "user_visits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_visits" ADD CONSTRAINT "user_visits_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "location_pricing" ADD CONSTRAINT "location_pricing_location_id_pricing_type_pricing_category_tier_valid_from_unique" UNIQUE("location_id","pricing_type","pricing_category","tier","valid_from");