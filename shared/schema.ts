import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";


export const amazonProducts = pgTable("amazon_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  asin: varchar("asin", { length: 100 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  thumbnailUrl: text("thumbnail_url"),
  price: varchar("price", { length: 10 }),
  rating: real("rating"),
  reviewCount: integer("review_count").default(0),
  link: text("link"),
  subdomainId: text("subdomain_id"),
});

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const stores = pgTable("stores", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  featured: boolean("featured").default(false),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).notNull(),
  discountPercent: integer("discount_percent"),
  couponCode: varchar("coupon_code", { length: 100 }),
  dealUrl: text("deal_url").notNull(),
  imageUrl: text("image_url"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  storeId: uuid("store_id").notNull(),
  categoryId: uuid("category_id").notNull(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  freeShipping: boolean("free_shipping").default(false),
  editorInsights: text("editor_insights"),
  howToGetIt: text("how_to_get_it"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  authorName: varchar("author_name", { length: 255 }),
});

export const products = pgTable("products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 255 }),
  model: varchar("model", { length: 255 }),
  sku: varchar("sku", { length: 100 }),
  imageUrl: text("image_url"),
  categoryId: uuid("category_id").notNull(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
});

export const dealProducts = pgTable("deal_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: uuid("deal_id").notNull(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  productId: uuid("product_id").notNull(),
});

