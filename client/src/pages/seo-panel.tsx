import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, Video, FileText, Users, Search } from "lucide-react";
import TopNav from "@/components/top-nav";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";

interface Page {
  name: string;
  url: string;
  icon: any;
  description: string;
}

const STATIC_PAGES: Page[] = [
  { name: "SEO Panel", url: "/seo-panel", icon: Globe, description: "SEO & page management controls" },
  { name: "Videos", url: "/videos", icon: Video, description: "Video channel content" },
  { name: "Video2", url: "/video2", icon: Video, description: "YouTube-style videos" },
  { name: "Posts", url: "/posts", icon: FileText, description: "Reddit-style posts" },
  { name: "Blogs", url: "/blogs", icon: FileText, description: "Blog articles and content" },
  { name: "Directory", url: "/directory", icon: Users, description: "Business directory" },
  { name: "Search", url: "/search", icon: Search, description: "Search results page" },
];

export default function SEOPanelPage() {

  // Query for page visibility status
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: () => fetch('/api/visible-pages').then(res => res.json())
  });

  // Create dynamic pages list from database
  const dynamicPages: Page[] = visiblePages ? visiblePages.map((page: any) => {
    // Find matching static page for icon, or use default
    const staticMatch = STATIC_PAGES.find(sp => sp.url === page.pageUrl);
    return {
      name: page.pageName,
      url: page.pageUrl,
      icon: staticMatch?.icon || FileText,
      description: staticMatch?.description || page.pageName
    };
  }) : [];


  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
      
        {/* Main Content - Full Width for SEO Panel */}
        <div className="w-full p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-net-green" />
              <div>
                <h1 className="text-3xl font-bold text-net-dark">SEO & Page Management</h1>
                <p className="text-gray-600">Comprehensive SEO controls and page visibility management</p>
              </div>
            </div>

            {/* SEO & Page Management Overview */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  SEO & Page Management
                </CardTitle>
                <CardDescription>
                  Comprehensive SEO controls and page visibility management. Changes affect navigation menus, 
                  search engine crawling, and sitemap generation in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* SEO Tools */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm">Dynamic Sitemap</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Auto-generated based on visible pages
                    </p>
                    <a 
                      href="/sitemap.xml" 
                      target="_blank"
                      className="text-net-green hover:underline text-sm mt-2 inline-block"
                      data-testid="link-sitemap"
                    >
                      View Sitemap →
                    </a>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm">Robots.txt</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Search engine crawling directives
                    </p>
                    <a 
                      href="/robots.txt" 
                      target="_blank"
                      className="text-net-green hover:underline text-sm mt-2 inline-block"
                      data-testid="link-robots"
                    >
                      View Robots.txt →
                    </a>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium text-sm">Page Status</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {visiblePages?.filter((p: any) => p.isVisible).length || 0} of {visiblePages?.length || 0} pages visible
                    </p>
                    <span className="text-green-600 text-sm mt-2 inline-block">
                      ✓ SEO Optimized
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                {/* Quick Page Visibility Stats */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Page Visibility Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-green-600 font-medium">
                        {visiblePages?.filter((p: any) => p.isVisible).length || 0}
                      </span>
                      <span className="text-gray-600 ml-1">Visible</span>
                    </div>
                    <div>
                      <span className="text-red-600 font-medium">
                        {visiblePages?.filter((p: any) => !p.isVisible).length || 0}
                      </span>
                      <span className="text-gray-600 ml-1">Hidden</span>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">
                        {visiblePages?.filter((p: any) => p.isVisible && p.pageUrl !== '/').length || 0}
                      </span>
                      <span className="text-gray-600 ml-1">In Sitemap</span>
                    </div>
                    <div>
                      <span className="text-purple-600 font-medium">
                        {visiblePages?.filter((p: any) => p.isVisible && p.pageUrl.includes('/admin')).length || 0}
                      </span>
                      <span className="text-gray-600 ml-1">Admin Protected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}