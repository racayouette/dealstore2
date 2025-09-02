import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateSitemap, generateRobotsTxt } from "./sitemap";
import { z } from "zod";
import multer from "multer";
import csv from "csv-parser";
import { Readable } from "stream";
import fetch from "node-fetch";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { 
  categories, 
  stores, 
  deals, 
  products, 
  videoChannels,
  posts,
  youtubeVideos,
  blogs,
  advertisementBanners,
  bannerSettings,
  pageViews,
  clickThru,
  subdomains,
  businessCategories,
  businesses,
  businessHours,
  businessReviews,
  businessPhotos,
  users,
  newsletterSubscribers,
  newsletterPopupSettings,
  userFavorites,
  siteSettings
} from "@shared/schema";

// Helper function to extract subdomain from request
function getSubdomainFromRequest(req: any): string | null {
  // Try to get subdomain from query parameter first (for testing)
  if (req.query.subdomain) {
    return req.query.subdomain as string;
  }
  
  // Extract subdomain from Host header
  const host = req.get('host') || '';
  const hostParts = host.split('.');
  
  // If the host is like 'subdomain.example.com', get the first part
  if (hostParts.length >= 3) {
    const potentialSubdomain = hostParts[0];
    // Exclude common subdomains that aren't tenant subdomains
    if (!['www', 'api', 'admin'].includes(potentialSubdomain)) {
      return potentialSubdomain;
    }
  }
  
  return null; // Default/main site (no subdomain filtering)
}