export const videoChannels = pgTable("video_channels", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnail_url").notNull(),
  channelUrl: text("channel_url").notNull(),
  videoCount: integer("video_count").default(0),
  followerCount: integer("follower_count").default(0),
  tags: text("tags").array(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const posts = pgTable("posts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(),
  author: varchar("author", { length: 100 }).notNull(),
  subreddit: varchar("subreddit", { length: 100 }),
  imageUrl: text("image_url"),
  postUrl: text("post_url").notNull(),
  upvotes: integer("upvotes").default(0),
  commentCount: integer("comment_count").default(0),
  tags: text("tags").array(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const youtubeVideos = pgTable("youtube_videos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  channelName: varchar("channel_name", { length: 200 }).notNull(),
  channelUrl: text("channel_url").notNull(),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: varchar("duration", { length: 20 }),
  viewCount: integer("view_count").default(0),
  uploadDate: varchar("upload_date", { length: 50 }),
  tags: text("tags").array(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Blogs table for houseplant care blog posts
export const blogs = pgTable("blogs", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  excerpt: text("excerpt").notNull(),
  author: text("author").notNull(),
  website: text("website").notNull(),
  websiteUrl: text("website_url").notNull(),
  blogUrl: text("blog_url").notNull(),
  imageUrl: text("image_url").notNull(),
  publishDate: text("publish_date").notNull(),
  readTime: text("read_time").notNull(),
  category: text("category").notNull(),
  tags: text("tags").array(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Advertisement banners table for storing banner ads with images and affiliate links
export const advertisementBanners = pgTable("advertisement_banners", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageUrl: text("page_url"), // which page this banner appears on (/videos, /posts, etc.)
  position: text("position").notNull(), // header, top, left, right, bottom
  size: text("size").notNull(), // small, medium, large
  title: text("title").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  clickUrl: text("click_url").notNull(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  alwaysShow: boolean("always_show").default(true), // if true, banner always shows; if false, limited by impressions
  maxImpressions: integer("max_impressions").default(0), // max number of impressions when always_show is false (0 = unlimited)
  displayOrder: integer("display_order").default(0),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Subdomains table for multi-tenant analytics tracking
export const subdomains = pgTable("subdomains", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  subdomain: varchar("subdomain", { length: 100 }).notNull().unique(), // e.g., "demo", "site1", "site2"
  displayName: varchar("display_name", { length: 255 }).notNull(), // e.g., "Demo Site", "Site 1", "Site 2"
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Page views tracking table for analytics and impression counting
export const pageViews = pgTable("page_views", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull(), // e.g., "Videos", "Posts", "Blogs"
  pageUrl: text("page_url").notNull(), // e.g., "/videos", "/posts", "/blogs"
  subdomainId: text("subdomain_id"), // reference to subdomains table, null for demo site
  ipAddress: text("ip_address").notNull(), // visitor's IP address
  userAgent: text("user_agent"), // browser/device information
  createdAt: timestamp("created_at").default(sql`now()`),
});

// Click-through tracking table for advertisement banner analytics
export const clickThru = pgTable("click_thru", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull(), // e.g., "Videos", "Posts", "Blogs"  
  pageUrl: text("page_url").notNull(), // e.g., "/videos", "/posts", "/blogs"
  subdomainId: text("subdomain_id"), // reference to subdomains table, null for demo site
  advertisementId: text("advertisement_id").notNull(), // banner ID that was clicked
  advertisementTitle: text("advertisement_title").notNull(), // banner title
  advertisementClickUrl: text("advertisement_click_url").notNull(), // URL user was taken to
  bannerPosition: text("banner_position").notNull(), // e.g., "header", "top", "left", "right", "bottom"
  ipAddress: text("ip_address").notNull(), // visitor's IP address
  userAgent: text("user_agent"), // browser/device information
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const bannerSettings = pgTable("banner_settings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  pageName: text("page_name").notNull(),
  pageUrl: text("page_url").notNull().unique(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isVisible: boolean("is_visible").default(true),
  showHeader: boolean("show_header").default(true),
  showTop: boolean("show_top").default(true),
  showLeft: boolean("show_left").default(true),
  showRight: boolean("show_right").default(true),
  showBottom: boolean("show_bottom").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
  subdomainId: text("subdomain_id")
});

// User favorites table
export const userFavorites = pgTable("user_favorites", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // For now, using session ID or IP as user identifier
  dealId: uuid("deal_id").notNull(),
  pageUrl: text("page_url").notNull().default("/"), // Track which page the favorite was made on
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  createdAt: timestamp("created_at").default(sql`now()`),
}, (table) => {
  return {
    uniqueUserDealPage: sql`UNIQUE(${table.userId}, ${table.dealId}, ${table.pageUrl})`,
  };
});

// Site settings table for global site configuration
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  siteName: text("site_name").notNull().default("NetDiscount"),
  siteDescription: text("site_description").default("Deal Aggregation Platform"),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  affiliateDisclosure: text("affiliate_disclosure").default("NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission."),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parentCategory",
  }),
  children: many(categories, {
    relationName: "parentCategory",
  }),
  deals: many(deals),
  products: many(products),
}));

export const storesRelations = relations(stores, ({ many }) => ({
  deals: many(deals),
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  store: one(stores, {
    fields: [deals.storeId],
    references: [stores.id],
  }),
  category: one(categories, {
    fields: [deals.categoryId],
    references: [categories.id],
  }),
  dealProducts: many(dealProducts),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  dealProducts: many(dealProducts),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProducts.dealId],
    references: [deals.id],
  }),
  product: one(products, {
    fields: [dealProducts.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

export const insertDealSchema = createInsertSchema(deals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertAmazonProductSchema = createInsertSchema(amazonProducts).omit({
  id: true,
});

export const insertDealProductSchema = createInsertSchema(dealProducts).omit({
  id: true,
});

export const insertVideoChannelSchema = createInsertSchema(videoChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdvertisementBannerSchema = createInsertSchema(advertisementBanners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBannerSettingsSchema = createInsertSchema(bannerSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertSubdomainSchema = createInsertSchema(subdomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPageViewSchema = createInsertSchema(pageViews).omit({
  id: true,
  createdAt: true,
});

export const insertClickThruSchema = createInsertSchema(clickThru).omit({
  id: true,
  createdAt: true,
});

// Directory Business Models
export const businessCategories = pgTable("business_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  iconName: varchar("icon_name", { length: 100 }),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const businesses = pgTable("businesses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 50 }).notNull(),
  zipCode: varchar("zip_code", { length: 20 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  website: text("website"),
  imageUrl: text("image_url"),
  businessCategoryId: uuid("business_category_id").notNull(),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  priceRange: varchar("price_range", { length: 10 }).default("$$"),
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
  isOpenNow: boolean("is_open_now").default(false),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const businessHours = pgTable("business_hours", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: uuid("business_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  openTime: varchar("open_time", { length: 8 }), // Format: "09:00:00"
  closeTime: varchar("close_time", { length: 8 }), // Format: "17:00:00"
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isClosed: boolean("is_closed").default(false),
});

export const businessReviews = pgTable("business_reviews", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: uuid("business_id").notNull(),
  reviewerName: varchar("reviewer_name", { length: 255 }).notNull(),
  reviewerAvatar: text("reviewer_avatar"),
  rating: integer("rating").notNull(), // 1-5 stars
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  isVerified: boolean("is_verified").default(false),
  helpfulCount: integer("helpful_count").default(0),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const businessPhotos = pgTable("business_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: uuid("business_id").notNull(),
  imageUrl: text("image_url").notNull(),
  caption: varchar("caption", { length: 255 }),
  isMainPhoto: boolean("is_main_photo").default(false),
  sortOrder: integer("sort_order").default(0),
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  createdAt: timestamp("created_at").default(sql`now()`),
});

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email", { length: 255 }).notNull().unique(),
  signupMethod: varchar("signup_method", { length: 50 }).notNull(), // 'email', 'facebook', 'google', 'apple'
  subdomainId: text("subdomain_id"), // Reference to subdomains table for multi-tenant support
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

export const newsletterPopupSettings = pgTable("newsletter_popup_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  isEnabled: boolean("is_enabled").default(false),
  popupType: varchar("popup_type", { length: 20 }).notNull().default("dark"), // 'dark' or 'light'
  subdomainId: text("subdomain_id"), 
  showDelay: integer("show_delay").default(5000), // milliseconds
  showOnPages: text("show_on_pages").array().default([]), // array of page URLs
  frequency: varchar("frequency", { length: 20 }).default("once_per_session"), // 'once_per_session', 'daily', 'always'
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Types
export type Category = typeof categories.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Product = typeof products.$inferSelect;
export type AmazonProduct = typeof amazonProducts.$inferSelect;
export type DealProduct = typeof dealProducts.$inferSelect;
export type VideoChannel = typeof videoChannels.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;
export type Blog = typeof blogs.$inferSelect;
export type AdvertisementBanner = typeof advertisementBanners.$inferSelect;
export type BannerSettings = typeof bannerSettings.$inferSelect;
export type Subdomain = typeof subdomains.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type ClickThru = typeof clickThru.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertAmazonProduct = z.infer<typeof insertAmazonProductSchema>;
export type InsertDealProduct = z.infer<typeof insertDealProductSchema>;
export type InsertVideoChannel = z.infer<typeof insertVideoChannelSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type InsertAdvertisementBanner = z.infer<typeof insertAdvertisementBannerSchema>;
export type InsertBannerSettings = z.infer<typeof insertBannerSettingsSchema>;
export type InsertSubdomain = z.infer<typeof insertSubdomainSchema>;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type InsertClickThru = z.infer<typeof insertClickThruSchema>;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;

// Directory insert schemas
export const insertBusinessCategorySchema = createInsertSchema(businessCategories).omit({
  id: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessHoursSchema = createInsertSchema(businessHours).omit({
  id: true,
});

export const insertBusinessReviewSchema = createInsertSchema(businessReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBusinessPhotoSchema = createInsertSchema(businessPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterSubscriberSchema = createInsertSchema(newsletterSubscribers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNewsletterPopupSettingsSchema = createInsertSchema(newsletterPopupSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Directory types
export type BusinessCategory = typeof businessCategories.$inferSelect;
export type Business = typeof businesses.$inferSelect;
export type BusinessHours = typeof businessHours.$inferSelect;
export type BusinessReview = typeof businessReviews.$inferSelect;
export type BusinessPhoto = typeof businessPhotos.$inferSelect;
export type User = typeof users.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewsletterPopupSettings = typeof newsletterPopupSettings.$inferSelect;

export type InsertBusinessCategory = z.infer<typeof insertBusinessCategorySchema>;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type InsertBusinessHours = z.infer<typeof insertBusinessHoursSchema>;
export type InsertBusinessReview = z.infer<typeof insertBusinessReviewSchema>;
export type InsertBusinessPhoto = z.infer<typeof insertBusinessPhotoSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertNewsletterSubscriber = z.infer<typeof insertNewsletterSubscriberSchema>;
export type InsertNewsletterPopupSettings = z.infer<typeof insertNewsletterPopupSettingsSchema>;

// Extended types for API responses
export type DealWithRelations = Omit<Deal, 'subdomainId'> & {
  store: Store;
  category: Category;
};

export type CategoryWithChildren = Category & {
  children: Category[];
};

// Directory extended types for API responses
export type BusinessWithDetails = Omit<Business, 'subdomainId' > & {
  category: BusinessCategory | null;
  hours: BusinessHours[];
  reviews: BusinessReview[];
  photos: BusinessPhoto[];
};

export type BusinessWithCategory = Omit<Business, 'subdomainId' > & {
  category: BusinessCategory | null;
};

// Directory relations (added after table definitions)
export const businessCategoriesRelations = relations(businessCategories, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  category: one(businessCategories, {
    fields: [businesses.businessCategoryId],
    references: [businessCategories.id],
  }),
  hours: many(businessHours),
  reviews: many(businessReviews),
  photos: many(businessPhotos),
}));

export const businessHoursRelations = relations(businessHours, ({ one }) => ({
  business: one(businesses, {
    fields: [businessHours.businessId],
    references: [businesses.id],
  }),
}));

export const businessReviewsRelations = relations(businessReviews, ({ one }) => ({
  business: one(businesses, {
    fields: [businessReviews.businessId],
    references: [businesses.id],
  }),
}));

export const businessPhotosRelations = relations(businessPhotos, ({ one }) => ({
  business: one(businesses, {
    fields: [businessPhotos.businessId],
    references: [businesses.id],
  }),
}));
