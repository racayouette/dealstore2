import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  parentId: uuid("parent_id"),
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
  isActive: boolean("is_active").default(true),
  isFeatured: boolean("is_featured").default(false),
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
  isActive: boolean("is_active").default(true),
});

export const dealProducts = pgTable("deal_products", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  dealId: uuid("deal_id").notNull(),
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
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Relations
export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
  }),
  children: many(categories),
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

// Types
export type Category = typeof categories.$inferSelect;
export type Store = typeof stores.$inferSelect;
export type Deal = typeof deals.$inferSelect;
export type Product = typeof products.$inferSelect;
export type DealProduct = typeof dealProducts.$inferSelect;
export type VideoChannel = typeof videoChannels.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertDealProduct = z.infer<typeof insertDealProductSchema>;
export type InsertVideoChannel = z.infer<typeof insertVideoChannelSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;

// Extended types for API responses
export type DealWithRelations = Deal & {
  store: Store;
  category: Category;
};

export type CategoryWithChildren = Category & {
  children: Category[];
};
