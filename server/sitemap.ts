import { storage } from "./storage";

export async function generateSitemap(): Promise<string> {
  const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
  
  // Get all visible pages
  const visiblePages = await storage.getVisiblePages();
  
  // Get categories for category pages
  const categories = await storage.getCategories();
  
  // Get stores for store pages
  const stores = await storage.getStores();
  
  // Static pages that are always included
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/stores', priority: '0.8', changefreq: 'weekly' },
    { url: '/auth', priority: '0.3', changefreq: 'monthly' },
    { url: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { url: '/terms', priority: '0.3', changefreq: 'monthly' },
  ];
  
  // Dynamic pages based on visibility
  const dynamicPages = visiblePages.map(page => ({
    url: page.pageUrl,
    priority: '0.7',
    changefreq: 'weekly'
  }));
  
  // Category pages
  const categoryPages = categories
    .filter(cat => cat.isActive)
    .map(category => ({
      url: `/category/${category.slug}`,
      priority: '0.6',
      changefreq: 'weekly'
    }));
  
  // Note: Individual store pages don't exist in current structure
  // Only the main stores listing page exists which is in staticPages
  
  // Get recent deals for deal pages
  const recentDeals = await storage.getDeals(100); // Get last 100 deals
  const dealPages = recentDeals
    .filter(deal => deal.isActive)
    .map(deal => ({
      url: `/deal/${deal.id}`,
      priority: '0.4',
      changefreq: 'weekly'
    }));
  
  // Combine all pages
  const allPages = [
    ...staticPages,
    ...dynamicPages,
    ...categoryPages,
    ...dealPages
  ];
  
  // Generate XML sitemap
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
}

export async function generateRobotsTxt(): Promise<string> {
  const baseUrl = process.env.BASE_URL || 'https://your-domain.com';
  
  return `User-agent: *
Allow: /

# Disallow admin areas
Disallow: /advertising-panel
Disallow: /wp-admin
Disallow: /admin-login

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Crawl delay (optional - be respectful to search engines)
Crawl-delay: 1`;
}