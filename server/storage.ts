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
  advertisementBanners,
  bannerSettings,
  siteSettings,
  pageViews,
  clickThru,
  businessCategories,
  businesses,
  businessHours,
  businessReviews,
  businessPhotos,
  users,
  newsletterSubscribers,
  newsletterPopupSettings,
  userFavorites,
  type Category, 
  type Store, 
  type Deal, 
  type Product,
  type DealProduct,
  type VideoChannel,
  type Post,
  type YoutubeVideo,
  type Blog,
  type AdvertisementBanner,
  type BannerSettings,
  type PageView,
  type ClickThru,
  type BusinessCategory,
  type Business,
  type BusinessHours,
  type BusinessReview,
  type BusinessPhoto,
  type User,
  type NewsletterSubscriber,
  type NewsletterPopupSettings,
  userFavorites as UserFavorite,
  type InsertCategory, 
  type InsertStore, 
  type InsertDeal, 
  type InsertProduct,
  type InsertDealProduct,
  type InsertVideoChannel,
  type InsertPost,
  type InsertYoutubeVideo,
  type InsertBlog,
  type InsertAdvertisementBanner,
  type InsertBannerSettings,
  insertUserFavoriteSchema,
  type InsertPageView,
  type InsertClickThru,
  type SiteSettings,
  type InsertSiteSettings,
  type InsertBusinessCategory,
  type InsertBusiness,
  type InsertBusinessHours,
  type InsertBusinessReview,
  type InsertBusinessPhoto,
  type InsertUser,
  type InsertNewsletterSubscriber,
  type InsertNewsletterPopupSettings,
  type DealWithRelations,
  type CategoryWithChildren,
  type BusinessWithDetails,
  type BusinessWithCategory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, like, and, sql, ilike, isNull } from "drizzle-orm";
import { getTenantId } from "./db-context";

export interface IStorage {
  // ...interface unchanged...
}



export class DatabaseStorage implements IStorage {

