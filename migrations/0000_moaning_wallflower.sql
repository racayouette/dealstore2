CREATE TABLE "advertisement_banners" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_url" text,
	"position" text NOT NULL,
	"size" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"click_url" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"always_show" boolean DEFAULT true,
	"max_impressions" integer DEFAULT 0,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "banner_settings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" text NOT NULL,
	"page_url" text NOT NULL,
	"description" text,
	"sort_order" integer DEFAULT 0,
	"is_visible" boolean DEFAULT true,
	"show_header" boolean DEFAULT true,
	"show_top" boolean DEFAULT true,
	"show_left" boolean DEFAULT true,
	"show_right" boolean DEFAULT true,
	"show_bottom" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "banner_settings_page_url_unique" UNIQUE("page_url")
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"excerpt" text NOT NULL,
	"author" text NOT NULL,
	"website" text NOT NULL,
	"website_url" text NOT NULL,
	"blog_url" text NOT NULL,
	"image_url" text NOT NULL,
	"publish_date" text NOT NULL,
	"read_time" text NOT NULL,
	"category" text NOT NULL,
	"tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"icon_name" varchar(100),
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "business_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "business_hours" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"open_time" varchar(8),
	"close_time" varchar(8),
	"is_closed" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "business_photos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"caption" varchar(255),
	"is_main_photo" boolean DEFAULT false,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "business_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"business_id" uuid NOT NULL,
	"reviewer_name" varchar(255) NOT NULL,
	"reviewer_avatar" text,
	"rating" integer NOT NULL,
	"title" varchar(255),
	"content" text NOT NULL,
	"is_verified" boolean DEFAULT false,
	"helpful_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "businesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(50) NOT NULL,
	"zip_code" varchar(20) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"website" text,
	"image_url" text,
	"business_category_id" uuid NOT NULL,
	"rating" numeric(3, 2) DEFAULT '0',
	"review_count" integer DEFAULT 0,
	"price_range" varchar(10) DEFAULT '$$',
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"is_open_now" boolean DEFAULT false,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "businesses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"parent_id" uuid,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "click_thru" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" text NOT NULL,
	"page_url" text NOT NULL,
	"advertisement_id" text NOT NULL,
	"advertisement_title" text NOT NULL,
	"advertisement_click_url" text NOT NULL,
	"banner_position" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deal_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"deal_id" uuid NOT NULL,
	"product_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"original_price" numeric(10, 2),
	"sale_price" numeric(10, 2) NOT NULL,
	"discount_percent" integer,
	"coupon_code" varchar(100),
	"deal_url" text NOT NULL,
	"image_url" text,
	"rating" numeric(3, 2),
	"review_count" integer DEFAULT 0,
	"store_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true,
	"is_featured" boolean DEFAULT false,
	"free_shipping" boolean DEFAULT false,
	"editor_insights" text,
	"how_to_get_it" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"author_name" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "newsletter_popup_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_enabled" boolean DEFAULT false,
	"popup_type" varchar(20) DEFAULT 'dark' NOT NULL,
	"show_delay" integer DEFAULT 5000,
	"show_on_pages" text[] DEFAULT '{}',
	"frequency" varchar(20) DEFAULT 'once_per_session',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"signup_method" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_name" text NOT NULL,
	"page_url" text NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"content" text NOT NULL,
	"author" varchar(100) NOT NULL,
	"subreddit" varchar(100),
	"image_url" text,
	"post_url" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(500) NOT NULL,
	"description" text,
	"brand" varchar(255),
	"model" varchar(255),
	"sku" varchar(100),
	"image_url" text,
	"category_id" uuid NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" text DEFAULT 'NetDiscount' NOT NULL,
	"site_description" text DEFAULT 'Deal Aggregation Platform',
	"affiliate_disclosure" text DEFAULT 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "stores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"logo_url" text,
	"website_url" text,
	"is_active" boolean DEFAULT true,
	"featured" boolean DEFAULT false,
	CONSTRAINT "stores_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user_favorites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"deal_id" uuid NOT NULL,
	"page_url" text DEFAULT '/' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "video_channels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"thumbnail_url" text NOT NULL,
	"channel_url" text NOT NULL,
	"video_count" integer DEFAULT 0,
	"follower_count" integer DEFAULT 0,
	"tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "youtube_videos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"channel_name" varchar(200) NOT NULL,
	"channel_url" text NOT NULL,
	"video_url" text NOT NULL,
	"thumbnail_url" text NOT NULL,
	"duration" varchar(20),
	"view_count" integer DEFAULT 0,
	"upload_date" varchar(50),
	"tags" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
