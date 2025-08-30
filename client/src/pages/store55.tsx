import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, User } from "lucide-react";
import { usePageTracking } from "@/hooks/use-page-tracking";
import type { DealWithRelations } from "@shared/schema";
import { HeartButton } from "@/components/HeartButton";
import { useSiteSettings } from "@/hooks/use-site-settings";
import UserMenu from "@/components/user-menu";
import NavMenu from "@/components/nav-menu";
import { FAlLLBACK_IMAGE } from "@/lib/constant";

export default function Store55() {
  // Track page view for analytics
  usePageTracking("Store55", "/store55");

  // Fetch featured deals
  const { 
    data: featuredDeals = [], 
    isLoading: dealsLoading 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/featured"],
  });

  // Fetch all deals
  const { 
    data: allDeals = [], 
    isLoading: allDealsLoading 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

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

  // Split deals into different sections
  const topDeals = useMemo(() => {
    return allDeals.slice(0, 7);
  }, [allDeals]);

  const summerDeals = useMemo(() => {
    return allDeals.slice(7, 14);
  }, [allDeals]);

  const fallDeals = useMemo(() => {
    return allDeals.slice(14, 21);
  }, [allDeals]);

  const ProductCard = ({ deal, index, section }: { deal: DealWithRelations, index: number, section: string }) => {
    const discount = calculateDiscount(deal.originalPrice, deal.salePrice);

    return (
      <a href={`/deal/${deal.id}`} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
        <div className="relative">
          <img 
            src={deal.imageUrl || ''} 
            alt={deal.title}
            className="w-full h-48 object-cover"
            data-testid={`img-${section}-deal-${index}`}
            onError={(e) => {
              const target = e.currentTarget;
              target.onerror = null; // prevent infinite loop
              target.src = FAlLLBACK_IMAGE;
            }}
          />
          
          <div className="absolute top-2 right-2">
            <HeartButton dealId={deal.id} className="bg-white/80 hover:bg-white" />
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {deal.salePrice && (
                <div className="text-lg font-bold text-black mb-1">
                  {formatPrice(deal.salePrice)}
                </div>
              )}
              {deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice && (
                <div className="text-sm text-gray-500">
                  was {formatPrice(deal.originalPrice)}
                </div>
              )}
            </div>
            
            {discount > 0 && (
              <span className="text-sm text-green-600 font-medium ml-2">
                Save {discount}%
              </span>
            )}
          </div>
          
          <h3 className="font-medium text-sm text-gray-900 line-clamp-2" data-testid={`title-${section}-deal-${index}`}>
            {deal.title}
          </h3>
        </div>
      </a>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Store55 styling */}
      <div className="bg-white border-b">
        <div className="bg-gray-100 py-1">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-600">
              {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
            </p>
          </div>
        </div>
        
<NavMenu />
      </div>

      <main className="container mx-auto px-4 py-6">
        {/* Top Featured Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
            {dealsLoading || allDealsLoading ? (
              Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              topDeals.map((deal, index) => (
                <ProductCard 
                  key={deal.id} 
                  deal={deal} 
                  index={index} 
                  section="top" 
                />
              ))
            )}
          </div>
        </section>

        {/* End of Summer Deals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="title-summer-deals">
              End of Summer Deals
            </h2>
            <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0">
              View All (74)
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {dealsLoading || allDealsLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-64">
                    <Skeleton className="w-full h-48 rounded-lg mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                summerDeals.map((deal, index) => (
                  <div key={deal.id} className="flex-none w-64">
                    <ProductCard 
                      deal={deal} 
                      index={index} 
                      section="summer" 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Early Fall Deals Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="title-fall-deals">
              Early Fall Deals
            </h2>
            <Button variant="link" className="text-blue-600 hover:text-blue-800 p-0">
              View All (215)
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {dealsLoading || allDealsLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-64">
                    <Skeleton className="w-full h-48 rounded-lg mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                fallDeals.map((deal, index) => (
                  <div key={deal.id} className="flex-none w-64">
                    <ProductCard 
                      deal={deal} 
                      index={index} 
                      section="fall" 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}