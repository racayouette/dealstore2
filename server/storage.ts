import { 
  categories, 
  stores, 
  deals, 
  products, 
  dealProducts,
  videoChannels,
  posts,
  youtubeVideos,
  blogs,
  type Category, 
  type Store, 
  type Deal, 
  type Product,
  type DealProduct,
  type VideoChannel,
  type Post,
  type YoutubeVideo,
  type Blog,
  type InsertCategory, 
  type InsertStore, 
  type InsertDeal, 
  type InsertProduct,
  type InsertDealProduct,
  type InsertVideoChannel,
  type InsertPost,
  type InsertYoutubeVideo,
  type InsertBlog,
  type DealWithRelations,
  type CategoryWithChildren
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql, ilike, isNull } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getCategoriesWithChildren(): Promise<CategoryWithChildren[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Stores  
  getStores(): Promise<Store[]>;
  getStoreBySlug(slug: string): Promise<Store | undefined>;
  getFeaturedStores(): Promise<Store[]>;
  getStoresByLetter(letter: string): Promise<Store[]>;
  createStore(store: InsertStore): Promise<Store>;
  
  // Deals
  getDeals(limit?: number): Promise<DealWithRelations[]>;
  getDealById(id: string): Promise<DealWithRelations | undefined>;
  getFeaturedDeals(limit?: number): Promise<DealWithRelations[]>;
  getDealsByCategory(categorySlug: string, limit?: number): Promise<DealWithRelations[]>;
  getDealsByStore(storeSlug: string, limit?: number): Promise<DealWithRelations[]>;
  searchDeals(query: string, limit?: number): Promise<DealWithRelations[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(categoryId: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Deal Products
  createDealProduct(dealProduct: InsertDealProduct): Promise<DealProduct>;
  
  // Video Channels
  getVideoChannels(limit?: number): Promise<VideoChannel[]>;
  getVideoChannelById(id: string): Promise<VideoChannel | undefined>;
  createVideoChannel(channel: InsertVideoChannel): Promise<VideoChannel>;
  
  // Posts
  getPosts(limit?: number): Promise<Post[]>;
  getPostById(id: string): Promise<Post | undefined>;
  searchPosts(query: string, limit?: number): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  
  // YouTube Videos
  getYoutubeVideos(limit?: number): Promise<YoutubeVideo[]>;
  getYoutubeVideoById(id: string): Promise<YoutubeVideo | undefined>;
  searchYoutubeVideos(query: string, limit?: number): Promise<YoutubeVideo[]>;
  createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  
  // Blogs
  getBlogs(limit?: number): Promise<Blog[]>;
  getBlogById(id: string): Promise<Blog | undefined>;
  searchBlogs(query: string, limit?: number): Promise<Blog[]>;
  createBlog(blog: InsertBlog): Promise<Blog>;
}

export class DatabaseStorage implements IStorage {
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(and(eq(categories.slug, slug), eq(categories.isActive, true)));
    return category || undefined;
  }

  async getCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
    const allCategories = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(asc(categories.sortOrder));
    
    const parentCategories = allCategories.filter(cat => !cat.parentId);
    return parentCategories.map(parent => ({
      ...parent,
      children: allCategories.filter(cat => cat.parentId === parent.id)
    }));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores).where(eq(stores.isActive, true)).orderBy(asc(stores.name));
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores).where(and(eq(stores.slug, slug), eq(stores.isActive, true)));
    return store || undefined;
  }

  async getFeaturedStores(): Promise<Store[]> {
    return await db.select().from(stores).where(and(eq(stores.isActive, true), eq(stores.featured, true)));
  }

  async getStoresByLetter(letter: string): Promise<Store[]> {
    const pattern = letter === '0-9' ? '^[0-9]' : `^${letter}`;
    return await db.select().from(stores)
      .where(and(
        eq(stores.isActive, true),
        sql`${stores.name} ~* ${pattern}`
      ))
      .orderBy(asc(stores.name));
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores).values(store).returning();
    return newStore;
  }

  // Deals
  async getDeals(limit = 50): Promise<DealWithRelations[]> {
    return await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(eq(deals.isActive, true))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealById(id: string): Promise<DealWithRelations | undefined> {
    const [deal] = await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.id, id), eq(deals.isActive, true)));
    
    return deal || undefined;
  }

  async getFeaturedDeals(limit = 10): Promise<DealWithRelations[]> {
    return await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(deals.isFeatured, true)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealsByCategory(categorySlug: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(categories.slug, categorySlug)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealsByStore(storeSlug: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(stores.slug, storeSlug)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async searchDeals(query: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      id: deals.id,
      title: deals.title,
      description: deals.description,
      originalPrice: deals.originalPrice,
      salePrice: deals.salePrice,
      discountPercent: deals.discountPercent,
      couponCode: deals.couponCode,
      dealUrl: deals.dealUrl,
      imageUrl: deals.imageUrl,
      rating: deals.rating,
      reviewCount: deals.reviewCount,
      storeId: deals.storeId,
      categoryId: deals.categoryId,
      isActive: deals.isActive,
      isFeatured: deals.isFeatured,
      expiresAt: deals.expiresAt,
      createdAt: deals.createdAt,
      updatedAt: deals.updatedAt,
      authorName: deals.authorName,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(
      eq(deals.isActive, true),
      ilike(deals.title, `%${query}%`)
    ))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals).values(deal).returning();
    return newDeal;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.isActive, true)));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products).where(and(eq(products.categoryId, categoryId), eq(products.isActive, true)));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Deal Products
  async createDealProduct(dealProduct: InsertDealProduct): Promise<DealProduct> {
    const [newDealProduct] = await db.insert(dealProducts).values(dealProduct).returning();
    return newDealProduct;
  }

  // Video Channels
  async getVideoChannels(limit = 20): Promise<VideoChannel[]> {
    return await db.select().from(videoChannels).where(eq(videoChannels.isActive, true)).orderBy(desc(videoChannels.createdAt)).limit(limit);
  }

  async getVideoChannelById(id: string): Promise<VideoChannel | undefined> {
    const [channel] = await db.select().from(videoChannels).where(and(eq(videoChannels.id, id), eq(videoChannels.isActive, true)));
    return channel || undefined;
  }

  async createVideoChannel(channel: InsertVideoChannel): Promise<VideoChannel> {
    const [newChannel] = await db.insert(videoChannels).values(channel).returning();
    return newChannel;
  }

  // Posts
  async getPosts(limit = 20): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.isActive, true)).orderBy(desc(posts.createdAt)).limit(limit);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(and(eq(posts.id, id), eq(posts.isActive, true)));
    return post || undefined;
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db.select().from(posts).where(and(
      eq(posts.isActive, true),
      ilike(posts.title, `%${query}%`)
    )).orderBy(desc(posts.createdAt)).limit(limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts).values(post).returning();
    return newPost;
  }

  // YouTube Videos
  async getYoutubeVideos(limit = 20): Promise<YoutubeVideo[]> {
    return await db.select().from(youtubeVideos)
      .where(eq(youtubeVideos.isActive, true))
      .orderBy(desc(youtubeVideos.createdAt))
      .limit(limit);
  }

  async getYoutubeVideoById(id: string): Promise<YoutubeVideo | undefined> {
    const [video] = await db.select().from(youtubeVideos)
      .where(and(eq(youtubeVideos.id, id), eq(youtubeVideos.isActive, true)));
    return video || undefined;
  }

  async searchYoutubeVideos(query: string, limit = 20): Promise<YoutubeVideo[]> {
    return await db.select().from(youtubeVideos)
      .where(and(
        eq(youtubeVideos.isActive, true),
        ilike(youtubeVideos.title, `%${query}%`)
      ))
      .orderBy(desc(youtubeVideos.createdAt))
      .limit(limit);
  }

  async createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const [newVideo] = await db.insert(youtubeVideos).values(video).returning();
    return newVideo;
  }

  // Blogs
  async getBlogs(limit = 20): Promise<Blog[]> {
    return await db.select().from(blogs)
      .where(eq(blogs.isActive, true))
      .orderBy(desc(blogs.createdAt))
      .limit(limit);
  }

  async getBlogById(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs)
      .where(and(eq(blogs.id, id), eq(blogs.isActive, true)));
    return blog || undefined;
  }

  async searchBlogs(query: string, limit = 20): Promise<Blog[]> {
    return await db.select().from(blogs)
      .where(and(
        eq(blogs.isActive, true),
        ilike(blogs.title, `%${query}%`)
      ))
      .orderBy(desc(blogs.createdAt))
      .limit(limit);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db.insert(blogs).values(blog).returning();
    return newBlog;
  }
}

export const storage = new DatabaseStorage();
