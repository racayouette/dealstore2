import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { usePageTracking } from "@/hooks/use-page-tracking";
import type { DealWithRelations } from "@shared/schema";
import { HeartButton } from "@/components/HeartButton";
import { useRef } from "react";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  affiliateDisclosure: string;
}

export default function Store44() {
  // Track page view for analytics
  usePageTracking("Store44", "/store44");

  // Fetch all deals
  const { 
    data: allDeals = [], 
    isLoading: dealsLoading 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

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

  // Group deals by category
  const categorizedDeals = allDeals.reduce((acc, deal) => {
    const category = deal.category?.name || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(deal);
    return acc;
  }, {} as Record<string, DealWithRelations[]>);

  // Get category display names and deal counts
  const categoryInfo = {
    'Electronics': { displayName: 'Deals for Electronics & Tech', deals: categorizedDeals['Electronics'] || [] },
    'Computers': { displayName: 'Computer & Office Deals', deals: categorizedDeals['Computers'] || [] },
    'Lifestyle & Home': { displayName: 'Deals for Your Home & Kitchen', deals: categorizedDeals['Lifestyle & Home'] || [] },
    'Small Business': { displayName: 'Small Business Essentials', deals: categorizedDeals['Small Business'] || [] },
  };

  // Scroll function for horizontal containers
  const scroll = (elementRef: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (elementRef.current) {
      const scrollAmount = 320;
      elementRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const homeRef = useRef<HTMLDivElement>(null);
  const electronicsRef = useRef<HTMLDivElement>(null);
  const computersRef = useRef<HTMLDivElement>(null);
  const businessRef = useRef<HTMLDivElement>(null);

  const CategorySection = ({ 
    title, 
    deals, 
    scrollRef, 
    categoryKey 
  }: { 
    title: string; 
    deals: DealWithRelations[]; 
    scrollRef: React.RefObject<HTMLDivElement>;
    categoryKey: string;
  }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900" data-testid={`title-${categoryKey}`}>
          {title}
        </h2>
        <a 
          href="#" 
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          data-testid={`link-view-all-${categoryKey}`}
        >
          View All ({deals.length})
        </a>
      </div>

      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll(scrollRef, 'left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50 transition-colors"
          data-testid={`button-${categoryKey}-prev`}
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        {/* Right Arrow */}
        <button
          onClick={() => scroll(scrollRef, 'right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg border hover:bg-gray-50 transition-colors"
          data-testid={`button-${categoryKey}-next`}
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* Product Grid */}
        <div 
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 px-8 scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {dealsLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-none w-72">
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-6 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            deals.map((deal, index) => {
              const discount = calculateDiscount(deal.originalPrice, deal.salePrice);
              const hasDiscount = discount > 0;
              
              return (
                <a 
                  href={`/deal/${deal.id}`} 
                  key={deal.id} 
                  className="flex-none w-72 bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow"
                  data-testid={`card-deal-${categoryKey}-${index}`}
                >
                  <div className="relative">
                    <img 
                      src={deal.imageUrl || ''} 
                      alt={deal.title}
                      className="w-full h-48 object-cover"
                      data-testid={`img-deal-${categoryKey}-${index}`}
                    />
                    <div className="absolute top-2 right-2">
                      <HeartButton dealId={deal.id} className="bg-white/80 hover:bg-white" />
                    </div>
                    {hasDiscount && (
                      <div className="absolute top-2 left-2">
                        <Badge className="bg-red-600 text-white text-xs font-semibold">
                          Sale
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem]" data-testid={`title-deal-${categoryKey}-${index}`}>
                      {deal.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      {deal.salePrice && (
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(deal.salePrice)}
                        </span>
                      )}
                      {deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice && (
                        <>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(deal.originalPrice)}
                          </span>
                          <span className="text-sm text-green-600 font-medium">
                            Save {discount}%
                          </span>
                        </>
                      )}
                    </div>

                    {deal.store?.name && (
                      <p className="text-xs text-gray-600 mb-2">
                        {deal.store.name}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {deal.freeShipping && (
                        <Badge variant="secondary" className="text-xs">
                          Free Shipping
                        </Badge>
                      )}
                      {deal.rating && (
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-600">{deal.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>
    </section>
  );

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
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold" data-testid="title-store44">
                {siteSettings?.siteName}
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="hover:text-blue-200 transition-colors">Home</a>
                {Array.isArray(visiblePages) && visiblePages.map((page) => (
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
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-store44">
            {siteSettings?.siteName || 'NetDiscount'} Deals
          </h1>
          <p className="text-gray-600">
            Discover great deals across all categories
          </p>
        </div>

        {/* Category Sections */}
        {Object.entries(categoryInfo).map(([key, { displayName, deals }]) => {
          if (deals.length === 0) return null;
          
          const refs = {
            'Lifestyle & Home': homeRef,
            'Electronics': electronicsRef,
            'Computers': computersRef,
            'Small Business': businessRef,
          };
          
          return (
            <CategorySection
              key={key}
              title={displayName}
              deals={deals}
              scrollRef={refs[key as keyof typeof refs] || homeRef}
              categoryKey={key.toLowerCase().replace(/[^a-z0-9]/g, '-')}
            />
          );
        })}

        {dealsLoading && (
          <div className="text-center py-8">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
              Loading deals...
            </div>
          </div>
        )}

        {!dealsLoading && Object.values(categoryInfo).every(cat => cat.deals.length === 0) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No deals available</h3>
            <p className="text-gray-600">Check back later for new deals!</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}