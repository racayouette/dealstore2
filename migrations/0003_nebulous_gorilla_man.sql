CREATE TABLE "amazon_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asin" varchar(100) NOT NULL,
	"title" varchar(255) NOT NULL,
	"thumbnail_url" text,
	"price" varchar(10) NOT NULL,
	"rating" integer NOT NULL,
	"review_count" integer DEFAULT 0,
	"link" text
);
