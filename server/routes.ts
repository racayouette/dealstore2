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
}
