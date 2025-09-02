CREATE TABLE "subdomains" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subdomain" varchar(100) NOT NULL,
	"display_name" varchar(255) NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "subdomains_subdomain_unique" UNIQUE("subdomain")
);
--> statement-breakpoint
ALTER TABLE "advertisement_banners" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "business_categories" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "business_hours" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "business_photos" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "business_reviews" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "businesses" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "click_thru" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "deals" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "newsletter_subscribers" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "page_views" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "stores" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "user_favorites" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "video_channels" ADD COLUMN "subdomain_id" text;--> statement-breakpoint
ALTER TABLE "youtube_videos" ADD COLUMN "subdomain_id" text;