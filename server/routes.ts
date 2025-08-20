import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategoriesWithChildren();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ error: "Failed to fetch category" });
    }
  });

  // Stores
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/stores/featured", async (req, res) => {
    try {
      const stores = await storage.getFeaturedStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching featured stores:", error);
      res.status(500).json({ error: "Failed to fetch featured stores" });
    }
  });

  app.get("/api/stores/letter/:letter", async (req, res) => {
    try {
      const letter = req.params.letter.toUpperCase();
      if (!letter.match(/^[A-Z]$/) && letter !== '0-9') {
        return res.status(400).json({ error: "Invalid letter parameter" });
      }
      const stores = await storage.getStoresByLetter(letter);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores by letter:", error);
      res.status(500).json({ error: "Failed to fetch stores by letter" });
    }
  });

  app.get("/api/stores/:slug", async (req, res) => {
    try {
      const store = await storage.getStoreBySlug(req.params.slug);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      res.json(store);
    } catch (error) {
      console.error("Error fetching store:", error);
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });

  // Deals
  app.get("/api/deals", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const deals = await storage.getDeals(limit);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const deals = await storage.getFeaturedDeals(limit);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching featured deals:", error);
      res.status(500).json({ error: "Failed to fetch featured deals" });
    }
  });

  app.get("/api/deals/category/:slug", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const deals = await storage.getDealsByCategory(req.params.slug, limit);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals by category:", error);
      res.status(500).json({ error: "Failed to fetch deals by category" });
    }
  });

  app.get("/api/deals/store/:slug", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const deals = await storage.getDealsByStore(req.params.slug, limit);
      res.json(deals);
    } catch (error) {
      console.error("Error fetching deals by store:", error);
      res.status(500).json({ error: "Failed to fetch deals by store" });
    }
  });

  app.get("/api/deals/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const limit = parseInt(req.query.limit as string) || 20;
      const deals = await storage.searchDeals(query, limit);
      res.json(deals);
    } catch (error) {
      console.error("Error searching deals:", error);
      res.status(500).json({ error: "Failed to search deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDealById(req.params.id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      console.error("Error fetching deal:", error);
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  // Video Channels
  app.get("/api/video-channels", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const channels = await storage.getVideoChannels(limit);
      res.json(channels);
    } catch (error) {
      console.error("Error fetching video channels:", error);
      res.status(500).json({ error: "Failed to fetch video channels" });
    }
  });

  app.get("/api/video-channels/:id", async (req, res) => {
    try {
      const channel = await storage.getVideoChannelById(req.params.id);
      if (!channel) {
        return res.status(404).json({ error: "Video channel not found" });
      }
      res.json(channel);
    } catch (error) {
      console.error("Error fetching video channel:", error);
      res.status(500).json({ error: "Failed to fetch video channel" });
    }
  });

  // Posts endpoints
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const query = req.query.q as string;
      
      let posts;
      if (query) {
        posts = await storage.searchPosts(query, limit);
      } else {
        posts = await storage.getPosts(limit);
      }
      
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const post = await storage.getPostById(req.params.id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  // YouTube Videos API
  app.get("/api/youtube-videos", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const search = req.query.search as string;
      
      let videos;
      if (search) {
        videos = await storage.searchYoutubeVideos(search, limit);
      } else {
        videos = await storage.getYoutubeVideos(limit);
      }
      
      res.json(videos);
    } catch (error) {
      console.error("Error fetching YouTube videos:", error);
      res.status(500).json({ error: "Failed to fetch YouTube videos" });
    }
  });

  app.get("/api/youtube-videos/:id", async (req, res) => {
    try {
      const video = await storage.getYoutubeVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "YouTube video not found" });
      }
      res.json(video);
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
      res.status(500).json({ error: "Failed to fetch YouTube video" });
    }
  });

  // Blogs API
  app.get("/api/blogs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const search = req.query.search as string;
      
      let blogs;
      if (search) {
        blogs = await storage.searchBlogs(search, limit);
      } else {
        blogs = await storage.getBlogs(limit);
      }
      
      res.json(blogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      res.status(500).json({ error: "Failed to fetch blogs" });
    }
  });

  app.get("/api/blogs/:id", async (req, res) => {
    try {
      const blog = await storage.getBlogById(req.params.id);
      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }
      res.json(blog);
    } catch (error) {
      console.error("Error fetching blog:", error);
      res.status(500).json({ error: "Failed to fetch blog" });
    }
  });

  // Seed posts endpoint
  app.post("/api/seed-posts", async (req, res) => {
    try {
      console.log("Starting to seed posts...");
      await seedPosts();
      console.log("Posts seeded successfully!");
      res.json({ message: "Posts seeded successfully" });
    } catch (error) {
      console.error("Error seeding posts:", error);
      res.status(500).json({ error: "Failed to seed posts", details: error.message });
    }
  });

  // Seed YouTube videos endpoint
  app.post("/api/seed-youtube-videos", async (req, res) => {
    try {
      console.log("Starting to seed YouTube videos...");
      await seedYoutubeVideos();
      console.log("YouTube videos seeded successfully!");
      res.json({ message: "YouTube videos seeded successfully" });
    } catch (error) {
      console.error("Error seeding YouTube videos:", error);
      res.status(500).json({ error: "Failed to seed YouTube videos", details: error.message });
    }
  });

  // Seed blogs endpoint
  app.post("/api/seed-blogs", async (req, res) => {
    try {
      console.log("Starting to seed blogs...");
      await seedBlogs();
      console.log("Blogs seeded successfully!");
      res.json({ message: "Blogs seeded successfully" });
    } catch (error) {
      console.error("Error seeding blogs:", error);
      res.status(500).json({ error: "Failed to seed blogs", details: error.message });
    }
  });

  // Seed video channels endpoint
  app.post("/api/seed-videos", async (req, res) => {
    try {
      await seedVideoChannels();
      res.json({ message: "Video channels seeded successfully" });
    } catch (error) {
      console.error("Error seeding video channels:", error);
      res.status(500).json({ error: "Failed to seed video channels" });
    }
  });

  // Seed data endpoint for development
  app.post("/api/seed", async (req, res) => {
    try {
      await seedDatabase();
      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Error seeding database:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function seedDatabase() {
  // Create categories
  const computersCategory = await storage.createCategory({
    name: "Computers",
    slug: "computers",
    description: "Laptops, desktops, and computer accessories",
    parentId: null,
    isActive: true,
    sortOrder: 1,
  });

  const electronicsCategory = await storage.createCategory({
    name: "Electronics",
    slug: "electronics",
    description: "Consumer electronics and gadgets",
    parentId: null,
    isActive: true,
    sortOrder: 2,
  });

  const lifestyleCategory = await storage.createCategory({
    name: "Lifestyle & Home",
    slug: "lifestyle-home",
    description: "Home and lifestyle products",
    parentId: null,
    isActive: true,
    sortOrder: 3,
  });

  const businessCategory = await storage.createCategory({
    name: "Small Business",
    slug: "small-business",
    description: "Business equipment and services",
    parentId: null,
    isActive: true,
    sortOrder: 4,
  });

  // Create stores
  const amazonStore = await storage.createStore({
    name: "Amazon",
    slug: "amazon",
    description: "Online marketplace with everything from A to Z",
    logoUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://amazon.com",
    isActive: true,
    featured: true,
  });

  const dellStore = await storage.createStore({
    name: "Dell",
    slug: "dell",
    description: "Computers, laptops, and technology solutions",
    logoUrl: "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://dell.com",
    isActive: true,
    featured: true,
  });

  const dellTechStore = await storage.createStore({
    name: "Dell Technologies",
    slug: "dell-technologies",
    description: "Enterprise technology solutions and products",
    logoUrl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://delltechnologies.com",
    isActive: true,
    featured: true,
  });

  const hpStore = await storage.createStore({
    name: "HP",
    slug: "hp",
    description: "Personal systems, printers, and 3D printing solutions",
    logoUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://hp.com",
    isActive: true,
    featured: true,
  });

  const lenovoStore = await storage.createStore({
    name: "Lenovo",
    slug: "lenovo",
    description: "PCs, workstations, servers, and smart devices",
    logoUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://lenovo.com",
    isActive: true,
    featured: true,
  });

  const microsoftStore = await storage.createStore({
    name: "Microsoft",
    slug: "microsoft",
    description: "Software, hardware, and cloud services",
    logoUrl: "https://pixabay.com/get/ge3ae5b31333907d8ca6c540315256f6832cdf59542a42251f67ef533d9c7d5f0fd47d246c9f3beb643800c7545ae66176d7598d3de40c8841ef8441abd74ce09_1280.jpg",
    websiteUrl: "https://microsoft.com",
    isActive: true,
    featured: true,
  });

  const tmobileStore = await storage.createStore({
    name: "T-Mobile",
    slug: "t-mobile",
    description: "Wireless carrier with nationwide coverage",
    logoUrl: "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://t-mobile.com",
    isActive: true,
    featured: true,
  });

  const verizonStore = await storage.createStore({
    name: "Verizon",
    slug: "verizon",
    description: "Wireless services and technology solutions",
    logoUrl: "https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://verizon.com",
    isActive: true,
    featured: true,
  });

  const neweggStore = await storage.createStore({
    name: "Newegg",
    slug: "newegg",
    description: "Computer hardware, electronics, and tech products",
    logoUrl: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100",
    websiteUrl: "https://newegg.com",
    isActive: true,
    featured: true,
  });

  // Create sample deals
  await storage.createDeal({
    title: "Dell Refurbished Sale: Up to 50% on select Latitude Laptops, OptiPlex Desktops, and More",
    description: "Dell Refurbished is offering Up to 50% off on select Laptops, Desktops, and Accessories with coupon codes below. Free shipping for the month of August. Coupons are not valid on Clearance, Hot Deals, Sale items or warranties.",
    originalPrice: "1999.99",
    salePrice: "999.99",
    discountPercent: 50,
    couponCode: "BACK2SCHOOL45",
    dealUrl: "https://dell.com/refurbished-sale",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    rating: "4.5",
    reviewCount: 1247,
    storeId: dellStore.id,
    categoryId: computersCategory.id,
    isActive: true,
    isFeatured: true,
    authorName: "Eric",
  });

  await storage.createDeal({
    title: "Dell New Tower Plus Intel Core Ultra 7 265 Gaming Desktop",
    description: "Powerful gaming desktop featuring Intel Core Ultra 7 265 processor, 16GB DDR5 RAM, 1TB NVMe SSD, and dedicated graphics card. Perfect for gaming, content creation, and professional workloads.",
    originalPrice: "1199.99",
    salePrice: "899.99",
    discountPercent: 25,
    couponCode: null,
    dealUrl: "https://dell.com/gaming-desktop",
    imageUrl: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    rating: "4.7",
    reviewCount: 2341,
    storeId: dellStore.id,
    categoryId: computersCategory.id,
    isActive: true,
    isFeatured: true,
    authorName: "Sourabh Kalantri",
  });

  await storage.createDeal({
    title: "ULTRALOQ Bolt Fingerprint Smart Lock, Works with Apple HomeKit",
    description: "Advanced fingerprint smart lock with Apple HomeKit compatibility. Features multiple unlock methods, weather-resistant design, and easy installation.",
    originalPrice: "199.99",
    salePrice: "159.99",
    discountPercent: 20,
    couponCode: "SMART20",
    dealUrl: "https://amazon.com/ultraloq-smart-lock",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    rating: "4.4",
    reviewCount: 3583,
    storeId: amazonStore.id,
    categoryId: lifestyleCategory.id,
    isActive: true,
    isFeatured: true,
    authorName: "TechBargains Team",
  });

  await storage.createDeal({
    title: "HP Pavilion 15.6\" Laptop - Intel Core i5, 8GB RAM, 256GB SSD",
    description: "Reliable laptop for everyday computing with Intel Core i5 processor, 8GB RAM, and fast SSD storage. Perfect for work, school, and entertainment.",
    originalPrice: "699.99",
    salePrice: "549.99",
    discountPercent: 21,
    couponCode: null,
    dealUrl: "https://hp.com/pavilion-laptop",
    imageUrl: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    rating: "4.3",
    reviewCount: 1892,
    storeId: hpStore.id,
    categoryId: computersCategory.id,
    isActive: true,
    isFeatured: false,
    authorName: "HP Deals Team",
  });

  await storage.createDeal({
    title: "Lenovo ThinkPad E15 Business Laptop - AMD Ryzen 5, 16GB RAM",
    description: "Professional business laptop with AMD Ryzen 5 processor, 16GB RAM, and premium build quality. Ideal for business users and professionals.",
    originalPrice: "849.99",
    salePrice: "679.99",
    discountPercent: 20,
    couponCode: "BUSINESS20",
    dealUrl: "https://lenovo.com/thinkpad-e15",
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200",
    rating: "4.6",
    reviewCount: 967,
    storeId: lenovoStore.id,
    categoryId: computersCategory.id,
    isActive: true,
    isFeatured: false,
    authorName: "Business Deals",
  });

  await storage.createDeal({
    title: "Microsoft Surface Pro 9 - Intel Core i7, 16GB RAM, 512GB SSD",
    description: "Versatile 2-in-1 tablet and laptop with Intel Core i7 processor, 16GB RAM, and 512GB SSD. Includes Surface Pen and Type Cover.",
    originalPrice: "1599.99",
    salePrice: "1199.99",
    discountPercent: 25,
    couponCode: null,
    dealUrl: "https://microsoft.com/surface-pro-9",
    imageUrl: "https://pixabay.com/get/ge3ae5b31333907d8ca6c540315256f6832cdf59542a42251f67ef533d9c7d5f0fd47d246c9f3beb643800c7545ae66176d7598d3de40c8841ef8441abd74ce09_1280.jpg",
    rating: "4.5",
    reviewCount: 1456,
    storeId: microsoftStore.id,
    categoryId: computersCategory.id,
    isActive: true,
    isFeatured: false,
    authorName: "Microsoft Team",
  });

  // Create video channels based on Vimeo bicycle channels data
  await storage.createVideoChannel({
    title: "Longtail Cargo Utility Bicycles",
    description: "Specialized content about cargo and utility bicycles for transportation and business use",
    thumbnailUrl: "https://i.vimeocdn.com/video/235112144-3e096dd7d8437c5f01590af4282e7eb0f4c0416bddbf982c6e1f4279575acd1f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/38189",
    videoCount: 58,
    followerCount: 17,
    tags: ["bicycles", "cargo bikes", "utility", "transportation"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Rocky Mountain Bicycles Service Videos",
    description: "Professional bicycle service and maintenance tutorials from Rocky Mountain Bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/280896927-f43b01434806378e9fbb51bd1fc8420b4962e54d0763fbe6a1d74dad2c2c9b9b-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/rmbservice",
    videoCount: 6,
    followerCount: 57,
    tags: ["bicycles", "maintenance", "service", "tutorials"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "AUTUM Bicycles Berlin",
    description: "Urban cycling culture and bicycle lifestyle content from Berlin",
    thumbnailUrl: "https://i.vimeocdn.com/video/485305348-ee5407bf784aee38cd8baf9fe242efe95a73a8694ea82a7901dec6dfa06ebde9-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/autum",
    videoCount: 31,
    followerCount: 16,
    tags: ["bicycles", "urban", "berlin", "lifestyle"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Riding of Bicycles",
    description: "General bicycle riding content, techniques, and experiences",
    thumbnailUrl: "https://i.vimeocdn.com/video/53041787-bd16797821717702a15ce57fd851f19fd86f4dfc447555a0276c6ba5de660a46-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/ridingofbikes",
    videoCount: 20,
    followerCount: 16,
    tags: ["bicycles", "riding", "techniques", "experiences"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Mongoose Bicycles",
    description: "Official content from Mongoose Bicycles featuring BMX and mountain biking",
    thumbnailUrl: "https://i.vimeocdn.com/video/270730651-848cf3d9572c3f199d9ad31702acc8491640d04a0fc6dec7490a385c935b2eed-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/280411",
    videoCount: 13,
    followerCount: 13,
    tags: ["bicycles", "mongoose", "bmx", "mountain biking"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Traveling the world on a bicycle",
    description: "Adventure cycling and bicycle touring around the world",
    thumbnailUrl: "https://i.vimeocdn.com/video/535849768-767db63193571d33485831ddf4567d477dd2c5e448f69add36ece8d8c2c605dc-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/worldonbicycle",
    videoCount: 38,
    followerCount: 160,
    tags: ["bicycles", "travel", "touring", "adventure"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Trek bicycles",
    description: "Official Trek Bicycles content showcasing their bike lineup and technology",
    thumbnailUrl: "https://i.vimeocdn.com/video/491486653-b63308860584c36275baa9221f5e3915328bc64386977672f30dbd5b988155d0-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/818846",
    videoCount: 7,
    followerCount: 11,
    tags: ["bicycles", "trek", "technology", "cycling"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Morvelo",
    description: "Cycling apparel and lifestyle brand content",
    thumbnailUrl: "https://i.vimeocdn.com/video/784380627-2881468e06d8dbb6d6ab5606682872023d09c0b163b0d5602340c64c0307dd89-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/morvelo",
    videoCount: 52,
    followerCount: 66,
    tags: ["cycling", "apparel", "lifestyle", "fashion"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "The bicycle channel",
    description: "General bicycle content covering all aspects of cycling culture",
    thumbnailUrl: "https://i.vimeocdn.com/video/509023087-d00e24d77621b4c27e4a29ebada6ac67a8ab4074d175ed5b6302d92d2ab91a43-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/349250",
    videoCount: 15,
    followerCount: 71,
    tags: ["bicycles", "cycling", "culture", "general"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Protected Bike Lane Bonanza (Streetfilms)",
    description: "Advocacy and documentation of protected bike lane infrastructure",
    thumbnailUrl: "https://i.vimeocdn.com/video/1236149513-909cc7631966deb011586dca6483344b7f19de84126645aada1f7269966b04ab-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/protectedbikelanes",
    videoCount: 112,
    followerCount: 43,
    tags: ["bicycles", "infrastructure", "advocacy", "urban planning"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "One Billion Bicycles - the global bicycle story",
    description: "Documentary content about the global impact and story of bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/472806633-afcdbadfbbb164601427cd5f51e17f115a08826e1d3ce434a000a843ed707e8f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/onebillionbicycles",
    videoCount: 11,
    followerCount: 13,
    tags: ["bicycles", "documentary", "global", "history"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Brompton",
    description: "Official content from Brompton folding bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/434477136-facf357d96291c2035017485985a358d976e907ff1fcefa28b55dbb24f5fc20f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/brompton",
    videoCount: 43,
    followerCount: 35,
    tags: ["bicycles", "brompton", "folding bikes", "commuting"],
    isActive: true,
  });
}

async function seedVideoChannels() {
  // Create video channels based on Vimeo bicycle channels data
  await storage.createVideoChannel({
    title: "Longtail Cargo Utility Bicycles",
    description: "Specialized content about cargo and utility bicycles for transportation and business use",
    thumbnailUrl: "https://i.vimeocdn.com/video/235112144-3e096dd7d8437c5f01590af4282e7eb0f4c0416bddbf982c6e1f4279575acd1f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/38189",
    videoCount: 58,
    followerCount: 17,
    tags: ["bicycles", "cargo bikes", "utility", "transportation"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Rocky Mountain Bicycles Service Videos",
    description: "Professional bicycle service and maintenance tutorials from Rocky Mountain Bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/280896927-f43b01434806378e9fbb51bd1fc8420b4962e54d0763fbe6a1d74dad2c2c9b9b-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/rmbservice",
    videoCount: 6,
    followerCount: 57,
    tags: ["bicycles", "maintenance", "service", "tutorials"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "AUTUM Bicycles Berlin",
    description: "Urban cycling culture and bicycle lifestyle content from Berlin",
    thumbnailUrl: "https://i.vimeocdn.com/video/485305348-ee5407bf784aee38cd8baf9fe242efe95a73a8694ea82a7901dec6dfa06ebde9-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/autum",
    videoCount: 31,
    followerCount: 16,
    tags: ["bicycles", "urban", "berlin", "lifestyle"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Riding of Bicycles",
    description: "General bicycle riding content, techniques, and experiences",
    thumbnailUrl: "https://i.vimeocdn.com/video/53041787-bd16797821717702a15ce57fd851f19fd86f4dfc447555a0276c6ba5de660a46-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/ridingofbikes",
    videoCount: 20,
    followerCount: 16,
    tags: ["bicycles", "riding", "techniques", "experiences"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Mongoose Bicycles",
    description: "Official content from Mongoose Bicycles featuring BMX and mountain biking",
    thumbnailUrl: "https://i.vimeocdn.com/video/270730651-848cf3d9572c3f199d9ad31702acc8491640d04a0fc6dec7490a385c935b2eed-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/280411",
    videoCount: 13,
    followerCount: 13,
    tags: ["bicycles", "mongoose", "bmx", "mountain biking"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Traveling the world on a bicycle",
    description: "Adventure cycling and bicycle touring around the world",
    thumbnailUrl: "https://i.vimeocdn.com/video/535849768-767db63193571d33485831ddf4567d477dd2c5e448f69add36ece8d8c2c605dc-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/worldonbicycle",
    videoCount: 38,
    followerCount: 160,
    tags: ["bicycles", "travel", "touring", "adventure"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Trek bicycles",
    description: "Official Trek Bicycles content showcasing their bike lineup and technology",
    thumbnailUrl: "https://i.vimeocdn.com/video/491486653-b63308860584c36275baa9221f5e3915328bc64386977672f30dbd5b988155d0-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/818846",
    videoCount: 7,
    followerCount: 11,
    tags: ["bicycles", "trek", "technology", "cycling"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Morvelo",
    description: "Cycling apparel and lifestyle brand content",
    thumbnailUrl: "https://i.vimeocdn.com/video/784380627-2881468e06d8dbb6d6ab5606682872023d09c0b163b0d5602340c64c0307dd89-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/morvelo",
    videoCount: 52,
    followerCount: 66,
    tags: ["cycling", "apparel", "lifestyle", "fashion"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "The bicycle channel",
    description: "General bicycle content covering all aspects of cycling culture",
    thumbnailUrl: "https://i.vimeocdn.com/video/509023087-d00e24d77621b4c27e4a29ebada6ac67a8ab4074d175ed5b6302d92d2ab91a43-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/349250",
    videoCount: 15,
    followerCount: 71,
    tags: ["bicycles", "cycling", "culture", "general"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Protected Bike Lane Bonanza (Streetfilms)",
    description: "Advocacy and documentation of protected bike lane infrastructure",
    thumbnailUrl: "https://i.vimeocdn.com/video/1236149513-909cc7631966deb011586dca6483344b7f19de84126645aada1f7269966b04ab-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/protectedbikelanes",
    videoCount: 112,
    followerCount: 43,
    tags: ["bicycles", "infrastructure", "advocacy", "urban planning"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "One Billion Bicycles - the global bicycle story",
    description: "Documentary content about the global impact and story of bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/472806633-afcdbadfbbb164601427cd5f51e17f115a08826e1d3ce434a000a843ed707e8f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/onebillionbicycles",
    videoCount: 11,
    followerCount: 13,
    tags: ["bicycles", "documentary", "global", "history"],
    isActive: true,
  });

  await storage.createVideoChannel({
    title: "Brompton",
    description: "Official content from Brompton folding bicycles",
    thumbnailUrl: "https://i.vimeocdn.com/video/434477136-facf357d96291c2035017485985a358d976e907ff1fcefa28b55dbb24f5fc20f-d_640x360?&r=pad&region=us",
    channelUrl: "https://vimeo.com/channels/brompton",
    videoCount: 43,
    followerCount: 35,
    tags: ["bicycles", "brompton", "folding bikes", "commuting"],
    isActive: true,
  });
}


async function seedPosts() {
  // Create houseplant care posts similar to Reddit posts
  await storage.createPost({
    title: "My pothos is turning yellow, what am I doing wrong?",
    content: "I've had this golden pothos for about 6 months and recently the leaves have been turning yellow and dropping. I water it once a week and it sits near a north-facing window. The soil seems to dry out pretty quickly. Any advice would be appreciated!",
    author: "plantlover123",
    subreddit: "houseplants",
    imageUrl: "https://images.unsplash.com/photo-1586094823842-a95e2c7e9203?w=400&h=300&fit=crop",
    postUrl: "https://reddit.com/r/houseplants/comments/example1",
    upvotes: 156,
    commentCount: 23,
    tags: ["pothos", "yellowing", "help", "watering"],
    isActive: true,
  });

  await storage.createPost({
    title: "Snake plant care guide for beginners",
    content: "Just got my first snake plant (Sansevieria trifasciata) and want to make sure I don't kill it! Here's what I've learned so far: They prefer bright, indirect light but can tolerate low light. Water sparingly - only when soil is completely dry. They're very forgiving and perfect for beginners.",
    author: "greenthumb_newbie",
    subreddit: "plantcarehelp",
    imageUrl: "https://images.unsplash.com/photo-1599585397600-0c26b0348957?w=400&h=300&fit=crop",
    postUrl: "https://reddit.com/r/plantcarehelp/comments/example2",
    upvotes: 89,
    commentCount: 12,
    tags: ["snake plant", "sansevieria", "beginner", "care guide"],
    isActive: true,
  });

  await storage.createPost({
    title: "Best low-light plants for a bathroom?",
    content: "My bathroom has no windows but gets some light from the hallway. Looking for plants that can survive in low light and high humidity. I was thinking about a ZZ plant or maybe a peace lily? Any other suggestions?",
    author: "bathroomjungle",
    subreddit: "indoorgarden",
    imageUrl: "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=400&h=300&fit=crop",
    postUrl: "https://reddit.com/r/indoorgarden/comments/example6",
    upvotes: 78,
    commentCount: 19,
    tags: ["low light", "bathroom", "humidity", "ZZ plant", "peace lily"],
    isActive: true,
  });
}

async function seedYoutubeVideos() {
  // Create YouTube-style houseplant care videos similar to YouTube search results
  await storage.createYoutubeVideo({
    title: "Houseplant Care for Beginners: Essential Tips for Indoor Plants",
    description: "Learn the basics of houseplant care in this comprehensive guide. We cover watering, lighting, fertilizing, and common mistakes to avoid when caring for your indoor plants.",
    channelName: "Plant Paradise",
    channelUrl: "https://youtube.com/c/plantparadise",
    videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnailUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=480&h=360&fit=crop",
    duration: "15:42",
    viewCount: 245678,
    uploadDate: "2 weeks ago",
    tags: ["houseplant care", "beginner", "indoor plants", "plant tips"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Why Your Houseplants Keep Dying (and How to Fix It)",
    description: "Discover the most common reasons why houseplants die and learn proven techniques to keep your plants thriving. This video will transform your plant parent skills!",
    channelName: "The Plant Doctor",
    channelUrl: "https://youtube.com/c/theplantdoctor",
    videoUrl: "https://youtube.com/watch?v=example2",
    thumbnailUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=480&h=360&fit=crop",
    duration: "12:18",
    viewCount: 189543,
    uploadDate: "1 week ago",
    tags: ["plant problems", "dying plants", "plant care", "troubleshooting"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "10 Best Low Light Houseplants That Anyone Can Grow",
    description: "Perfect for apartments and dark spaces! These low-light houseplants are nearly impossible to kill and will thrive in your home with minimal care.",
    channelName: "Indoor Jungle",
    channelUrl: "https://youtube.com/c/indoorjungle",
    videoUrl: "https://youtube.com/watch?v=example3",
    thumbnailUrl: "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=480&h=360&fit=crop",
    duration: "18:35",
    viewCount: 342156,
    uploadDate: "3 days ago",
    tags: ["low light plants", "apartment plants", "easy care", "plant collection"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "How to Water Houseplants: The Ultimate Guide",
    description: "Master the art of watering your houseplants! Learn when, how much, and what type of water to use for different plant species.",
    channelName: "Green Thumb Academy",
    channelUrl: "https://youtube.com/c/greenthumbacademy",
    videoUrl: "https://youtube.com/watch?v=example4",
    thumbnailUrl: "https://images.unsplash.com/photo-1586094823842-a95e2c7e9203?w=480&h=360&fit=crop",
    duration: "21:07",
    viewCount: 156789,
    uploadDate: "5 days ago",
    tags: ["watering plants", "plant care", "watering schedule", "plant health"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Propagating Houseplants: Free Plants Forever!",
    description: "Learn how to propagate popular houseplants like pothos, snake plants, and rubber trees. Turn one plant into dozens with these simple techniques!",
    channelName: "Propagation Station",
    channelUrl: "https://youtube.com/c/propagationstation",
    videoUrl: "https://youtube.com/watch?v=example5",
    thumbnailUrl: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=480&h=360&fit=crop",
    duration: "16:23",
    viewCount: 298745,
    uploadDate: "1 week ago",
    tags: ["propagation", "plant propagation", "free plants", "cuttings"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Common Houseplant Pests and How to Get Rid of Them",
    description: "Identify and eliminate common houseplant pests like spider mites, aphids, and fungus gnats with these proven organic and chemical-free methods.",
    channelName: "Plant Clinic",
    channelUrl: "https://youtube.com/c/plantclinic",
    videoUrl: "https://youtube.com/watch?v=example6",
    thumbnailUrl: "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=480&h=360&fit=crop",
    duration: "14:52",
    viewCount: 187632,
    uploadDate: "4 days ago",
    tags: ["plant pests", "pest control", "organic solutions", "plant health"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Creating the Perfect Plant Room Tour | 100+ Houseplants",
    description: "Take a tour of my incredible plant room featuring over 100 different houseplant species! Get inspiration for your own indoor jungle setup.",
    channelName: "Plant Mama",
    channelUrl: "https://youtube.com/c/plantmama",
    videoUrl: "https://youtube.com/watch?v=example7",
    thumbnailUrl: "https://images.unsplash.com/photo-1558603668-6570496b66f8?w=480&h=360&fit=crop",
    duration: "25:41",
    viewCount: 423156,
    uploadDate: "6 days ago",
    tags: ["plant room tour", "plant collection", "indoor jungle", "plant inspiration"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Houseplant Fertilizer Guide: When, What, and How Much",
    description: "Everything you need to know about fertilizing houseplants! Learn about different fertilizer types, feeding schedules, and seasonal care tips.",
    channelName: "The Plant Guy",
    channelUrl: "https://youtube.com/c/theplantguy",
    videoUrl: "https://youtube.com/watch?v=example8",
    thumbnailUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=480&h=360&fit=crop",
    duration: "19:15",
    viewCount: 134567,
    uploadDate: "2 weeks ago",
    tags: ["plant fertilizer", "plant nutrition", "fertilizing tips", "plant growth"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Repotting Houseplants: Step-by-Step Tutorial",
    description: "Learn when and how to repot your houseplants for optimal growth. Includes soil recommendations, pot sizing, and troubleshooting common issues.",
    channelName: "Roots & Shoots",
    channelUrl: "https://youtube.com/c/rootsandshoots",
    videoUrl: "https://youtube.com/watch?v=example9",
    thumbnailUrl: "https://images.unsplash.com/photo-1510411268840-1c78bc76ac05?w=480&h=360&fit=crop",
    duration: "13:28",
    viewCount: 201834,
    uploadDate: "1 week ago",
    tags: ["repotting", "plant care", "potting soil", "root bound"],
    isActive: true,
  });

  await storage.createYoutubeVideo({
    title: "Winter Houseplant Care: Keeping Plants Alive in Cold Weather",
    description: "Discover essential winter care tips for houseplants. Learn how to maintain humidity, adjust watering schedules, and provide adequate light during colder months.",
    channelName: "Seasonal Plants",
    channelUrl: "https://youtube.com/c/seasonalplants",
    videoUrl: "https://youtube.com/watch?v=example10",
    thumbnailUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=480&h=360&fit=crop",
    duration: "17:06",
    viewCount: 156432,
    uploadDate: "3 weeks ago",
    tags: ["winter plant care", "humidity", "seasonal care", "plant survival"],
    isActive: true,
  });
}

async function seedBlogs() {
  // Create realistic houseplant care blog posts based on actual popular blogs
  await storage.createBlog({
    title: "How to Master Houseplant Light Requirements: An Engineer's Approach",
    description: "Learn the science behind light requirements for houseplants with practical measurements and realistic expectations. No more guessing about 'bright indirect light' - get real data.",
    excerpt: "Understanding light requirements is the key to houseplant success. This guide provides scientific methods to measure and optimize light for your plants.",
    author: "Darryl Cheng",
    website: "House Plant Journal",
    websiteUrl: "https://www.houseplantjournal.com",
    blogUrl: "https://www.houseplantjournal.com/bright-indirect-light-requirements-by-plant/",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
    publishDate: "March 15, 2024",
    readTime: "8 min read",
    category: "Plant Care",
    tags: ["light requirements", "plant science", "houseplant care", "indoor gardening"],
    isActive: true,
  });

  await storage.createBlog({
    title: "The Ultimate Guide to Watering Houseplants: When, How Much, and What Type",
    description: "Master the art of watering your houseplants with this comprehensive guide. Learn when to water, how much water to use, and what type of water is best for different plant species.",
    excerpt: "Watering is the most crucial skill for plant parents. This guide covers everything from soil moisture to drainage and seasonal adjustments.",
    author: "Lisa Eldred Steinkopf",
    website: "The Houseplant Guru",
    websiteUrl: "https://thehouseplantguru.com",
    blogUrl: "https://thehouseplantguru.com/watering-houseplants-ultimate-guide/",
    imageUrl: "https://images.unsplash.com/photo-1586094823842-a95e2c7e9203?w=600&h=400&fit=crop",
    publishDate: "February 28, 2024",
    readTime: "12 min read",
    category: "Plant Care",
    tags: ["watering", "plant care", "houseplant tips", "plant health"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Best Low-Light Houseplants That Actually Thrive in Dark Spaces",
    description: "Discover the best low-light houseplants for your dim apartment or office. These plants don't just survive - they thrive in low-light conditions.",
    excerpt: "Not all plants need bright light to flourish. Here are proven low-light champions that will transform your dark spaces into green oases.",
    author: "Bloomscape Team",
    website: "Bloomscape",
    websiteUrl: "https://bloomscape.com",
    blogUrl: "https://bloomscape.com/plant-care/best-indoor-plants-small-spaces/",
    imageUrl: "https://images.unsplash.com/photo-1469796466635-455ede028aca?w=600&h=400&fit=crop",
    publishDate: "March 8, 2024",
    readTime: "10 min read",
    category: "Plant Selection",
    tags: ["low light plants", "apartment plants", "indoor gardening", "dark spaces"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Propagating Houseplants: Turn One Plant Into a Jungle",
    description: "Learn how to propagate popular houseplants like pothos, snake plants, and rubber trees. Turn one plant into dozens with these proven techniques!",
    excerpt: "Plant propagation is like magic - creating new plants from cuttings, divisions, and offsets. Here's how to multiply your plant collection for free.",
    author: "Jane Perrone",
    website: "On The Ledge",
    websiteUrl: "https://www.janeperrone.com",
    blogUrl: "https://www.janeperrone.com/blog/propagation-guide",
    imageUrl: "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=600&h=400&fit=crop",
    publishDate: "March 12, 2024",
    readTime: "15 min read",
    category: "Propagation",
    tags: ["propagation", "plant cuttings", "free plants", "plant multiplication"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Common Houseplant Pests: Identification and Organic Treatment",
    description: "Identify and eliminate common houseplant pests like spider mites, aphids, and fungus gnats with these proven organic and chemical-free methods.",
    excerpt: "Don't let pests destroy your plant paradise. Learn to identify common houseplant pests and treat them safely without harmful chemicals.",
    author: "Epic Gardening Team",
    website: "Epic Gardening",
    websiteUrl: "https://www.epicgardening.com",
    blogUrl: "https://www.epicgardening.com/houseplants/pest-control",
    imageUrl: "https://images.unsplash.com/photo-1563789031959-4c02bcb41319?w=600&h=400&fit=crop",
    publishDate: "February 20, 2024",
    readTime: "11 min read",
    category: "Plant Health",
    tags: ["plant pests", "pest control", "organic solutions", "plant problems"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Creating Your First Plant Room: Design Tips for Indoor Jungles",
    description: "Transform any room into a lush indoor jungle with these design tips, plant selection advice, and layout strategies for maximum impact.",
    excerpt: "Ready to create your dream plant room? Here's how to design a space that's both beautiful and functional for you and your plants.",
    author: "Urban Jungle Bloggers",
    website: "Urban Jungle Bloggers",
    websiteUrl: "https://urbanjunglebloggers.com",
    blogUrl: "https://urbanjunglebloggers.com/plant-room-design-guide/",
    imageUrl: "https://images.unsplash.com/photo-1558603668-6570496b66f8?w=600&h=400&fit=crop",
    publishDate: "March 5, 2024",
    readTime: "14 min read",
    category: "Interior Design",
    tags: ["plant room", "interior design", "plant styling", "indoor jungle"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Houseplant Fertilizer 101: Feed Your Plants Like a Pro",
    description: "Everything you need to know about fertilizing houseplants! Learn about different fertilizer types, feeding schedules, and seasonal care tips.",
    excerpt: "Proper nutrition is essential for healthy houseplants. Discover when, what, and how to fertilize your plants for optimal growth and vitality.",
    author: "Gardening Know How",
    website: "Gardening Know How",
    websiteUrl: "https://www.gardeningknowhow.com",
    blogUrl: "https://www.gardeningknowhow.com/houseplants/hpgen/fertilizing-houseplants.htm",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=400&fit=crop",
    publishDate: "February 25, 2024",
    readTime: "9 min read",
    category: "Plant Care",
    tags: ["fertilizer", "plant nutrition", "plant feeding", "plant growth"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Why Your Houseplants Keep Dying (And How to Save Them)",
    description: "Discover the most common reasons why houseplants die and learn proven techniques to diagnose problems and nurse your plants back to health.",
    excerpt: "Plant deaths are often preventable. Learn to read the warning signs and take corrective action before it's too late.",
    author: "Planterina",
    website: "Planterina",
    websiteUrl: "https://planterina.com",
    blogUrl: "https://planterina.com/blogs/care/why-houseplants-die",
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=400&fit=crop",
    publishDate: "March 1, 2024",
    readTime: "13 min read",
    category: "Plant Health",
    tags: ["plant problems", "dying plants", "plant rescue", "troubleshooting"],
    isActive: true,
  });

  await storage.createBlog({
    title: "The Science of Repotting: When and How to Give Plants New Homes",
    description: "Learn when and how to repot your houseplants for optimal growth. Includes soil recommendations, pot sizing, and troubleshooting common issues.",
    excerpt: "Repotting doesn't have to be stressful. Follow these science-based guidelines to give your plants the space they need to thrive.",
    author: "Horticulture Magazine",
    website: "Horticulture",
    websiteUrl: "https://www.hortmag.com",
    blogUrl: "https://www.hortmag.com/plants/houseplants/repotting-houseplants/",
    imageUrl: "https://images.unsplash.com/photo-1510411268840-1c78bc76ac05?w=600&h=400&fit=crop",
    publishDate: "February 18, 2024",
    readTime: "10 min read",
    category: "Plant Care",
    tags: ["repotting", "plant care", "potting soil", "root bound"],
    isActive: true,
  });

  await storage.createBlog({
    title: "Air-Purifying Plants: Science-Backed Benefits for Your Home",
    description: "Discover which houseplants actually purify indoor air based on NASA research. Learn how to create a healthier home environment with plants.",
    excerpt: "Not all air-purifying plant claims are equal. Here's what science says about plants that truly improve indoor air quality.",
    author: "Good Housekeeping Garden",
    website: "Good Housekeeping",
    websiteUrl: "https://www.goodhousekeeping.com",
    blogUrl: "https://www.goodhousekeeping.com/home/gardening/air-purifying-plants/",
    imageUrl: "https://images.unsplash.com/photo-1586094823842-a95e2c7e9203?w=600&h=400&fit=crop",
    publishDate: "March 10, 2024",
    readTime: "7 min read",
    category: "Plant Benefits",
    tags: ["air purifying plants", "NASA study", "indoor air quality", "health benefits"],
    isActive: true,
  });
}
