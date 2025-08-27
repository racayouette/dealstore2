import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/footer";
import DealCard from "@/components/deal-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { usePageTracking } from "@/hooks/use-page-tracking";
import type { DealWithRelations, BannerSettings } from "@shared/schema";
import NotFound from "@/pages/not-found";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  affiliateDisclosure: string;
}

export default function DynamicPage() {
  const [location] = useLocation();
  
  // Track page view for analytics
  usePageTracking("Dynamic Page", location);

  // Fetch site settings
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return response.json();
    },
  });

  // Fetch visible pages for navigation
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: async () => {
      const response = await fetch('/api/visible-pages');
      if (!response.ok) throw new Error('Failed to fetch visible pages');
      return response.json();
    },
  });

  // Check if current page exists in banner settings
  const { data: pageSettings, isLoading: pageLoading } = useQuery<BannerSettings>({
    queryKey: ['/api/banner-settings', location],
    queryFn: async () => {
      const response = await fetch(`/api/banner-settings${location}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Page not found');
        }
        throw new Error('Failed to fetch page settings');
      }
      return response.json();
    },
    retry: false,
  });

  // Fetch featured deals
  const { 
    data: featuredDeals = [], 
    isLoading: dealsLoading 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/featured"],
    enabled: !!pageSettings, // Only fetch if page exists
  });

  // Fetch all deals
  const { 
    data: allDeals = [], 
    isLoading: allDealsLoading 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
    enabled: !!pageSettings, // Only fetch if page exists
  });

  // If page is not found in banner settings, show 404
  if (!pageLoading && !pageSettings) {
    return <NotFound />;
  }

  // If still loading page settings, show loading
  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number | string | null) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || numPrice <= 0) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numPrice);
  };

  const calculateDiscount = (originalPrice: number | string | null, salePrice: number | string | null) => {
    const numOriginal = typeof originalPrice === 'string' ? parseFloat(originalPrice) : originalPrice;
    const numSale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
    if (!numOriginal || !numSale || numOriginal <= numSale) return 0;
    return Math.round(((numOriginal - numSale) / numOriginal) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with blue banner matching stores page */}
      <div className="bg-white border-b">
        <div className="bg-gray-100 py-1">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-600">
              {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
            </p>
          </div>
        </div>
        
        <div className="bg-blue-600 text-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold" data-testid={`title-${pageSettings?.pageName?.toLowerCase()}`}>
                  {siteSettings?.siteName || 'NETDISCOUNT'}
                </h1>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="hover:text-blue-200 transition-colors">Home</a>
                  {Array.isArray(visiblePages) && visiblePages.map((page: any) => (
                    <a
                      key={page.pageUrl}
                      href={page.pageUrl}
                      className="hover:text-blue-200 transition-colors"
                    >
                      {page.pageName}
                    </a>
                  ))}
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
                  <User className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid={`title-${pageSettings?.pageName?.toLowerCase()}`}>
            {pageSettings?.pageName || 'Page'} Deals
          </h1>
          <p className="text-gray-600">
            Discover great deals and discounts
          </p>
        </div>

        {/* Featured Deals Section */}
        {featuredDeals.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Deals</h2>
            {dealsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredDeals.slice(0, 6).map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Deals Section */}
        {allDeals.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Deals</h2>
            {allDealsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                    <Skeleton className="w-full h-48 mb-4" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allDeals.map(deal => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </section>
        )}

        {!dealsLoading && !allDealsLoading && featuredDeals.length === 0 && allDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No deals available at this time.</p>
            <p className="text-gray-500 mt-2">Check back later for new deals and discounts!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}