  private get subdomainId() {
    const id = getTenantId();
    // if (!id) throw new Error("No tenant context found");
    return id || "";
  }
  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories)
      .where(and(eq(categories.isActive, true), eq(categories.subdomainId, this.subdomainId)))
      .orderBy(asc(categories.sortOrder));
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories)
      .where(and(eq(categories.slug, slug), eq(categories.isActive, true), eq(categories.subdomainId, this.subdomainId)));
    return category || undefined;
  }

  async getCategoriesWithChildren(): Promise<CategoryWithChildren[]> {
    const allCategories = await db.select().from(categories)
      .where(and(eq(categories.isActive, true), eq(categories.subdomainId, this.subdomainId)))
      .orderBy(asc(categories.sortOrder));
    const parentCategories = allCategories.filter(cat => !cat.parentId);
    return parentCategories.map(parent => ({
      ...parent,
      children: allCategories.filter(cat => cat.parentId === parent.id)
    }));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories)
      .values({ ...category, subdomainId: this.subdomainId })
      .returning();
    return newCategory;
  }

  // Stores
  async getStores(): Promise<Store[]> {
    return await db.select().from(stores)
      .where(and(eq(stores.isActive, true), eq(stores.subdomainId, this.subdomainId)))
      .orderBy(asc(stores.name));
  }

  async getStoreBySlug(slug: string): Promise<Store | undefined> {
    const [store] = await db.select().from(stores)
      .where(and(eq(stores.slug, slug), eq(stores.isActive, true), eq(stores.subdomainId, this.subdomainId)));
    return store || undefined;
  }

  async getFeaturedStores(): Promise<Store[]> {
    return await db.select().from(stores)
      .where(and(eq(stores.isActive, true), eq(stores.featured, true), eq(stores.subdomainId, this.subdomainId)));
  }

  async getStoresByLetter(letter: string): Promise<Store[]> {
    const pattern = letter === '0-9' ? '^[0-9]' : `^${letter}`;
    return await db.select().from(stores)
      .where(and(
        eq(stores.isActive, true),
        eq(stores.subdomainId, this.subdomainId),
        sql`${stores.name} ~* ${pattern}`
      ))
      .orderBy(asc(stores.name));
  }

  async createStore(store: InsertStore): Promise<Store> {
    const [newStore] = await db.insert(stores)
      .values({ ...store, subdomainId: this.subdomainId })
      .returning();
    return newStore;
  }

  // Deals
  async getDeals(limit = 50): Promise<DealWithRelations[]> {
    return await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(deals.subdomainId, this.subdomainId)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealById(id: string): Promise<DealWithRelations | undefined> {
    const [deal] = await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.id, id), eq(deals.isActive, true), eq(deals.subdomainId, this.subdomainId)));
    return deal || undefined;
  }

  async getFeaturedDeals(limit = 10): Promise<DealWithRelations[]> {
    return await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(deals.isFeatured, true), eq(deals.subdomainId, this.subdomainId)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealsByCategory(categorySlug: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(categories.slug, categorySlug), eq(deals.subdomainId, this.subdomainId)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async getDealsByStore(storeSlug: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(eq(deals.isActive, true), eq(stores.slug, storeSlug), eq(deals.subdomainId, this.subdomainId)))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async searchDeals(query: string, limit = 20): Promise<DealWithRelations[]> {
    return await db.select({
      // ...existing code...
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
      freeShipping: deals.freeShipping,
      editorInsights: deals.editorInsights,
      howToGetIt: deals.howToGetIt,
      store: stores,
      category: categories,
    })
    .from(deals)
    .innerJoin(stores, eq(deals.storeId, stores.id))
    .innerJoin(categories, eq(deals.categoryId, categories.id))
    .where(and(
      eq(deals.isActive, true),
      ilike(deals.title, `%${query}%`),
      eq(deals.subdomainId, this.subdomainId)
    ))
    .orderBy(desc(deals.createdAt))
    .limit(limit);
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const [newDeal] = await db.insert(deals)
      .values({ ...deal, subdomainId: this.subdomainId })
      .returning();
    return newDeal;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.isActive, true), eq(products.subdomainId, this.subdomainId)));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products)
      .where(and(eq(products.id, id), eq(products.isActive, true), eq(products.subdomainId, this.subdomainId)));
    return product || undefined;
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.categoryId, categoryId), eq(products.isActive, true), eq(products.subdomainId, this.subdomainId)));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products)
      .values({ ...product, subdomainId: this.subdomainId })
      .returning();
    return newProduct;
  }

  // Deal Products
  async createDealProduct(dealProduct: InsertDealProduct): Promise<DealProduct> {
    const [newDealProduct] = await db.insert(dealProducts)
      .values({ ...dealProduct, subdomainId: this.subdomainId })
      .returning();
    return newDealProduct;
  }

  // Video Channels
  async getVideoChannels(limit = 20): Promise<VideoChannel[]> {
    return await db.select().from(videoChannels)
      .where(and(eq(videoChannels.isActive, true), eq(videoChannels.subdomainId, this.subdomainId)))
      .orderBy(desc(videoChannels.createdAt))
      .limit(limit);
  }

  async getVideoChannelById(id: string): Promise<VideoChannel | undefined> {
    const [channel] = await db.select().from(videoChannels)
      .where(and(eq(videoChannels.id, id), eq(videoChannels.isActive, true), eq(videoChannels.subdomainId, this.subdomainId)));
    return channel || undefined;
  }

  async createVideoChannel(channel: InsertVideoChannel): Promise<VideoChannel> {
    const [newChannel] = await db.insert(videoChannels)
      .values({ ...channel, subdomainId: this.subdomainId })
      .returning();
    return newChannel;
  }

  // Posts
  async getPosts(limit = 20): Promise<Post[]> {
    return await db.select().from(posts)
      .where(and(eq(posts.isActive, true), eq(posts.subdomainId, this.subdomainId)))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts)
      .where(and(eq(posts.id, id), eq(posts.isActive, true), eq(posts.subdomainId, this.subdomainId)));
    return post || undefined;
  }

  async searchPosts(query: string, limit = 20): Promise<Post[]> {
    return await db.select().from(posts)
      .where(and(
        eq(posts.isActive, true),
        ilike(posts.title, `%${query}%`),
        eq(posts.subdomainId, this.subdomainId)
      ))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts)
      .values({ ...post, subdomainId: this.subdomainId })
      .returning();
    return newPost;
  }

  // YouTube Videos
  async getYoutubeVideos(limit = 20): Promise<YoutubeVideo[]> {
    return await db.select().from(youtubeVideos)
      .where(and(eq(youtubeVideos.isActive, true), eq(youtubeVideos.subdomainId, this.subdomainId)))
      .orderBy(desc(youtubeVideos.createdAt))
      .limit(limit);
  }

  async getYoutubeVideoById(id: string): Promise<YoutubeVideo | undefined> {
    const [video] = await db.select().from(youtubeVideos)
      .where(and(eq(youtubeVideos.id, id), eq(youtubeVideos.isActive, true), eq(youtubeVideos.subdomainId, this.subdomainId)));
    return video || undefined;
  }

  async searchYoutubeVideos(query: string, limit = 20): Promise<YoutubeVideo[]> {
    return await db.select().from(youtubeVideos)
      .where(and(
        eq(youtubeVideos.isActive, true),
        ilike(youtubeVideos.title, `%${query}%`),
        eq(youtubeVideos.subdomainId, this.subdomainId)
      ))
      .orderBy(desc(youtubeVideos.createdAt))
      .limit(limit);
  }

  async createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const [newVideo] = await db.insert(youtubeVideos)
      .values({ ...video, subdomainId: this.subdomainId })
      .returning();
    return newVideo;
  }

  // Blogs
  async getBlogs(limit = 20): Promise<Blog[]> {
    return await db.select().from(blogs)
      .where(and(eq(blogs.isActive, true), eq(blogs.subdomainId, this.subdomainId)))
      .orderBy(desc(blogs.createdAt))
      .limit(limit);
  }

  async getBlogById(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs)
      .where(and(eq(blogs.id, id), eq(blogs.isActive, true), eq(blogs.subdomainId, this.subdomainId)));
    return blog || undefined;
  }

  async searchBlogs(query: string, limit = 20): Promise<Blog[]> {
    return await db.select().from(blogs)
      .where(and(
        eq(blogs.isActive, true),
        ilike(blogs.title, `%${query}%`),
        eq(blogs.subdomainId, this.subdomainId)
      ))
      .orderBy(desc(blogs.createdAt))
      .limit(limit);
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db.insert(blogs)
      .values({ ...blog, subdomainId: this.subdomainId })
      .returning();
    return newBlog;
  }

  // Advertisement Banners
  async getAdvertisementBanners(position?: string, pageUrl?: string): Promise<AdvertisementBanner[]> {
    let whereConditions = [eq(advertisementBanners.isActive, true), eq(advertisementBanners.subdomainId, this.subdomainId)];
    if (position) {
      whereConditions.push(eq(advertisementBanners.position, position));
    }
    if (pageUrl) {
      whereConditions.push(eq(advertisementBanners.pageUrl, pageUrl));
    }
    return await db.select().from(advertisementBanners)
      .where(and(...whereConditions))
      .orderBy(asc(advertisementBanners.displayOrder));
  }

  async getAdvertisementBannerById(id: string): Promise<AdvertisementBanner | undefined> {
    const [banner] = await db.select().from(advertisementBanners)
      .where(and(eq(advertisementBanners.id, id), eq(advertisementBanners.isActive, true), eq(advertisementBanners.subdomainId, this.subdomainId)));
    return banner || undefined;
  }

  async getAdvertisementBannersByPosition(position: string): Promise<AdvertisementBanner[]> {
    return await db.select().from(advertisementBanners)
      .where(and(eq(advertisementBanners.isActive, true), eq(advertisementBanners.position, position), eq(advertisementBanners.subdomainId, this.subdomainId)))
      .orderBy(asc(advertisementBanners.displayOrder));
  }

  async createAdvertisementBanner(banner: InsertAdvertisementBanner): Promise<AdvertisementBanner> {
    const [newBanner] = await db.insert(advertisementBanners)
      .values({ ...banner, subdomainId: this.subdomainId })
      .returning();
    return newBanner;
  }

  async getAdvertisementBannersByPage(pageUrl: string): Promise<AdvertisementBanner[]> {
    return await db.select().from(advertisementBanners)
      .where(and(eq(advertisementBanners.isActive, true), eq(advertisementBanners.pageUrl, pageUrl), eq(advertisementBanners.subdomainId, this.subdomainId)))
      .orderBy(asc(advertisementBanners.displayOrder));
  }

  async updateAdvertisementBanner(id: string, updates: Partial<InsertAdvertisementBanner>): Promise<AdvertisementBanner | undefined> {
    const [updatedBanner] = await db.update(advertisementBanners)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(and(eq(advertisementBanners.id, id), eq(advertisementBanners.subdomainId, this.subdomainId)))
      .returning();
    return updatedBanner || undefined;
  }

  async deleteAdvertisementBanner(id: string): Promise<void> {
    await db.delete(advertisementBanners)
      .where(and(eq(advertisementBanners.id, id), eq(advertisementBanners.subdomainId, this.subdomainId)));
  }

  // Banner Settings
  async getBannerSettings(pageUrl?: string): Promise<BannerSettings[]> {
    if (pageUrl) {
      return await db.select().from(bannerSettings)
        .where(and(eq(bannerSettings.pageUrl, pageUrl), eq(bannerSettings.subdomainId, this.subdomainId)));
    }
    return await db.select().from(bannerSettings)
      .where(eq(bannerSettings.subdomainId, this.subdomainId))
      .orderBy(asc(bannerSettings.sortOrder), asc(bannerSettings.pageName));
  }

  async getBannerSettingByPage(pageUrl: string): Promise<BannerSettings | undefined> {
    const [setting] = await db.select().from(bannerSettings)
      .where(and(eq(bannerSettings.pageUrl, pageUrl), eq(bannerSettings.subdomainId, this.subdomainId)));
    return setting || undefined;
  }

  async getVisiblePages(): Promise<BannerSettings[]> {
    return await db.select().from(bannerSettings)
      .where(and(eq(bannerSettings.isVisible, true), eq(bannerSettings.subdomainId, this.subdomainId)))
      .orderBy(asc(bannerSettings.sortOrder), asc(bannerSettings.pageName));
  }

  async createBannerSettings(settings: InsertBannerSettings): Promise<BannerSettings> {
    const { createdAt, updatedAt, ...insertData } = settings as any;
    const [newSettings] = await db.insert(bannerSettings)
      .values({ ...insertData, subdomainId: this.subdomainId })
      .returning();
    return newSettings;
  }

  async updateBannerSettings(pageUrl: string, updates: Partial<InsertBannerSettings>): Promise<BannerSettings | undefined> {
    const { createdAt, updatedAt, ...updateData } = updates as any;
    const [updatedSettings] = await db.update(bannerSettings)
      .set(updateData)
      .where(and(eq(bannerSettings.pageUrl, pageUrl), eq(bannerSettings.subdomainId, this.subdomainId)))
      .returning();
    return updatedSettings || undefined;
  }

  async upsertBannerSettings(pageUrl: string, settings: InsertBannerSettings): Promise<BannerSettings> {
    const existing = await this.getBannerSettingByPage(pageUrl);
    if (existing) {
      return await this.updateBannerSettings(pageUrl, settings) as BannerSettings;
    } else {
      return await this.createBannerSettings(settings);
    }
  }

  async deleteBannerSettings(pageUrl: string): Promise<void> {
    await db.delete(advertisementBanners)
      .where(and(eq(advertisementBanners.pageUrl, pageUrl), eq(advertisementBanners.subdomainId, this.subdomainId)));
    await db.delete(bannerSettings)
      .where(and(eq(bannerSettings.pageUrl, pageUrl), eq(bannerSettings.subdomainId, this.subdomainId)));
  }

  async reorderPages(pageUrls: string[]): Promise<void> {
    for (let i = 0; i < pageUrls.length; i++) {
      await db
        .update(bannerSettings)
        .set({ sortOrder: i + 1 })
        .where(and(eq(bannerSettings.pageUrl, pageUrls[i]), eq(bannerSettings.subdomainId, this.subdomainId)));
    }
  }

  // Directory Business Categories
  async getBusinessCategories(): Promise<BusinessCategory[]> {
    return await db.select().from(businessCategories)
      .where(and(eq(businessCategories.isActive, true), eq(businessCategories.subdomainId, this.subdomainId)))
      .orderBy(asc(businessCategories.sortOrder));
  }

  async getBusinessCategoryBySlug(slug: string): Promise<BusinessCategory | undefined> {
    const [category] = await db.select().from(businessCategories)
      .where(and(eq(businessCategories.slug, slug), eq(businessCategories.isActive, true), eq(businessCategories.subdomainId, this.subdomainId)));
    return category || undefined;
  }

  async createBusinessCategory(category: InsertBusinessCategory): Promise<BusinessCategory> {
    const [newCategory] = await db.insert(businessCategories)
      .values({ ...category, subdomainId: this.subdomainId })
      .returning();
    return newCategory;
  }

  // Directory Businesses
  async getBusinesses(limit = 20): Promise<BusinessWithCategory[]> {
    return await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(and(eq(businesses.isActive, true), eq(businesses.subdomainId, this.subdomainId)))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
  }

  async getBusinessById(id: string): Promise<BusinessWithDetails | undefined> {
    const businessResult = await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(and(eq(businesses.id, id), eq(businesses.isActive, true), eq(businesses.subdomainId, this.subdomainId)))
    .limit(1);

    if (!businessResult[0]) return undefined;

    const business = businessResult[0];
    const hours = await this.getBusinessHours(id);
    const reviews = await this.getBusinessReviews(id);
    const photos = await this.getBusinessPhotos(id);

    return {
      ...business,
      hours,
      reviews,
      photos
    };
  }

  async getBusinessesByCategory(categorySlug: string, limit = 20): Promise<BusinessWithCategory[]> {
    return await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(and(
      eq(businesses.isActive, true),
      eq(businessCategories.slug, categorySlug),
      eq(businesses.subdomainId, this.subdomainId)
    ))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
  }

  async getBusinessesByLocation(city: string, state: string, limit = 20): Promise<BusinessWithCategory[]> {
    return await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(and(
      eq(businesses.isActive, true),
      eq(businesses.city, city),
      eq(businesses.state, state),
      eq(businesses.subdomainId, this.subdomainId)
    ))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
  }

  async searchBusinesses(query: string, location?: string, limit = 20): Promise<BusinessWithCategory[]> {
    let whereCondition = and(
      eq(businesses.isActive, true),
      ilike(businesses.name, `%${query}%`),
      eq(businesses.subdomainId, this.subdomainId)
    );
    if (location) {
      whereCondition = and(
        whereCondition,
        ilike(businesses.city, `%${location}%`)
      );
    }
    return await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(whereCondition)
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
  }

  async getFeaturedBusinesses(limit = 20): Promise<BusinessWithCategory[]> {
    return await db.select({
      // ...existing code...
      id: businesses.id,
      name: businesses.name,
      slug: businesses.slug,
      description: businesses.description,
      address: businesses.address,
      city: businesses.city,
      state: businesses.state,
      zipCode: businesses.zipCode,
      phone: businesses.phone,
      email: businesses.email,
      website: businesses.website,
      imageUrl: businesses.imageUrl,
      businessCategoryId: businesses.businessCategoryId,
      rating: businesses.rating,
      reviewCount: businesses.reviewCount,
      priceRange: businesses.priceRange,
      isActive: businesses.isActive,
      isFeatured: businesses.isFeatured,
      isOpenNow: businesses.isOpenNow,
      latitude: businesses.latitude,
      longitude: businesses.longitude,
      createdAt: businesses.createdAt,
      updatedAt: businesses.updatedAt,
      category: businessCategories
    })
    .from(businesses)
    .leftJoin(businessCategories, eq(businesses.businessCategoryId, businessCategories.id))
    .where(and(
      eq(businesses.isActive, true),
      eq(businesses.isFeatured, true),
      eq(businesses.subdomainId, this.subdomainId)
    ))
    .orderBy(desc(businesses.createdAt))
    .limit(limit);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses)
      .values({...business, subdomainId: this.subdomainId })
      .returning();
    return newBusiness;
  }

  // Business Hours
  async getBusinessHours(businessId: string): Promise<BusinessHours[]> {
    return await db.select().from(businessHours)
      .where(and(eq(businessHours.businessId, businessId), eq(businessHours.subdomainId, this.subdomainId)))
      .orderBy(asc(businessHours.dayOfWeek));
  }

  async createBusinessHours(hours: InsertBusinessHours): Promise<BusinessHours> {
    const [newHours] = await db.insert(businessHours)
      .values({...hours, subdomainId: this.subdomainId })
      .returning();
    return newHours;
  }

  // Business Reviews
  async getBusinessReviews(businessId: string, limit = 10): Promise<BusinessReview[]> {
    return await db.select().from(businessReviews)
      .where(and(eq(businessReviews.businessId, businessId), eq(businessReviews.subdomainId, this.subdomainId)))
      .orderBy(desc(businessReviews.createdAt))
      .limit(limit);
  }

  async createBusinessReview(review: InsertBusinessReview): Promise<BusinessReview> {
    const [newReview] = await db.insert(businessReviews)
      .values({...review, subdomainId: this.subdomainId })
      .returning();
    return newReview;
  }

  // Business Photos
  async getBusinessPhotos(businessId: string): Promise<BusinessPhoto[]> {
    return await db.select().from(businessPhotos)
      .where(and(eq(businessPhotos.businessId, businessId), eq(businessPhotos.subdomainId, this.subdomainId)))
      .orderBy(asc(businessPhotos.sortOrder));
  }

  async createBusinessPhoto(photo: InsertBusinessPhoto): Promise<BusinessPhoto> {
    const [newPhoto] = await db.insert(businessPhotos)
      .values({...photo, subdomainId: this.subdomainId })
      .returning();
    return newPhoto;
  }

  // Users
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users)
      .where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users)
      .values(user)
      .returning();
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users)
      // .where(eq(users.subdomainId, this.subdomainId))
      .orderBy(desc(users.createdAt));
  }

  async getUsersWithPagination(page: number, limit: number): Promise<{ users: User[], total: number }> {
    const offset = (page - 1) * limit;
    const [usersResult, totalResult] = await Promise.all([
      db.select().from(users)
        // .where(eq(users.subdomainId, this.subdomainId))
        .orderBy(desc(users.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(users)
        // .where(eq(users.subdomainId, this.subdomainId))
    ]);
    return {
      users: usersResult,
      total: totalResult[0]?.count || 0
    };
  }

  // Newsletter Subscribers
  async createNewsletterSubscriber(subscriber: InsertNewsletterSubscriber): Promise<NewsletterSubscriber> {
    const [newSubscriber] = await db.insert(newsletterSubscribers)
      .values({ ...subscriber, subdomainId: this.subdomainId })
      .returning();
    return newSubscriber;
  }

  async getNewsletterSubscriberByEmail(email: string): Promise<NewsletterSubscriber | undefined> {
    const [subscriber] = await db.select().from(newsletterSubscribers)
      .where(and(eq(newsletterSubscribers.email, email), eq(newsletterSubscribers.subdomainId, this.subdomainId)));
    return subscriber || undefined;
  }

  async getAllNewsletterSubscribers(): Promise<NewsletterSubscriber[]> {
    return await db.select().from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.subdomainId, this.subdomainId))
      .orderBy(desc(newsletterSubscribers.createdAt));
  }

  // Newsletter Popup Settings
  async getNewsletterPopupSettings(): Promise<NewsletterPopupSettings | undefined> {
    const [settings] = await db.select().from(newsletterPopupSettings)
      .where(eq(newsletterPopupSettings.subdomainId, this.subdomainId))
      .limit(1);
    return settings || undefined;
  }

  async updateNewsletterPopupSettings(settings: InsertNewsletterPopupSettings): Promise<NewsletterPopupSettings> {
    const existing = await this.getNewsletterPopupSettings();
    if (existing) {
      const [updated] = await db
        .update(newsletterPopupSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(and(eq(newsletterPopupSettings.id, existing.id), eq(newsletterPopupSettings.subdomainId, this.subdomainId)))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(newsletterPopupSettings)
        .values({ ...settings, subdomainId: this.subdomainId })
        .returning();
      return created;
    }
  }

  // Page Views
  async createPageView(pageView: InsertPageView): Promise<PageView> {
    const [newPageView] = await db.insert(pageViews)
      .values({ ...pageView, subdomainId: this.subdomainId })
      .returning();
    return newPageView;
  }

  async getPageViews(pageName?: string, limit = 100): Promise<PageView[]> {
    if (pageName) {
      return await db.select().from(pageViews)
        .where(and(eq(pageViews.pageName, pageName), eq(pageViews.subdomainId, this.subdomainId)))
        .orderBy(desc(pageViews.createdAt))
        .limit(limit);
    }
    return await db.select().from(pageViews)
      .where(eq(pageViews.subdomainId, this.subdomainId))
      .orderBy(desc(pageViews.createdAt))
      .limit(limit);
  }

  async getPageViewCount(pageName: string, ipAddress?: string): Promise<number> {
    let conditions = [eq(pageViews.pageName, pageName), eq(pageViews.subdomainId, this.subdomainId)];
    if (ipAddress) {
      conditions.push(eq(pageViews.ipAddress, ipAddress));
    }
    const [result] = await db.select({ count: sql`count(*)` })
      .from(pageViews)
      .where(and(...conditions));
    return Number(result.count) || 0;
  }

  // Click-through tracking methods
  async createClickThru(clickThruData: InsertClickThru): Promise<ClickThru> {
    const [newClickThru] = await db.insert(clickThru)
      .values({ ...clickThruData, subdomainId: this.subdomainId })
      .returning();
    return newClickThru;
  }

    async getClickThrus(pageName?: string, limit = 100): Promise<ClickThru[]> {
    if (pageName) {
      return await db.select().from(clickThru)
        .where(and(eq(clickThru.pageName, pageName), eq(clickThru.subdomainId, this.subdomainId)))
        .orderBy(desc(clickThru.createdAt))
        .limit(limit);
    }
    
    return await db.select().from(clickThru)
      .where(eq(clickThru.subdomainId, this.subdomainId))
      .orderBy(desc(clickThru.createdAt))
      .limit(limit);
  }

  async getClickThruCount(advertisementId: string): Promise<number> {
    const [result] = await db.select({ count: sql`count(*)` })
      .from(clickThru)
      .where(and(eq(clickThru.advertisementId, advertisementId), eq(clickThru.subdomainId, this.subdomainId)));
    
    return Number(result.count) || 0;
  }

  async getClickThruAnalytics(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await db.select({
      advertisementId: clickThru.advertisementId,
      advertisementTitle: clickThru.advertisementTitle,
      pageName: clickThru.pageName,
      pageUrl: clickThru.pageUrl,
      bannerPosition: clickThru.bannerPosition,
      date: sql`DATE(${clickThru.createdAt})`.as('date'),
      clickCount: sql`COUNT(*)`.as('clickCount'),
      uniqueClickers: sql`COUNT(DISTINCT ${clickThru.ipAddress})`.as('uniqueClickers')
    })
    .from(clickThru)
    .where(and(sql`${clickThru.createdAt} >= ${cutoffDate.toISOString()}`, eq(clickThru.subdomainId, this.subdomainId)))
    .groupBy(
      clickThru.advertisementId,
      clickThru.advertisementTitle,
      clickThru.pageName, 
      clickThru.pageUrl,
      clickThru.bannerPosition,
      sql`DATE(${clickThru.createdAt})`
    )
    .orderBy(sql`DATE(${clickThru.createdAt}) DESC`, desc(sql`COUNT(*)`));

    return result.map(row => ({
      advertisementId: row.advertisementId,
      advertisementTitle: row.advertisementTitle,
      pageName: row.pageName,
      pageUrl: row.pageUrl,
      bannerPosition: row.bannerPosition,
      date: row.date,
      clickCount: Number(row.clickCount),
      uniqueClickers: Number(row.uniqueClickers)
    }));
  }

  // Analytics methods
  async getPageViewAnalytics(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await db.select({
      pageName: pageViews.pageName,
      pageUrl: pageViews.pageUrl,
      date: sql`DATE(${pageViews.createdAt})`.as('date'),
      viewCount: sql`COUNT(*)`.as('viewCount'),
      uniqueVisitors: sql`COUNT(DISTINCT ${pageViews.ipAddress})`.as('uniqueVisitors')
    })
    .from(pageViews)
    .where(and(sql`${pageViews.createdAt} >= ${cutoffDate.toISOString()}`, eq(pageViews.subdomainId, this.subdomainId)))
    .groupBy(pageViews.pageName, pageViews.pageUrl, sql`DATE(${pageViews.createdAt})`)
    .orderBy(sql`DATE(${pageViews.createdAt}) DESC`);

    return result.map(row => ({
      pageName: row.pageName,
      pageUrl: row.pageUrl,
      date: row.date,
      viewCount: Number(row.viewCount),
      uniqueVisitors: Number(row.uniqueVisitors)
    }));
  }

  async getDailySummary(days: number): Promise<any[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const result = await db.select({
      date: sql`DATE(${pageViews.createdAt})`.as('date'),
      totalViews: sql`COUNT(*)`.as('totalViews'),
      uniquePages: sql`COUNT(DISTINCT ${pageViews.pageUrl})`.as('uniquePages'),
      topPage: sql`
        (SELECT ${pageViews.pageName} 
         FROM ${pageViews} pv2 
         WHERE DATE(pv2.created_at) = DATE(${pageViews.createdAt})
         GROUP BY pv2.page_name 
         ORDER BY COUNT(*) DESC 
         LIMIT 1)
      `.as('topPage')
    })
    .from(pageViews)
    .where(and(sql`${pageViews.createdAt} >= ${cutoffDate.toISOString()}`, eq(pageViews.subdomainId, this.subdomainId)))
    .groupBy(sql`DATE(${pageViews.createdAt})`)
    .orderBy(sql`DATE(${pageViews.createdAt}) DESC`);

    return result.map(row => ({
      date: row.date,
      totalViews: Number(row.totalViews),
      uniquePages: Number(row.uniquePages),
      topPage: row.topPage || 'N/A'
    }));
  }

  // Site Settings
  async getSiteSettings(): Promise<SiteSettings> {
    // Get first site settings record or create default if none exists
    let [settings] = await db.select().from(siteSettings).where(eq(siteSettings.subdomainId, this.subdomainId)).limit(1);
    
    if (!settings) {
      // Create default settings if none exist
      [settings] = await db.insert(siteSettings).values({
        siteName: "NetDiscount",
        siteDescription: "Deal Aggregation Platform",
        subdomainId: this.subdomainId
      }).returning();
    }
    
    return settings;
  }

  async updateSiteSettings(updates: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    // Get existing settings or create if none exist
    const existingSettings = await this.getSiteSettings();
    
    // Update the settings
    const [updatedSettings] = await db
      .update(siteSettings)
      .set({ ...updates, updatedAt: sql`now()` })
      .where(and(eq(siteSettings.id, existingSettings.id), eq(siteSettings.subdomainId, this.subdomainId)))
      .returning();
    
    return updatedSettings;
  }

  // User favorites
  async getUserFavorites(userId: string, pageUrl?: string): Promise<string[]> {
    let whereConditions = [eq(userFavorites.userId, userId), eq(userFavorites.subdomainId, this.subdomainId)];
    
    if (pageUrl) {
      whereConditions.push(eq(userFavorites.pageUrl, pageUrl));
    }
    
    const favorites = await db
      .select({ dealId: userFavorites.dealId })
      .from(userFavorites)
      .where(and(...whereConditions));
    
    return favorites.map(f => f.dealId);
  }

  async addUserFavorite(userId: string, dealId: string, pageUrl: string): Promise<void> {
    try {
      await db.insert(userFavorites).values({ userId, dealId, pageUrl, subdomainId: this.subdomainId });
    } catch (error) {
      // Handle unique constraint violation silently (user already favorited this deal on this page)
      if (error instanceof Error && !error.message.includes('unique_user_deal_page')) {
        throw error;
      }
    }
  }

  async removeUserFavorite(userId: string, dealId: string, pageUrl: string): Promise<void> {
    await db
      .delete(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId), 
        eq(userFavorites.dealId, dealId),
        eq(userFavorites.subdomainId, this.subdomainId),
        // eq(userFavorites.pageUrl, pageUrl)
      ));
  }

  async isUserFavorite(userId: string, dealId: string, pageUrl: string): Promise<boolean> {
    const [favorite] = await db
      .select()
      .from(userFavorites)
      .where(and(
        eq(userFavorites.userId, userId), 
        eq(userFavorites.dealId, dealId),
        eq(userFavorites.subdomainId, this.subdomainId),
        // eq(userFavorites.pageUrl, pageUrl)
      ))
      .limit(1);
    
    return !!favorite;
  }
}

export const storage = new DatabaseStorage();
