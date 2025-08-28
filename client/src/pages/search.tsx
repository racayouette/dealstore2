import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import UserMenu from "@/components/user-menu";
import { usePageTracking } from "@/hooks/use-page-tracking";
import { useSiteSettings } from "@/hooks/use-site-settings";
import NavMenu from "@/components/nav-menu";

export default function SearchPage() {
  // Track page view for analytics
  usePageTracking("Search", "/search");

  // Fetch site settings from global cache
  const { data: siteSettings } = useSiteSettings();

  // Fetch visible pages for navigation
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: async () => {
      const response = await fetch('/api/visible-pages');
      if (!response.ok) throw new Error('Failed to fetch visible pages');
      return response.json();
    },
  });

  const breadcrumbItems = [
    { label: "Stores", href: "/" },
    { label: "Search" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 py-1">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
          </p>
        </div>
      </div>
      
      {/* Header */}
<NavMenu />
      
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-net-dark mb-2">Search Results</h1>
          <p className="text-gray-600">
            Find deals, stores, and more across our platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Search functionality coming soon</h3>
            <p className="text-gray-500">This page will display search results for deals, stores, and content</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}