// Helper function to get subdomain ID from subdomain string
async function getSubdomainId(subdomainString: string | null): Promise<string | null> {
  if (!subdomainString) return null;
  
  try {
    const [subdomainRecord] = await db
      .select({ id: subdomains.id })
      .from(subdomains)
      .where(eq(subdomains.subdomain, subdomainString))
      .limit(1);
    
    return subdomainRecord?.id || null;
  } catch (error) {
    console.error('Error fetching subdomain ID:', error);
    return null;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).send("Username, email, and password are required");
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).send("Email already exists");
      }

      // Create new user
      const user = await storage.createUser({
        username,
        email,
        password, // In production, this should be hashed
      });

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).send("Registration failed");
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).send("Username and password are required");
      }

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) { // In production, use proper password hashing
        return res.status(401).send("Invalid username or password");
      }

      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).send("Login failed");
    }
  });

  // Admin authentication endpoints
  app.post('/api/admin/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Simple demo authentication - in production this would check against a secure database
    if (username === 'admin' && password === 'netdiscount2024') {
      const token = `admin_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        success: true,
        token,
        username,
        message: 'Login successful'
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Invalid username or password'
      });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const result = await storage.getUsersWithPagination(page, limit);
      
      // Remove passwords from response
      const safeUsers = result.users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      res.json({
        users: safeUsers,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Failed to fetch users");
    }
  });

  // Export users as CSV
  app.get("/api/admin/users/export", async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      
      // Create CSV header
      const csvHeader = "ID,Username,Email,Created At,Updated At\n";
      
      // Create CSV rows
      const csvRows = allUsers.map(user => {
        const createdAt = user.createdAt ? new Date(user.createdAt).toISOString() : '';
        const updatedAt = user.updatedAt ? new Date(user.updatedAt).toISOString() : '';
        return `"${user.id}","${user.username}","${user.email}","${createdAt}","${updatedAt}"`;
      }).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users-export.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).send("Failed to export users");
    }
  });

  // CSV Template Downloads
  app.get("/api/admin/csv-templates/categories", async (req, res) => {
    try {
      const csvHeader = "name,slug,description,parent_id,subdomain_id,is_active,sort_order\n";
      const sampleRow = '"Electronics","electronics","Electronic devices and gadgets","","example-subdomain-id","true","1"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=categories_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating categories template:", error);
      res.status(500).send("Failed to generate categories template");
    }
  });

  app.get("/api/admin/csv-templates/stores", async (req, res) => {
    try {
      const csvHeader = "name,slug,description,logo_url,website_url,subdomain_id,is_active,featured\n";
      const sampleRow = '"Amazon","amazon","Online marketplace and retailer","https://example.com/amazon-logo.png","https://amazon.com","example-subdomain-id","true","true"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=stores_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating stores template:", error);
      res.status(500).send("Failed to generate stores template");
    }
  });

  app.get("/api/admin/csv-templates/deals", async (req, res) => {
    try {
      const csvHeader = "title,description,original_price,sale_price,discount_percent,coupon_code,deal_url,image_url,rating,review_count,store_id,category_id,subdomain_id,is_active,is_featured,free_shipping,editor_insights,how_to_get_it,expires_at,author_name\n";
      const sampleRow = '"50% Off Gaming Laptop","High-performance gaming laptop with RTX graphics","1999.99","999.99","50","SAVE50","https://example.com/deal","https://example.com/laptop.jpg","4.5","150","store-uuid","category-uuid","example-subdomain-id","true","true","true","Great value for gaming enthusiasts","Add to cart and apply coupon","2024-12-31T23:59:59Z","John Doe"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=deals_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating deals template:", error);
      res.status(500).send("Failed to generate deals template");
    }
  });

  app.get("/api/admin/csv-templates/products", async (req, res) => {
    try {
      const csvHeader = "name,description,brand,model,sku,image_url,category_id,subdomain_id,is_active\n";
      const sampleRow = '"Gaming Laptop Pro","High-performance laptop for gaming and content creation","TechBrand","LP-2024-PRO","TBL2024PRO","https://example.com/product.jpg","category-uuid","example-subdomain-id","true"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=products_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating products template:", error);
      res.status(500).send("Failed to generate products template");
    }
  });

  app.get("/api/admin/csv-templates/video-channels", async (req, res) => {
    try {
      const csvHeader = "title,description,thumbnail_url,channel_url,video_count,follower_count,tags,subdomain_id,is_active\n";
      const sampleRow = '"Tech Reviews Channel","Latest tech product reviews and tutorials","https://example.com/channel-thumb.jpg","https://youtube.com/@techreviews","150","50000","[\"tech\",\"reviews\",\"gadgets\"]","example-subdomain-id","true"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=video_channels_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating video channels template:", error);
      res.status(500).send("Failed to generate video channels template");
    }
  });

  app.get("/api/admin/csv-templates/posts", async (req, res) => {
    try {
      const csvHeader = "title,content,author,subreddit,image_url,post_url,upvotes,comment_count,tags,subdomain_id,is_active\n";
      const sampleRow = '"Best Budget Smartphones 2024","Discussion about the best budget smartphones available this year","user123","deals","https://example.com/post-image.jpg","https://reddit.com/r/deals/123","250","45","[\"smartphones\",\"budget\",\"deals\"]","example-subdomain-id","true"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=posts_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating posts template:", error);
      res.status(500).send("Failed to generate posts template");
    }
  });

  app.get("/api/admin/csv-templates/blogs", async (req, res) => {
    try {
      const csvHeader = "title,description,excerpt,author,website,website_url,blog_url,image_url,publish_date,read_time,category,tags,subdomain_id,is_active\n";
      const sampleRow = '"How to Save Money on Electronics","Complete guide to finding the best deals on electronic devices","Learn proven strategies for saving money when buying electronics...","Jane Smith","TechSaver","https://techsaver.com","https://techsaver.com/save-money-electronics","https://example.com/blog-image.jpg","2024-01-15","5 min read","Electronics","[\"electronics\",\"saving\",\"deals\"]","example-subdomain-id","true"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=blogs_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating blogs template:", error);
      res.status(500).send("Failed to generate blogs template");
    }
  });

  app.get("/api/admin/csv-templates/business-categories", async (req, res) => {
    try {
      const csvHeader = "name,slug,description,icon_name,subdomain_id,is_active,sort_order\n";
      const sampleRow = '"Restaurants","restaurants","Food and dining establishments","utensils","example-subdomain-id","true","1"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=business_categories_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating business categories template:", error);
      res.status(500).send("Failed to generate business categories template");
    }
  });

  app.get("/api/admin/csv-templates/businesses", async (req, res) => {
    try {
      const csvHeader = "name,slug,description,address,city,state,zip_code,phone,email,website,image_url,business_category_id,subdomain_id,rating,review_count,price_range,is_active,is_featured,is_open_now,latitude,longitude\n";
      const sampleRow = '"Joe\'s Pizza","joes-pizza","Best pizza in town","123 Main St","Springfield","IL","62701","(555) 123-4567","info@joespizza.com","https://joespizza.com","https://example.com/pizza.jpg","category-uuid","example-subdomain-id","4.5","200","$$","true","true","true","39.7817","-89.6501"\n';
      const csvContent = csvHeader + sampleRow;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=businesses_template.csv');
      res.send(csvContent);
    } catch (error) {
      console.error("Error generating businesses template:", error);
      res.status(500).send("Failed to generate businesses template");
    }
  });

  // Configure multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
        cb(null, true);
      } else {
        cb(new Error('Only CSV files are allowed'));
      }
    }
  });

  // Helper function to determine table from filename
  const getTableFromFilename = (filename: string): string | null => {
    const baseName = filename.toLowerCase().replace('.csv', '');
    const supportedTables = [
      'categories', 'stores', 'deals', 'products', 'video-channels', 
      'posts', 'blogs', 'business-categories', 'businesses', 'users'
    ];
    
    for (const table of supportedTables) {
      if (baseName.startsWith(table)) {
        return table;
      }
    }
    return null;
  };

  // Helper function to process CSV data
  const processCsvData = async (csvData: string, tableName: string, subdomainId?: string): Promise<{ recordsProcessed: number, duplicatesSkipped: number }> => {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from([csvData]);
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          try {
            let recordsProcessed = 0;
            let duplicatesSkipped = 0;

            for (const row of results) {
              try {
                let isDuplicate = false;

                // Check for duplicates based on table type
                switch (tableName) {
                  case 'categories':
                    const existingCategory = await storage.getCategoryBySlug(row.slug);
                    if (existingCategory) {
                      isDuplicate = true;
                    } else {
                      await storage.createCategory({
                        name: row.name,
                        slug: row.slug,
                        description: row.description || null,
                        parentId: row.parent_id || null,
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true',
                        sortOrder: parseInt(row.sort_order) || 0
                      });
                    }
                    break;

                  case 'stores':
                    const existingStore = await storage.getStoreBySlug(row.slug);
                    if (existingStore) {
                      isDuplicate = true;
                    } else {
                      await storage.createStore({
                        name: row.name,
                        slug: row.slug,
                        description: row.description || null,
                        logoUrl: row.logo_url || null,
                        websiteUrl: row.website_url || null,
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true',
                        featured: row.featured === 'true'
                      });
                    }
                    break;

                  case 'deals':
                    // For deals, try to find similar deals to avoid duplicates
                    try {
                      await storage.createDeal({
                        title: row.title,
                        description: row.description || null,
                        originalPrice: row.original_price ? row.original_price : null,
                        salePrice: row.sale_price,
                        discountPercent: row.discount_percent ? parseInt(row.discount_percent) : null,
                        couponCode: row.coupon_code || null,
                        dealUrl: row.deal_url,
                        imageUrl: row.image_url || null,
                        rating: row.rating ? row.rating : null,
                        reviewCount: row.review_count ? parseInt(row.review_count) : 0,
                        storeId: row.store_id,
                        categoryId: row.category_id,
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true',
                        isFeatured: row.is_featured === 'true',
                        freeShipping: row.free_shipping === 'true',
                        editorInsights: row.editor_insights || null,
                        howToGetIt: row.how_to_get_it || null,
                        expiresAt: row.expires_at ? new Date(row.expires_at) : null,
                        authorName: row.author_name || null
                      });
                    } catch (error) {
                      // If creation fails due to duplicate constraint, skip
                      isDuplicate = true;
                    }
                    break;

                  case 'products':
                    // For products, try to create and catch duplicate errors
                    try {
                      await storage.createProduct({
                        name: row.name,
                        description: row.description || null,
                        brand: row.brand || null,
                        model: row.model || null,
                        sku: row.sku || null,
                        imageUrl: row.image_url || null,
                        categoryId: row.category_id,
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true'
                      });
                    } catch (error) {
                      // If creation fails due to duplicate constraint, skip
                      isDuplicate = true;
                    }
                    break;

                  case 'video-channels':
                    try {
                      await storage.createVideoChannel({
                        title: row.title,
                        description: row.description || null,
                        thumbnailUrl: row.thumbnail_url,
                        channelUrl: row.channel_url,
                        videoCount: row.video_count ? parseInt(row.video_count) : 0,
                        followerCount: row.follower_count ? parseInt(row.follower_count) : 0,
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true'
                      });
                    } catch (error) {
                      isDuplicate = true;
                    }
                    break;

                  case 'posts':
                    try {
                      await storage.createPost({
                        title: row.title,
                        content: row.content,
                        author: row.author,
                        subreddit: row.subreddit || null,
                        imageUrl: row.image_url || null,
                        postUrl: row.post_url,
                        upvotes: row.upvotes ? parseInt(row.upvotes) : 0,
                        commentCount: row.comment_count ? parseInt(row.comment_count) : 0,
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true'
                      });
                    } catch (error) {
                      isDuplicate = true;
                    }
                    break;

                  case 'blogs':
                    try {
                      await storage.createBlog({
                        title: row.title,
                        description: row.description || null,
                        excerpt: row.excerpt || null,
                        author: row.author,
                        website: row.website || null,
                        websiteUrl: row.website_url || null,
                        blogUrl: row.blog_url,
                        imageUrl: row.image_url || null,
                        publishDate: row.publish_date || null,
                        readTime: row.read_time || null,
                        category: row.category || null,
                        tags: row.tags ? JSON.parse(row.tags) : [],
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true'
                      });
                    } catch (error) {
                      isDuplicate = true;
                    }
                    break;

                  case 'business-categories':
                    try {
                      await storage.createBusinessCategory({
                        name: row.name,
                        slug: row.slug,
                        description: row.description || null,
                        iconName: row.icon_name || null,
                        subdomainId: row.subdomain_id || subdomainId,
                        isActive: row.is_active === 'true',
                        sortOrder: row.sort_order ? parseInt(row.sort_order) : 0
                      });
                    } catch (error) {
                      isDuplicate = true;
                    }
                    break;

                  case 'businesses':
                    try {
                      await storage.createBusiness({
                        name: row.name,
                        slug: row.slug,
                        description: row.description || null,
                        address: row.address || null,
                        city: row.city || null,
                        state: row.state || null,
                        zipCode: row.zip_code || null,
                        phone: row.phone || null,
                        email: row.email || null,
                        website: row.website || null,
                        imageUrl: row.image_url || null,
                        businessCategoryId: row.business_category_id,
                        subdomainId: row.subdomain_id || subdomainId,
                        rating: row.rating ? parseFloat(row.rating) : null,
                        reviewCount: row.review_count ? parseInt(row.review_count) : 0,
                        priceRange: row.price_range || null,
                        isActive: row.is_active === 'true',
                        isFeatured: row.is_featured === 'true',
                        isOpenNow: row.is_open_now === 'true',
                        latitude: row.latitude ? parseFloat(row.latitude) : null,
                        longitude: row.longitude ? parseFloat(row.longitude) : null
                      });
                    } catch (error) {
                      isDuplicate = true;
                    }
                    break;

                  case 'users':
                    const existingUser = await storage.getUserByUsername(row.username);
                    if (existingUser) {
                      isDuplicate = true;
                    } else {
                      await storage.createUser({
                        username: row.username,
                        email: row.email,
                        password: row.password // In production, hash the password
                      });
                    }
                    break;

                  default:
                    throw new Error(`Unsupported table: ${tableName}`);
                }

                if (isDuplicate) {
                  duplicatesSkipped++;
                } else {
                  recordsProcessed++;
                }
              } catch (rowError) {
                console.error(`Error processing row:`, rowError);
                // Continue processing other rows
              }
            }

            resolve({ recordsProcessed, duplicatesSkipped });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  };

  // CSV Upload endpoint
  app.post("/api/admin/upload-csv", upload.single('csv'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: "No CSV file uploaded" 
        });
      }

      const filename = req.file.originalname;
      const tableName = getTableFromFilename(filename);
      const subdomainId = req.body.subdomainId;

      if (!tableName) {
        return res.status(400).json({
          success: false,
          message: `Unsupported filename: ${filename}. File must start with a supported table name (categories, stores, deals, products, etc.)`
        });
      }

      if (!subdomainId) {
        return res.status(400).json({
          success: false,
          message: "subdomainId is required for data import"
        });
      }

      const csvData = req.file.buffer.toString('utf-8');
      const result = await processCsvData(csvData, tableName, subdomainId);

      res.json({
        success: true,
        message: `Successfully processed ${filename}`,
        table: tableName,
        recordsProcessed: result.recordsProcessed,
        duplicatesSkipped: result.duplicatesSkipped
      });
    } catch (error) {
      console.error("Error processing CSV upload:", error);
      res.status(500).json({
        success: false,
        message: `Failed to process CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Cron-accessible endpoint for remote file processing
  app.post("/api/admin/process-remote-csv", async (req, res) => {
    try {
      const { filename, fileUrl } = req.body;

      if (!filename || !fileUrl) {
        return res.status(400).json({
          success: false,
          message: "filename and fileUrl are required"
        });
      }

      const tableName = getTableFromFilename(filename);
      if (!tableName) {
        return res.status(400).json({
          success: false,
          message: `Unsupported filename: ${filename}. File must start with a supported table name`
        });
      }

      // Fetch the CSV file from the remote URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const csvData = await response.text();
      const result = await processCsvData(csvData, tableName);

      res.json({
        success: true,
        message: `Successfully processed remote file ${filename}`,
        table: tableName,
        recordsProcessed: result.recordsProcessed,
        duplicatesSkipped: result.duplicatesSkipped
      });
    } catch (error) {
      console.error("Error processing remote CSV:", error);
      res.status(500).json({
        success: false,
        message: `Failed to process remote CSV: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // DataEntry API endpoints for table management
  app.get("/api/admin/table-data/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 10;
      const offset = (page - 1) * pageSize;

      // Map frontend table names to actual database table names
      const tableMap: Record<string, any> = {
        'categories': categories,
        'stores': stores, 
        'deals': deals,
        'products': products,
        'video_channels': videoChannels,
        'posts': posts,
        'youtube_videos': youtubeVideos,
        'blogs': blogs,
        'advertisement_banners': advertisementBanners,
        'banner_settings': bannerSettings,
        'page_views': pageViews,
        'click_thru': clickThru,
        'subdomains': subdomains,
        'business_categories': businessCategories,
        'businesses': businesses,
        'business_hours': businessHours,
        'business_reviews': businessReviews,
        'business_photos': businessPhotos,
        'users': users,
        'newsletter_subscribers': newsletterSubscribers,
        'newsletter_popup_settings': newsletterPopupSettings,
        'user_favorites': userFavorites,
        'site_settings': siteSettings
      };

      const table = tableMap[tableName];
      if (!table) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      // Get total count
      const totalCountResult = await db.select({ count: sql<number>`count(*)` }).from(table);
      const total = totalCountResult[0]?.count || 0;

      // Get paginated data
      const data = await db.select().from(table).limit(pageSize).offset(offset);

      res.json({
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      });
    } catch (error) {
      console.error("Error fetching table data:", error);
      res.status(500).json({ error: "Failed to fetch table data" });
    }
  });

  app.get("/api/admin/table-schema/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      
      // Define field types for each table to help with form generation
      const schemaMap: Record<string, Record<string, any>> = {
        'categories': {
          name: { type: 'text', required: true },
          slug: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          parentId: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false },
          sortOrder: { type: 'number', required: false }
        },
        'stores': {
          name: { type: 'text', required: true },
          slug: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          logoUrl: { type: 'text', required: false },
          websiteUrl: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false },
          featured: { type: 'boolean', required: false }
        },
        'deals': {
          title: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          originalPrice: { type: 'number', required: false },
          salePrice: { type: 'number', required: true },
          discountPercent: { type: 'number', required: false },
          couponCode: { type: 'text', required: false },
          dealUrl: { type: 'text', required: true },
          imageUrl: { type: 'text', required: false },
          rating: { type: 'number', required: false },
          reviewCount: { type: 'number', required: false },
          storeId: { type: 'text', required: true },
          categoryId: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false },
          isFeatured: { type: 'boolean', required: false },
          freeShipping: { type: 'boolean', required: false },
          editorInsights: { type: 'textarea', required: false },
          howToGetIt: { type: 'textarea', required: false },
          expiresAt: { type: 'datetime-local', required: false },
          authorName: { type: 'text', required: false }
        },
        'products': {
          name: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          brand: { type: 'text', required: false },
          model: { type: 'text', required: false },
          sku: { type: 'text', required: false },
          imageUrl: { type: 'text', required: false },
          categoryId: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'video_channels': {
          title: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          thumbnailUrl: { type: 'text', required: true },
          channelUrl: { type: 'text', required: true },
          videoCount: { type: 'number', required: false },
          followerCount: { type: 'number', required: false },
          tags: { type: 'textarea', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'posts': {
          title: { type: 'text', required: true },
          content: { type: 'textarea', required: true },
          author: { type: 'text', required: true },
          subreddit: { type: 'text', required: false },
          imageUrl: { type: 'text', required: false },
          postUrl: { type: 'text', required: true },
          upvotes: { type: 'number', required: false },
          commentCount: { type: 'number', required: false },
          tags: { type: 'textarea', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'youtube_videos': {
          title: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          channelName: { type: 'text', required: true },
          channelUrl: { type: 'text', required: true },
          videoUrl: { type: 'text', required: true },
          thumbnailUrl: { type: 'text', required: true },
          duration: { type: 'text', required: false },
          viewCount: { type: 'number', required: false },
          uploadDate: { type: 'text', required: false },
          tags: { type: 'textarea', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'blogs': {
          title: { type: 'text', required: true },
          description: { type: 'textarea', required: true },
          excerpt: { type: 'textarea', required: true },
          author: { type: 'text', required: true },
          website: { type: 'text', required: true },
          websiteUrl: { type: 'text', required: true },
          blogUrl: { type: 'text', required: true },
          imageUrl: { type: 'text', required: true },
          publishDate: { type: 'text', required: true },
          readTime: { type: 'text', required: true },
          category: { type: 'text', required: true },
          tags: { type: 'textarea', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'advertisement_banners': {
          content: { type: 'textarea', required: true },
          backgroundColor: { type: 'text', required: false },
          textColor: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false },
          impressionLimit: { type: 'number', required: false },
          currentImpressions: { type: 'number', required: false }
        },
        'banner_settings': {
          pageUrl: { type: 'text', required: true },
          showBanner: { type: 'boolean', required: false },
          isVisible: { type: 'boolean', required: false }
        },
        'users': {
          username: { type: 'text', required: true },
          email: { type: 'text', required: true },
          password: { type: 'text', required: true },
          isActive: { type: 'boolean', required: false }
        },
        'newsletter_subscribers': {
          email: { type: 'text', required: true },
          signupMethod: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'businesses': {
          name: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          address: { type: 'text', required: false },
          phone: { type: 'text', required: false },
          website: { type: 'text', required: false },
          email: { type: 'text', required: false },
          categoryId: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'business_categories': {
          name: { type: 'text', required: true },
          slug: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          iconName: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false },
          isActive: { type: 'boolean', required: false },
          sortOrder: { type: 'number', required: false }
        },
        'business_hours': {
          businessId: { type: 'text', required: true },
          dayOfWeek: { type: 'number', required: true },
          openTime: { type: 'time', required: false },
          closeTime: { type: 'time', required: false },
          subdomainId: { type: 'text', required: false },
          isClosed: { type: 'boolean', required: false }
        },
        'business_reviews': {
          businessId: { type: 'text', required: true },
          rating: { type: 'number', required: true },
          reviewText: { type: 'textarea', required: false },
          reviewerName: { type: 'text', required: true },
          reviewerEmail: { type: 'text', required: false },
          subdomainId: { type: 'text', required: false }
        },
        'business_photos': {
          businessId: { type: 'text', required: true },
          imageUrl: { type: 'text', required: true },
          caption: { type: 'text', required: false },
          isPrimary: { type: 'boolean', required: false },
          subdomainId: { type: 'text', required: false }
        },
        'click_thru': {
          pageName: { type: 'text', required: true },
          pageUrl: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false },
          advertisementId: { type: 'text', required: true },
          advertisementTitle: { type: 'text', required: true },
          advertisementClickUrl: { type: 'text', required: true },
          bannerPosition: { type: 'text', required: true },
          ipAddress: { type: 'text', required: true },
          userAgent: { type: 'text', required: false }
        },
        'newsletter_popup_settings': {
          isEnabled: { type: 'boolean', required: false },
          popupType: { type: 'select', required: true, options: [
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' }
          ]},
          showDelay: { type: 'number', required: false },
          showOnPages: { type: 'textarea', required: false, help: 'JSON array of page URLs' },
          frequency: { type: 'select', required: false, options: [
            { value: 'once_per_session', label: 'Once Per Session' },
            { value: 'daily', label: 'Daily' },
            { value: 'always', label: 'Always' }
          ]}
        },
        'page_views': {
          pageName: { type: 'text', required: true },
          pageUrl: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false },
          ipAddress: { type: 'text', required: true },
          userAgent: { type: 'text', required: false }
        },
        'site_settings': {
          siteName: { type: 'text', required: true },
          siteDescription: { type: 'textarea', required: false },
          logoUrl: { type: 'text', required: false },
          faviconUrl: { type: 'text', required: false },
          primaryColor: { type: 'color', required: false },
          secondaryColor: { type: 'color', required: false }
        },
        'subdomains': {
          subdomain: { type: 'text', required: true },
          displayName: { type: 'text', required: true },
          description: { type: 'textarea', required: false },
          isActive: { type: 'boolean', required: false }
        },
        'user_favorites': {
          userId: { type: 'text', required: true },
          dealId: { type: 'text', required: true },
          pageUrl: { type: 'text', required: true },
          subdomainId: { type: 'text', required: false }
        }
      };

      const schema = schemaMap[tableName];
      if (!schema) {
        return res.status(400).json({ error: "Schema not found for table" });
      }

      res.json(schema);
    } catch (error) {
      console.error("Error fetching table schema:", error);
      res.status(500).json({ error: "Failed to fetch table schema" });
    }
  });

  app.post("/api/admin/table-data/:tableName", async (req, res) => {
    try {
      const { tableName } = req.params;
      const data = req.body;

      // Use the existing storage methods where available
      switch (tableName) {
        case 'categories':
          const category = await storage.createCategory(data);
          res.json(category);
          break;
        case 'stores':
          const store = await storage.createStore(data);
          res.json(store);
          break;
        case 'deals':
          const deal = await storage.createDeal(data);
          res.json(deal);
          break;
        case 'products':
          const product = await storage.createProduct(data);
          res.json(product);
          break;
        default:
          // Generic table insert for all other tables
          const tableMap: Record<string, any> = {
            'video_channels': videoChannels,
            'posts': posts,
            'youtube_videos': youtubeVideos,
            'blogs': blogs,
            'advertisement_banners': advertisementBanners,
            'banner_settings': bannerSettings,
            'page_views': pageViews,
            'click_thru': clickThru,
            'subdomains': subdomains,
            'business_categories': businessCategories,
            'businesses': businesses,
            'business_hours': businessHours,
            'business_reviews': businessReviews,
            'business_photos': businessPhotos,
            'users': users,
            'newsletter_subscribers': newsletterSubscribers,
            'newsletter_popup_settings': newsletterPopupSettings,
            'user_favorites': userFavorites,
            'site_settings': siteSettings
          };

          const table = tableMap[tableName];
          if (!table) {
            return res.status(400).json({ error: "Invalid table name" });
          }

          // Remove timestamp fields that shouldn't be set manually
          delete data.createdAt;
          delete data.updatedAt;

          const result = await db.insert(table)
            .values(data)
            .returning();

          const newRecord = Array.isArray(result) ? result[0] : result;
          res.json(newRecord);
          break;
      }
    } catch (error) {
      console.error("Error creating record:", error);
      res.status(500).json({ error: "Failed to create record" });
    }
  });

  app.put("/api/admin/table-data/:tableName/:id", async (req, res) => {
    try {
      const { tableName, id } = req.params;
      const data = req.body;

      const tableMap: Record<string, any> = {
        'categories': categories,
        'stores': stores,
        'deals': deals,
        'products': products,
        'video_channels': videoChannels,
        'posts': posts,
        'youtube_videos': youtubeVideos,
        'blogs': blogs,
        'advertisement_banners': advertisementBanners,
        'banner_settings': bannerSettings,
        'page_views': pageViews,
        'click_thru': clickThru,
        'subdomains': subdomains,
        'business_categories': businessCategories,
        'businesses': businesses,
        'business_hours': businessHours,
        'business_reviews': businessReviews,
        'business_photos': businessPhotos,
        'users': users,
        'newsletter_subscribers': newsletterSubscribers,
        'newsletter_popup_settings': newsletterPopupSettings,
        'user_favorites': userFavorites,
        'site_settings': siteSettings
      };

      const table = tableMap[tableName];
      if (!table) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      // Remove timestamp fields that shouldn't be updated manually
      delete data.createdAt;
      delete data.updatedAt;
      delete data.id;

      const [updatedRecord] = await db.update(table)
        .set(data)
        .where(eq(table.id, id))
        .returning();

      res.json(updatedRecord);
    } catch (error) {
      console.error("Error updating record:", error);
      res.status(500).json({ error: "Failed to update record" });
    }
  });

  app.delete("/api/admin/table-data/:tableName/:id", async (req, res) => {
    try {
      const { tableName, id } = req.params;

      const tableMap: Record<string, any> = {
        'categories': categories,
        'stores': stores,
        'deals': deals,
        'products': products,
        'video_channels': videoChannels,
        'posts': posts,
        'youtube_videos': youtubeVideos,
        'blogs': blogs,
        'advertisement_banners': advertisementBanners,
        'banner_settings': bannerSettings,
        'page_views': pageViews,
        'click_thru': clickThru,
        'subdomains': subdomains,
        'business_categories': businessCategories,
        'businesses': businesses,
        'business_hours': businessHours,
        'business_reviews': businessReviews,
        'business_photos': businessPhotos,
        'users': users,
        'newsletter_subscribers': newsletterSubscribers,
        'newsletter_popup_settings': newsletterPopupSettings,
        'user_favorites': userFavorites,
        'site_settings': siteSettings
      };

      const table = tableMap[tableName];
      if (!table) {
        return res.status(400).json({ error: "Invalid table name" });
      }

      await db.delete(table).where(eq(table.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).json({ error: "Failed to delete record" });
    }
  });

  // Newsletter subscription routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const { email, signupMethod = 'email' } = req.body;
      
      if (!email) {
        return res.status(400).send("Email is required");
      }

      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(200).json({ message: "Already subscribed", subscriber: existingSubscriber });
      }

      // Create new subscriber
      const subscriber = await storage.createNewsletterSubscriber({
        email,
        signupMethod,
        isActive: true
      });

      res.status(201).json({ message: "Successfully subscribed", subscriber });
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      res.status(500).send("Subscription failed");
    }
  });

  // Newsletter popup settings routes
  app.get("/api/newsletter/popup-settings", async (req, res) => {
    try {
      const settings = await storage.getNewsletterPopupSettings();
      res.json(settings || {
        isEnabled: false,
        popupType: "dark",
        showDelay: 5000,
        showOnPages: [],
        frequency: "once_per_session"
      });
    } catch (error) {
      console.error("Error fetching newsletter popup settings:", error);
      res.status(500).send("Failed to fetch popup settings");
    }
  });

  app.post("/api/newsletter/popup-settings", async (req, res) => {
    try {
      const settings = await storage.updateNewsletterPopupSettings(req.body);
      res.json(settings);
    } catch (error) {
      console.error("Error updating newsletter popup settings:", error);
      res.status(500).send("Failed to update popup settings");
    }
  });

  // Get all newsletter subscribers for admin
  app.get("/api/admin/newsletter/subscribers", async (req, res) => {
    try {
      const subscribers = await storage.getAllNewsletterSubscribers();
      res.json(subscribers);
    } catch (error) {
      console.error("Error fetching newsletter subscribers:", error);
      res.status(500).send("Failed to fetch subscribers");
    }
  });

  app.post('/api/admin/verify', async (req, res) => {
    const { token } = req.body;
    
    // Simple token validation - in production this would validate against a secure session store
    if (token && token.startsWith('admin_token_')) {
      res.json({
        success: true,
        valid: true
      });
    } else {
      res.status(401).json({
        success: false,
        valid: false,
        message: 'Invalid token'
      });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const subdomainString = getSubdomainFromRequest(req);
      
      // If subdomain is specified in query, always filter by subdomain
      let categoriesData;
      if (subdomainString) {
        const subdomainId = await getSubdomainId(subdomainString);
        if (subdomainId) {
          // Subdomain exists, filter by it
          categoriesData = await db.select().from(categories).where(eq(categories.subdomainId, subdomainId));
        } else {
          // Subdomain specified but doesn't exist, return empty results
          categoriesData = [];
        }
      } else {
        // No subdomain specified, use main site data
        categoriesData = await storage.getCategoriesWithChildren();
      }
      
      res.json(categoriesData);
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
      const subdomainString = getSubdomainFromRequest(req);
      
      // If subdomain is specified in query, always filter by subdomain
      let storesData;
      if (subdomainString) {
        const subdomainId = await getSubdomainId(subdomainString);
        if (subdomainId) {
          // Subdomain exists, filter by it
          storesData = await db.select().from(stores).where(eq(stores.subdomainId, subdomainId));
        } else {
          // Subdomain specified but doesn't exist, return empty results
          storesData = [];
        }
      } else {
        // No subdomain specified, use main site data
        storesData = await storage.getStores();
      }
      
      res.json(storesData);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.get("/api/stores/featured", async (req, res) => {
    try {
      // const subdomainString = getSubdomainFromRequest(req);
      // const subdomainId = await getSubdomainId(subdomainString);
      
      // If subdomain is specified, filter by it; otherwise get all featured stores
      let featuredStores;
      if (req.subdomain) {
        featuredStores = await db.select().from(stores)
          .where(sql`${stores.subdomainId} = ${req.subdomain} AND ${stores.isFeatured} = true`);
      } else {
        featuredStores = await storage.getFeaturedStores();
      }
      
      res.json(featuredStores.map(c => ({ ...c, subdomain: req.subdomain })));
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
      const subdomainString = getSubdomainFromRequest(req);
      
      // If subdomain is specified in query, always filter by subdomain
      let dealsData;
      if (subdomainString) {
        const subdomainId = await getSubdomainId(subdomainString);
        if (subdomainId) {
          // Subdomain exists, filter by it
          dealsData = await db.select().from(deals).where(eq(deals.subdomainId, subdomainId)).limit(limit);
        } else {
          // Subdomain specified but doesn't exist, return empty results
          dealsData = [];
        }
      } else {
        // No subdomain specified, use main site data
        dealsData = await storage.getDeals(limit);
      }
      
      res.json(dealsData);
    } catch (error) {
      console.error("Error fetching deals:", error);
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/featured", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      // If subdomain is specified, filter by it; otherwise get all featured deals
      let featuredDeals;
      if (subdomainId) {
        featuredDeals = await db.select().from(deals)
          .where(sql`${deals.subdomainId} = ${subdomainId} AND ${deals.isFeatured} = true`)
          .limit(limit);
      } else {
        featuredDeals = await storage.getFeaturedDeals(limit);
      }
      
      res.json(featuredDeals);
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

  // User favorites endpoints
  app.get("/api/favorites/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const pageUrl = req.query.pageUrl as string;
      const favorites = await storage.getUserFavorites(userId, pageUrl);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching user favorites:", error);
      res.status(500).json({ error: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites", async (req, res) => {
    try {
      const { userId, dealId, pageUrl } = req.body;
      if (!userId || !dealId || !pageUrl) {
        return res.status(400).json({ error: "userId, dealId, and pageUrl are required" });
      }
      
      await storage.addUserFavorite(userId, dealId, pageUrl);
      res.json({ success: true });
    } catch (error) {
      console.error("Error adding favorite:", error);
      res.status(500).json({ error: "Failed to add favorite" });
    }
  });

  app.delete("/api/favorites", async (req, res) => {
    try {
      const { userId, dealId, pageUrl } = req.body;
      if (!userId || !dealId || !pageUrl) {
        return res.status(400).json({ error: "userId, dealId, and pageUrl are required" });
      }
      
      await storage.removeUserFavorite(userId, dealId, pageUrl);
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ error: "Failed to remove favorite" });
    }
  });

  app.get("/api/favorites/:userId/:dealId", async (req, res) => {
    try {
      const { userId, dealId } = req.params;
      const pageUrl = req.query.pageUrl as string;
      if (!pageUrl) {
        return res.status(400).json({ error: "pageUrl query parameter is required" });
      }
      const isFavorite = await storage.isUserFavorite(userId, dealId, pageUrl);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ error: "Failed to check favorite status" });
    }
  });

  // Video Channels
  app.get("/api/video-channels", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let channelsData;
      if (subdomainId) {
        channelsData = await db.select().from(videoChannels)
          .where(eq(videoChannels.subdomainId, subdomainId))
          .limit(limit);
      } else {
        channelsData = await storage.getVideoChannels(limit);
      }
      
      res.json(channelsData);
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
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let postsData;
      if (subdomainId) {
        // Filter by subdomain using direct database query
        if (query) {
          postsData = await db.select().from(posts)
            .where(sql`${posts.subdomainId} = ${subdomainId} AND (${posts.title} ILIKE ${'%' + query + '%'} OR ${posts.content} ILIKE ${'%' + query + '%'})`)
            .limit(limit);
        } else {
          postsData = await db.select().from(posts)
            .where(eq(posts.subdomainId, subdomainId))
            .limit(limit);
        }
      } else {
        // Use storage methods for main site
        if (query) {
          postsData = await storage.searchPosts(query, limit);
        } else {
          postsData = await storage.getPosts(limit);
        }
      }
      
      res.json(postsData);
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
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let videosData;
      if (subdomainId) {
        // Filter by subdomain using direct database query
        if (search) {
          videosData = await db.select().from(youtubeVideos)
            .where(sql`${youtubeVideos.subdomainId} = ${subdomainId} AND (${youtubeVideos.title} ILIKE ${'%' + search + '%'} OR ${youtubeVideos.description} ILIKE ${'%' + search + '%'})`)
            .limit(limit);
        } else {
          videosData = await db.select().from(youtubeVideos)
            .where(eq(youtubeVideos.subdomainId, subdomainId))
            .limit(limit);
        }
      } else {
        // Use storage methods for main site
        if (search) {
          videosData = await storage.searchYoutubeVideos(search, limit);
        } else {
          videosData = await storage.getYoutubeVideos(limit);
        }
      }
      
      res.json(videosData);
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
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let blogsData;
      if (subdomainId) {
        // Filter by subdomain using direct database query
        if (search) {
          blogsData = await db.select().from(blogs)
            .where(sql`${blogs.subdomainId} = ${subdomainId} AND (${blogs.title} ILIKE ${'%' + search + '%'} OR ${blogs.description} ILIKE ${'%' + search + '%'})`)
            .limit(limit);
        } else {
          blogsData = await db.select().from(blogs)
            .where(eq(blogs.subdomainId, subdomainId))
            .limit(limit);
        }
      } else {
        // Use storage methods for main site
        if (search) {
          blogsData = await storage.searchBlogs(search, limit);
        } else {
          blogsData = await storage.getBlogs(limit);
        }
      }
      
      res.json(blogsData);
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

  // Advertisement Banners API
  app.get("/api/advertisement-banners", async (req, res) => {
    try {
      const position = req.query.position as string;
      const pageUrl = req.query.pageUrl as string;
      const banners = await storage.getAdvertisementBanners(position, pageUrl);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching advertisement banners:", error);
      res.status(500).json({ error: "Failed to fetch advertisement banners" });
    }
  });

  app.get("/api/advertisement-banners/:id", async (req, res) => {
    try {
      const banner = await storage.getAdvertisementBannerById(req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Advertisement banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error fetching advertisement banner:", error);
      res.status(500).json({ error: "Failed to fetch advertisement banner" });
    }
  });

  app.put("/api/advertisement-banners/:id", async (req, res) => {
    try {
      const bannerData = req.body;
      const banner = await storage.updateAdvertisementBanner(req.params.id, bannerData);
      if (!banner) {
        return res.status(404).json({ error: "Advertisement banner not found" });
      }
      res.json(banner);
    } catch (error) {
      console.error("Error updating advertisement banner:", error);
      res.status(500).json({ error: "Failed to update advertisement banner" });
    }
  });

  app.get("/api/advertisement-banners/page/:pageUrl(*)", async (req, res) => {
    try {
      const pageUrl = `/${req.params.pageUrl}`;
      const banners = await storage.getAdvertisementBannersByPage(pageUrl);
      res.json(banners);
    } catch (error) {
      console.error("Error fetching advertisement banners by page:", error);
      res.status(500).json({ error: "Failed to fetch advertisement banners by page" });
    }
  });

  // Banner Settings API
  app.get("/api/banner-settings", async (req, res) => {
    try {
      const pageUrl = req.query.pageUrl as string;
      const settings = await storage.getBannerSettings(pageUrl);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching banner settings:", error);
      res.status(500).json({ error: "Failed to fetch banner settings" });
    }
  });

  app.get("/api/banner-settings/:pageUrl(*)", async (req, res) => {
    try {
      const pageUrl = `/${req.params.pageUrl}`;
      const settings = await storage.getBannerSettingByPage(pageUrl);
      if (!settings) {
        // Return default settings if none exist
        res.json({
          pageUrl,
          showHeader: true,
          showTop: true,
          showLeft: true,
          showRight: true,
          showBottom: true
        });
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching banner settings:", error);
      res.status(500).json({ error: "Failed to fetch banner settings" });
    }
  });

  app.post("/api/banner-settings", async (req, res) => {
    try {
      const settingsData = req.body;
      const settings = await storage.upsertBannerSettings(settingsData.pageUrl, settingsData);
      res.status(201).json(settings);
    } catch (error) {
      console.error("Error creating/updating banner settings:", error);
      res.status(500).json({ error: "Failed to save banner settings" });
    }
  });

  // Delete banner settings and associated banners for a page
  app.delete("/api/banner-settings", async (req, res) => {
    try {
      const { pageUrl } = req.body;
      if (!pageUrl) {
        return res.status(400).json({ error: "Page URL is required" });
      }
      await storage.deleteBannerSettings(pageUrl);
      res.status(200).json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting banner settings:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Update page name and description in banner settings
  app.patch("/api/banner-settings/rename", async (req, res) => {
    try {
      const { pageUrl, newPageName, newDescription } = req.body;
      if (!pageUrl || !newPageName) {
        return res.status(400).json({ error: "Page URL and new page name are required" });
      }
      
      const updateData: any = { pageName: newPageName };
      if (newDescription !== undefined) {
        updateData.description = newDescription;
      }
      
      const updatedSettings = await storage.updateBannerSettings(pageUrl, updateData);
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Error renaming page:", error);
      res.status(500).json({ error: "Failed to rename page" });
    }
  });

  // Reorder pages in banner settings
  app.patch("/api/banner-settings/reorder", async (req, res) => {
    try {
      const { pageUrls } = req.body;
      if (!pageUrls || !Array.isArray(pageUrls)) {
        return res.status(400).json({ error: "Page URLs array is required" });
      }
      
      await storage.reorderPages(pageUrls);
      res.status(200).json({ message: "Pages reordered successfully" });
    } catch (error) {
      console.error("Error reordering pages:", error);
      res.status(500).json({ error: "Failed to reorder pages" });
    }
  });

  // Get site settings
  app.get("/api/site-settings", async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.status(200).json(settings);
    } catch (error) {
      console.error("Error fetching site settings:", error);
      res.status(500).json({ error: "Failed to fetch site settings" });
    }
  });

  // Update site settings
  app.patch("/api/site-settings", async (req, res) => {
    try {
      const updates = req.body;
      const updatedSettings = await storage.updateSiteSettings(updates);
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Error updating site settings:", error);
      res.status(500).json({ error: "Failed to update site settings" });
    }
  });

  // Get visible pages for navigation
  app.get("/api/visible-pages", async (req, res) => {
    try {
      const visiblePages = await storage.getVisiblePages();
      res.json(visiblePages);
    } catch (error) {
      console.error("Error fetching visible pages:", error);
      res.status(500).json({ error: "Failed to fetch visible pages" });
    }
  });

  // SEO Routes - Sitemap and Robots.txt
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const sitemap = await generateSitemap();
      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const robotsTxt = await generateRobotsTxt();
      res.set('Content-Type', 'text/plain');
      res.send(robotsTxt);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Directory Business Categories API
  app.get("/api/business-categories", async (req, res) => {
    try {
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let categoriesData;
      if (subdomainId) {
        categoriesData = await db.select().from(businessCategories)
          .where(eq(businessCategories.subdomainId, subdomainId));
      } else {
        categoriesData = await storage.getBusinessCategories();
      }
      
      res.json(categoriesData);
    } catch (error) {
      console.error("Error fetching business categories:", error);
      res.status(500).json({ error: "Failed to fetch business categories" });
    }
  });

  app.get("/api/business-categories/:slug", async (req, res) => {
    try {
      const category = await storage.getBusinessCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ error: "Business category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching business category:", error);
      res.status(500).json({ error: "Failed to fetch business category" });
    }
  });

  // Directory Businesses API
  app.get("/api/businesses", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const search = req.query.search as string;
      const location = req.query.location as string;
      const category = req.query.category as string;
      const featured = req.query.featured === "true";
      const subdomainString = getSubdomainFromRequest(req);
      const subdomainId = await getSubdomainId(subdomainString);
      
      let businessesData;
      if (subdomainId) {
        // Filter by subdomain using direct database query
        if (search) {
          businessesData = await db.select().from(businesses)
            .where(sql`${businesses.subdomainId} = ${subdomainId} AND (${businesses.name} ILIKE ${'%' + search + '%'} OR ${businesses.description} ILIKE ${'%' + search + '%'})`)
            .limit(limit);
        } else if (featured) {
          businessesData = await db.select().from(businesses)
            .where(sql`${businesses.subdomainId} = ${subdomainId} AND ${businesses.isActive} = true`)
            .limit(limit);
        } else {
          businessesData = await db.select().from(businesses)
            .where(eq(businesses.subdomainId, subdomainId))
            .limit(limit);
        }
      } else {
        // Use storage methods for main site
        if (search) {
          businessesData = await storage.searchBusinesses(search, location, limit);
        } else if (category) {
          businessesData = await storage.getBusinessesByCategory(category, limit);
        } else if (featured) {
          businessesData = await storage.getFeaturedBusinesses(limit);
        } else {
          businessesData = await storage.getBusinesses(limit);
        }
      }
      
      res.json(businessesData);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  app.get("/api/businesses/:id", async (req, res) => {
    try {
      const business = await storage.getBusinessById(req.params.id);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json(business);
    } catch (error) {
      console.error("Error fetching business:", error);
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  // Business Hours API
  app.get("/api/businesses/:id/hours", async (req, res) => {
    try {
      const hours = await storage.getBusinessHours(req.params.id);
      res.json(hours);
    } catch (error) {
      console.error("Error fetching business hours:", error);
      res.status(500).json({ error: "Failed to fetch business hours" });
    }
  });

  // Business Reviews API
  app.get("/api/businesses/:id/reviews", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const reviews = await storage.getBusinessReviews(req.params.id, limit);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching business reviews:", error);
      res.status(500).json({ error: "Failed to fetch business reviews" });
    }
  });

  // Business Photos API
  app.get("/api/businesses/:id/photos", async (req, res) => {
    try {
      const photos = await storage.getBusinessPhotos(req.params.id);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching business photos:", error);
      res.status(500).json({ error: "Failed to fetch business photos" });
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
      res.status(500).json({ error: "Failed to seed posts", details: error instanceof Error ? error.message : String(error) });
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
      res.status(500).json({ error: "Failed to seed YouTube videos", details: error instanceof Error ? error.message : String(error) });
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
      res.status(500).json({ error: "Failed to seed blogs", details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Seed advertisement banners endpoint
  app.post("/api/seed-advertisement-banners", async (req, res) => {
    try {
      console.log("Starting to seed advertisement banners...");
      await seedAdvertisementBanners();
      console.log("Advertisement banners seeded successfully!");
      res.json({ message: "Advertisement banners seeded successfully" });
    } catch (error) {
      console.error("Error seeding advertisement banners:", error);
      res.status(500).json({ error: "Failed to seed advertisement banners", details: error instanceof Error ? error.message : String(error) });
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

  // Seed directory businesses endpoint
  app.post("/api/seed-businesses", async (req, res) => {
    try {
      console.log("Starting to seed directory businesses...");
      await seedDirectoryBusinesses();
      console.log("Directory businesses seeded successfully!");
      res.json({ message: "Directory businesses seeded successfully" });
    } catch (error) {
      console.error("Error seeding directory businesses:", error);
      res.status(500).json({ error: "Failed to seed directory businesses", details: error instanceof Error ? error.message : String(error) });
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

  // Seed advertisement banners endpoint
  app.post('/api/seed-advertisement-banners', async (req, res) => {
    try {
      // Clear existing banners first
      const existingBanners = await storage.getAdvertisementBannersByPosition('header');
      for (const banner of existingBanners) {
        await storage.deleteAdvertisementBanner(banner.id);
      }
      const existingTop = await storage.getAdvertisementBannersByPosition('top');
      for (const banner of existingTop) {
        await storage.deleteAdvertisementBanner(banner.id);
      }
      const existingLeft = await storage.getAdvertisementBannersByPosition('left');
      for (const banner of existingLeft) {
        await storage.deleteAdvertisementBanner(banner.id);
      }
      const existingRight = await storage.getAdvertisementBannersByPosition('right');
      for (const banner of existingRight) {
        await storage.deleteAdvertisementBanner(banner.id);
      }
      const existingBottom = await storage.getAdvertisementBannersByPosition('bottom');
      for (const banner of existingBottom) {
        await storage.deleteAdvertisementBanner(banner.id);
      }
      
      await seedAdvertisementBanners();
      res.json({ message: 'Advertisement banners seeded successfully' });
    } catch (error) {
      console.error('Error seeding advertisement banners:', error);
      res.status(500).json({ error: 'Failed to seed advertisement banners' });
    }
  });

  // Page view tracking routes
  app.post('/api/page-views', async (req, res) => {
    try {
      const { pageName, pageUrl, userAgent } = req.body;
      
      if (!pageName || !pageUrl) {
        return res.status(400).json({ error: 'Page name and URL are required' });
      }

      // Get client IP address (handle various proxy headers)
      const forwarded = req.headers['x-forwarded-for'] as string;
      const ipAddress = req.ip || 
                       forwarded?.split(',')[0]?.trim() ||
                       req.headers['x-real-ip'] ||
                       req.connection?.remoteAddress ||
                       req.socket?.remoteAddress ||
                       'unknown';

      const pageView = await storage.createPageView({
        pageName,
        pageUrl,
        ipAddress: String(ipAddress),
        userAgent: userAgent || req.headers['user-agent'] || 'unknown'
      });

      res.status(201).json(pageView);
    } catch (error) {
      console.error('Error tracking page view:', error);
      res.status(500).json({ error: 'Failed to track page view' });
    }
  });

  // Get page view analytics
  app.get('/api/page-views', async (req, res) => {
    try {
      const { page_name, limit } = req.query;
      const pageViews = await storage.getPageViews(
        page_name as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(pageViews);
    } catch (error) {
      console.error('Error getting page views:', error);
      res.status(500).json({ error: 'Failed to get page views' });
    }
  });

  // Get page view count
  app.get('/api/page-views/count/:pageName', async (req, res) => {
    try {
      const { pageName } = req.params;
      const { ip_address } = req.query;
      
      const count = await storage.getPageViewCount(
        pageName, 
        ip_address as string
      );
      
      res.json({ count });
    } catch (error) {
      console.error('Error getting page view count:', error);
      res.status(500).json({ error: 'Failed to get page view count' });
    }
  });

  // Click-through tracking routes
  app.post('/api/click-thru', async (req, res) => {
    try {
      const { 
        pageName, 
        pageUrl, 
        advertisementId,
        advertisementTitle, 
        advertisementClickUrl,
        bannerPosition,
        userAgent 
      } = req.body;
      
      if (!pageName || !pageUrl || !advertisementId) {
        return res.status(400).json({ 
          error: 'Page name, URL, and advertisement ID are required' 
        });
      }

      // Get client IP address (handle various proxy headers)
      const forwarded = req.headers['x-forwarded-for'] as string;
      const ipAddress = req.ip || 
                       forwarded?.split(',')[0]?.trim() ||
                       req.headers['x-real-ip'] ||
                       req.connection?.remoteAddress ||
                       req.socket?.remoteAddress ||
                       'unknown';

      const clickThru = await storage.createClickThru({
        pageName,
        pageUrl,
        advertisementId,
        advertisementTitle: advertisementTitle || 'Unknown',
        advertisementClickUrl: advertisementClickUrl || '#',
        bannerPosition: bannerPosition || 'unknown',
        ipAddress: ipAddress.toString(),
        userAgent: userAgent || 'Unknown'
      });
      
      res.status(201).json(clickThru);
    } catch (error) {
      console.error('Error tracking click-through:', error);
      res.status(500).json({ error: 'Failed to track click-through' });
    }
  });

  // Get click-through analytics  
  app.get('/api/click-thru', async (req, res) => {
    try {
      const { page_name, limit } = req.query;
      const clickThrus = await storage.getClickThrus(
        page_name as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(clickThrus);
    } catch (error) {
      console.error('Error getting click-throughs:', error);
      res.status(500).json({ error: 'Failed to get click-throughs' });
    }
  });

  // Get click-through count for specific advertisement
  app.get('/api/click-thru/count/:advertisementId', async (req, res) => {
    try {
      const { advertisementId } = req.params;
      
      const count = await storage.getClickThruCount(advertisementId);
      
      res.json({ count });
    } catch (error) {
      console.error('Error getting click-through count:', error);
      res.status(500).json({ error: 'Failed to get click-through count' });
    }
  });

  // Duplicate page endpoint
  app.post('/api/duplicate-page', async (req, res) => {
    try {
      const { originalPageUrl, newPage } = req.body;
      
      if (!originalPageUrl || !newPage?.name || !newPage?.url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for duplicate URL
      const existingPageByUrl = await storage.getBannerSettingByPage(newPage.url);
      if (existingPageByUrl) {
        return res.status(400).json({ error: 'A page with this URL already exists' });
      }

      // Check for duplicate name
      const allSettings = await storage.getBannerSettings();
      const existingPageByName = allSettings.find((setting: any) => 
        setting.pageName.toLowerCase() === newPage.name.toLowerCase()
      );
      if (existingPageByName) {
        return res.status(400).json({ error: 'A page with this name already exists' });
      }

      // Get original page settings
      const originalSettings = await storage.getBannerSettingByPage(originalPageUrl);
      
      // Create new page settings with same configuration
      const newPageSettings = {
        pageName: newPage.name,
        pageUrl: newPage.url,
        isVisible: originalSettings?.isVisible ?? true,
        showHeader: originalSettings?.showHeader ?? true,
        showTop: originalSettings?.showTop ?? true,
        showLeft: originalSettings?.showLeft ?? true,
        showRight: originalSettings?.showRight ?? true,
        showBottom: originalSettings?.showBottom ?? true
      };

      // Save new page settings
      await storage.createBannerSettings(newPageSettings);

      // Get original page banners
      const originalBanners = await storage.getAdvertisementBannersByPage(originalPageUrl);
      
      // Duplicate banners for the new page
      for (const banner of originalBanners) {
        await storage.createAdvertisementBanner({
          pageUrl: newPage.url,
          position: banner.position,
          size: banner.size,
          title: banner.title,
          description: banner.description,
          imageUrl: banner.imageUrl,
          clickUrl: banner.clickUrl,
          isActive: banner.isActive,
          alwaysShow: banner.alwaysShow,
          maxImpressions: banner.maxImpressions,
          displayOrder: banner.displayOrder
        });
      }

      res.status(201).json({
        success: true,
        name: newPage.name,
        url: newPage.url,
        description: newPage.description,
        bannersCount: originalBanners.length
      });
    } catch (error) {
      console.error('Error duplicating page:', error);
      res.status(500).json({ error: 'Failed to duplicate page' });
    }
  });

  // Create new page endpoint
  app.post('/api/create-page', async (req, res) => {
    try {
      const { newPage } = req.body;
      
      if (!newPage?.name || !newPage?.url) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check for duplicate URL
      const existingPageByUrl = await storage.getBannerSettingByPage(newPage.url);
      if (existingPageByUrl) {
        return res.status(400).json({ error: 'A page with this URL already exists' });
      }

      // Check for duplicate name
      const allSettings = await storage.getBannerSettings();
      const existingPageByName = allSettings.find((setting: any) => 
        setting.pageName.toLowerCase() === newPage.name.toLowerCase()
      );
      if (existingPageByName) {
        return res.status(400).json({ error: 'A page with this name already exists' });
      }

      // Create new page settings with default configuration
      const newPageSettings = {
        pageName: newPage.name,
        pageUrl: newPage.url,
        isVisible: true,
        showHeader: true,
        showTop: true,
        showLeft: true,
        showRight: true,
        showBottom: true
      };

      // Save new page settings
      await storage.createBannerSettings(newPageSettings);

      res.status(201).json({
        success: true,
        name: newPage.name,
        url: newPage.url,
        description: newPage.description || '',
        bannersCount: 0
      });
    } catch (error) {
      console.error('Error creating page:', error);
      res.status(500).json({ error: 'Failed to create page' });
    }
  });

  // Subdomains API endpoints
  app.get('/api/subdomains', async (req, res) => {
    try {
      const subdomainsList = await storage.getSubdomains();
      res.json(subdomainsList);
    } catch (error) {
      console.error('Error getting subdomains:', error);
      res.status(500).json({ error: 'Failed to get subdomains' });
    }
  });

  // Analytics endpoints
  app.get('/api/analytics/page-views', async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const subdomainId = req.query.subdomain as string;
      const analytics = await storage.getPageViewAnalytics(days, subdomainId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting page view analytics:', error);
      res.status(500).json({ error: 'Failed to get analytics data' });
    }
  });

  app.get('/api/analytics/click-thru', async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const subdomainId = req.query.subdomain as string;
      const analytics = await storage.getClickThruAnalytics(days, subdomainId);
      res.json(analytics);
    } catch (error) {
      console.error('Error getting click-through analytics:', error);
      res.status(500).json({ error: 'Failed to get click-through analytics data' });
    }
  });

  app.get('/api/analytics/daily-summary', async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const subdomainId = req.query.subdomain as string;
      const summary = await storage.getDailySummary(days, subdomainId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting daily summary:', error);
      res.status(500).json({ error: 'Failed to get daily summary' });
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

// Seed advertisement banners with public service announcements
async function seedAdvertisementBanners() {
  // Header banners - large, prominent placement
  await storage.createAdvertisementBanner({
    position: "header",
    size: "large",
    title: "Digital Safety First",
    description: "Learn about online privacy, cybersecurity, and protecting your digital identity",
    imageUrl: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=200&fit=crop&auto=format",
    clickUrl: "https://staysafeonline.org",
    isActive: true,
    displayOrder: 1,
  });

  await storage.createAdvertisementBanner({
    position: "header",
    size: "large", 
    title: "Financial Literacy Initiative",
    description: "Build better money habits with free financial education resources",
    imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=200&fit=crop&auto=format",
    clickUrl: "https://mymoney.gov",
    isActive: true,
    displayOrder: 2,
  });

  // Top banners - medium size, above content
  await storage.createAdvertisementBanner({
    position: "top",
    size: "medium",
    title: "Mental Health Awareness",
    description: "Find support, resources, and information about mental wellness",
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=150&fit=crop&auto=format",
    clickUrl: "https://mentalhealth.gov",
    isActive: true,
    displayOrder: 1,
  });

  await storage.createAdvertisementBanner({
    position: "top",
    size: "medium",
    title: "Environmental Conservation",
    description: "Small actions, big impact - Learn how to protect our planet",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&h=150&fit=crop&auto=format",
    clickUrl: "https://epa.gov/education",
    isActive: true,
    displayOrder: 2,
  });

  // Left sidebar banners - vertical, complementary content
  await storage.createAdvertisementBanner({
    position: "left",
    size: "medium",
    title: "Community Volunteering",
    description: "Make a difference in your community through volunteer opportunities",
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&h=400&fit=crop&auto=format",
    clickUrl: "https://volunteermatch.org",
    isActive: true,
    displayOrder: 1,
  });

  await storage.createAdvertisementBanner({
    position: "left",
    size: "small",
    title: "Digital Wellness",
    description: "Healthy technology use for better life balance",
    imageUrl: "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=300&h=300&fit=crop&auto=format",
    clickUrl: "https://digitalwellness.org",
    isActive: true,
    displayOrder: 2,
  });

  // Right sidebar banners - additional promotional content
  await storage.createAdvertisementBanner({
    position: "right",
    size: "medium",
    title: "Educational Resources",
    description: "Free online courses and learning materials for all ages",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&auto=format",
    clickUrl: "https://coursera.org/browse/free-courses",
    isActive: true,
    displayOrder: 1,
  });

  await storage.createAdvertisementBanner({
    position: "right",
    size: "small",
    title: "Health & Nutrition",
    description: "Evidence-based nutrition and health information",
    imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=300&h=300&fit=crop&auto=format",
    clickUrl: "https://nutrition.gov",
    isActive: true,
    displayOrder: 2,
  });

  // Bottom banners - footer area, final call-to-action
  await storage.createAdvertisementBanner({
    position: "bottom",
    size: "large",
    title: "Emergency Preparedness",
    description: "Be ready for emergencies with preparation tips and emergency kits",
    imageUrl: "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&h=200&fit=crop&auto=format",
    clickUrl: "https://ready.gov",
    isActive: true,
    displayOrder: 1,
  });

  await storage.createAdvertisementBanner({
    position: "bottom",
    size: "medium",
    title: "Stay Informed",
    description: "Follow reliable news sources and fact-check information online",
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=600&h=150&fit=crop&auto=format",
    clickUrl: "https://factcheck.org",
    isActive: true,
    displayOrder: 2,
  });
  // Create sample users for demonstration
  const sampleUsers = [
    {
      username: "johndoe",
      email: "john.doe@example.com",
      password: "password123"
    },
    {
      username: "sarahsmith",
      email: "sarah.smith@example.com", 
      password: "password123"
    },
    {
      username: "mikechen",
      email: "mike.chen@gmail.com",
      password: "password123"
    },
    {
      username: "emilyjohnson",
      email: "emily.johnson@yahoo.com",
      password: "password123"
    },
    {
      username: "davidbrown",
      email: "david.brown@outlook.com",
      password: "password123"
    },
    {
      username: "jessicawilson",
      email: "jessica.wilson@example.com",
      password: "password123"
    },
    {
      username: "robertdavis",
      email: "robert.davis@gmail.com",
      password: "password123"
    },
    {
      username: "amandamoore",
      email: "amanda.moore@example.com",
      password: "password123"
    },
    {
      username: "christaylor",
      email: "chris.taylor@yahoo.com",
      password: "password123"
    },
    {
      username: "lauramiller",
      email: "laura.miller@gmail.com",
      password: "password123"
    },
    {
      username: "jamesanderson",
      email: "james.anderson@example.com",
      password: "password123"
    },
    {
      username: "rachelthomas",
      email: "rachel.thomas@outlook.com",
      password: "password123"
    }
  ];

  for (const userData of sampleUsers) {
    // Check if user already exists to avoid duplicates
    const existingUser = await storage.getUserByUsername(userData.username);
    if (!existingUser) {
      await storage.createUser(userData);
    }
  }
}

// Seed directory businesses with Yelp-style business data
async function seedDirectoryBusinesses() {
  // First create business categories
  const restaurantCategory = await storage.createBusinessCategory({
    name: "Restaurants",
    slug: "restaurants",
    description: "Dining establishments, cafes, and food services",
    iconName: "utensils",
    isActive: true,
    sortOrder: 1,
  });

  const shoppingCategory = await storage.createBusinessCategory({
    name: "Shopping",
    slug: "shopping",
    description: "Retail stores, boutiques, and shopping centers",
    iconName: "shopping-bag",
    isActive: true,
    sortOrder: 2,
  });

  const servicesCategory = await storage.createBusinessCategory({
    name: "Professional Services",
    slug: "professional-services",
    description: "Legal, financial, consulting, and other professional services",
    iconName: "briefcase",
    isActive: true,
    sortOrder: 3,
  });

  const healthCategory = await storage.createBusinessCategory({
    name: "Health & Medical",
    slug: "health-medical",
    description: "Hospitals, clinics, doctors, and medical services",
    iconName: "heart-pulse",
    isActive: true,
    sortOrder: 4,
  });

  const beautyCategory = await storage.createBusinessCategory({
    name: "Beauty & Spas",
    slug: "beauty-spas",
    description: "Salons, spas, beauty treatments, and wellness services",
    iconName: "sparkles",
    isActive: true,
    sortOrder: 5,
  });

  const autoCategory = await storage.createBusinessCategory({
    name: "Automotive",
    slug: "automotive",
    description: "Car dealers, repair shops, and automotive services",
    iconName: "car",
    isActive: true,
    sortOrder: 6,
  });

  // Create restaurants - Real San Francisco businesses from Yelp
  const richTable = await storage.createBusiness({
    name: "Rich Table",
    slug: "rich-table",
    description: "Hayes Valley's 13-year veteran serving innovative American cuisine with sea urchin cacio e pepe pasta and seasonal dishes. Rated #1 by SF Chronicle 2025.",
    address: "199 Gough St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94102",
    phone: "(415) 355-9085",
    email: "info@richtablesf.com",
    website: "https://www.richtablesf.com",
    imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: restaurantCategory.id,
    rating: "4.6",
    reviewCount: 2847,
    priceRange: "$$$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7749",
    longitude: "-122.4194",
  });

  const fourKings = await storage.createBusiness({
    name: "Four Kings",
    slug: "four-kings",
    description: "Chinatown hot spot serving pork chop rice with tomato gravy, mapo spaghetti, and XO escargot. Deemed 'the most fun place to eat in the Bay Area' by SF Chronicle.",
    address: "709 Grant Ave",
    city: "San Francisco", 
    state: "CA",
    zipCode: "94108",
    phone: "(415) 888-8888",
    email: "hello@fourkingssf.com",
    website: "https://fourkingssf.com",
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: restaurantCategory.id,
    rating: "4.8",
    reviewCount: 1623,
    priceRange: "$$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7949",
    longitude: "-122.4094",
  });

  const paperSonCoffee = await storage.createBusiness({
    name: "Paper Son Coffee",
    slug: "paper-son-coffee",
    description: "Consistently #1 rated coffee shop in San Francisco. Specializing in expertly crafted espresso drinks and single-origin pour-overs.",
    address: "1520 Fillmore St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94115",
    phone: "(415) 814-3056",
    email: "info@papersoncoffee.com",
    website: "https://papersoncoffee.com",
    imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: restaurantCategory.id,
    rating: "4.9",
    reviewCount: 892,
    priceRange: "$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7880",
    longitude: "-122.4374",
  });

  const oceanIndian = await storage.createBusiness({
    name: "Ocean Indian Cuisine",
    slug: "ocean-indian-cuisine",
    description: "The only San Francisco restaurant to make Yelp's national Top 100 for 2024. Indian-Nepalese-Himalayan fusion on Geary Boulevard, called 'life-changing' by reviewers.",
    address: "4033 Geary Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94118",
    phone: "(415) 221-3617",
    email: "info@oceanindiancuisine.com",
    website: "https://oceanindiancuisine.com",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: restaurantCategory.id,
    rating: "4.8",
    reviewCount: 2156,
    priceRange: "$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7799",
    longitude: "-122.4694",
  });

  // Create professional services
  const lawFirm = await storage.createBusiness({
    name: "Smith & Associates Law Firm",
    slug: "smith-associates-law",
    description: "Full-service law firm specializing in business law, real estate, and estate planning. Over 25 years of experience serving Bay Area clients.",
    address: "100 Financial District",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phone: "(415) 555-0100",
    email: "contact@smithlaw.com",
    website: "https://smithlaw.com",
    imageUrl: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: servicesCategory.id,
    rating: "4.7",
    reviewCount: 156,
    priceRange: "$$$$",
    isActive: true,
    isFeatured: false,
    isOpenNow: true,
    latitude: "37.7946",
    longitude: "-122.3999",
  });

  // Create health/fitness business  
  const liveFitGym = await storage.createBusiness({
    name: "Live Fit Gym - Castro",
    slug: "live-fit-gym-castro",
    description: "San Francisco's largest and most comprehensive fitness facility. 16,000 sq. ft. wellness haven and the only doctor-owned gym in San Francisco.",
    address: "2301 Market St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94114",
    phone: "(415) 863-4688",
    email: "castro@livefitgym.com",
    website: "https://livefitgym.com",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: healthCategory.id,
    rating: "4.5",
    reviewCount: 1324,
    priceRange: "$$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7649",
    longitude: "-122.4394",
  });

  // Create beauty/salon business
  const codeSalon = await storage.createBusiness({
    name: "CODE salon",
    slug: "code-salon",
    description: "Top-rated hair salon in San Francisco offering cutting-edge styling, color treatments, and personalized hair care services.",
    address: "2127 Fillmore St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94115",
    phone: "(415) 346-2633",
    email: "appointments@codesalon.com",
    website: "https://codesalon.com",
    imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: beautyCategory.id,
    rating: "4.7",
    reviewCount: 456,
    priceRange: "$$$",
    isActive: true,
    isFeatured: true,
    isOpenNow: true,
    latitude: "37.7946",
    longitude: "-122.4399",
  });

  // Create another coffee shop
  const sightglassCoffee = await storage.createBusiness({
    name: "Sightglass Coffee",
    slug: "sightglass-coffee",
    description: "Popular artisan coffee roaster with industrial-chic space. Perfect for studying with excellent single-origin coffees and espresso drinks.",
    address: "270 7th St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    phone: "(415) 861-1313",
    email: "hello@sightglasscoffee.com",
    website: "https://sightglasscoffee.com",
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop&auto=format",
    businessCategoryId: restaurantCategory.id,
    rating: "4.4",
    reviewCount: 1845,
    priceRange: "$$",
    isActive: true,
    isFeatured: false,
    isOpenNow: true,
    latitude: "37.7716",
    longitude: "-122.4094",
  });

  // Create business hours for restaurants (example for Rich Table)
  const daysOfWeek = [0, 1, 2, 3, 4, 5, 6]; // Sunday = 0, Monday = 1, etc.
  for (const day of daysOfWeek) {
    await storage.createBusinessHours({
      businessId: richTable.id,
      dayOfWeek: day,
      openTime: day === 0 ? "17:00" : "11:30", // Sunday dinner only
      closeTime: day === 6 ? "23:00" : "22:00", // Saturday late close
      isClosed: false,
    });
  }

  // Create reviews for businesses with real Yelp-style content
  await storage.createBusinessReview({
    businessId: richTable.id,
    title: "Outstanding fine dining experience",
    rating: 5,
    content: "The sea urchin cacio e pepe is absolutely mind-blowing! Creative dishes executed perfectly. Service was attentive without being intrusive. Easily one of the best meals I've had in SF.",
    reviewerName: "Sarah M.",
    isVerified: true,
  });

  await storage.createBusinessReview({
    businessId: fourKings.id,
    title: "Most fun dinner in Chinatown!",
    rating: 5,
    content: "The pork chop rice with tomato gravy is incredible - such a unique take on comfort food. The energy here is infectious and the cocktails are amazing. Definitely lives up to the hype!",
    reviewerName: "Mike R.",
    isVerified: true,
  });

  await storage.createBusinessReview({
    businessId: paperSonCoffee.id,
    title: "Best coffee in the city",
    rating: 5,
    content: "Consistently perfect espresso and the baristas really know their craft. The single-origin pour-overs are exceptional. Great vibe for working too.",
    reviewerName: "Jennifer L.",
    isVerified: true,
  });

  await storage.createBusinessReview({
    businessId: oceanIndian.id,
    title: "Life-changing Himalayan cuisine",
    rating: 5,
    content: "Now I understand why this made Yelp's national Top 100! The flavors are incredible and unlike anything else in the city. The dal is perfect.",
    reviewerName: "David K.",
    isVerified: true,
  });

  // Create business photos
  await storage.createBusinessPhoto({
    businessId: richTable.id,
    imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop&auto=format",
    caption: "Elegant Hayes Valley dining room",
    sortOrder: 1,
  });

  await storage.createBusinessPhoto({
    businessId: richTable.id,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format",
    caption: "Famous sea urchin cacio e pepe",
    sortOrder: 2,
  });

  await storage.createBusinessPhoto({
    businessId: fourKings.id,
    imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop&auto=format",
    caption: "Vibrant Chinatown atmosphere",
    sortOrder: 1,
  });

  await storage.createBusinessPhoto({
    businessId: fourKings.id,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format",
    caption: "Signature pork chop rice with tomato gravy",
    sortOrder: 2,
  });

  await storage.createBusinessPhoto({
    businessId: paperSonCoffee.id,
    imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop&auto=format",
    caption: "Expertly crafted pour-over coffee",
    sortOrder: 1,
  });

  await storage.createBusinessPhoto({
    businessId: oceanIndian.id,
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&auto=format",
    caption: "Authentic Himalayan cuisine plating",
    sortOrder: 1,
  });
}
