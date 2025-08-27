import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, ChevronDown, User } from "lucide-react";
import { usePageTracking } from "@/hooks/use-page-tracking";
import type { DealWithRelations, BannerSettings } from "@shared/schema";
import { HeartButton } from "@/components/HeartButton";
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
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Check if current page exists in banner settings
  const { data: pageSettings, isLoading: pageLoading, error: pageError } = useQuery<BannerSettings>({
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
  });

  // Fetch all deals
  const { 
    data: allDeals = [], 
    isLoading: allDealsLoading 
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

  // Extract unique categories and stores from deals
  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    [...featuredDeals, ...allDeals].forEach(deal => {
      if (deal.category?.name) categories.add(deal.category.name);
    });
    return Array.from(categories).sort();
  }, [featuredDeals, allDeals]);

  const uniqueStores = useMemo(() => {
    const stores = new Set<string>();
    [...featuredDeals, ...allDeals].forEach(deal => {
      if (deal.store?.name) stores.add(deal.store.name);
    });
    return Array.from(stores).sort();
  }, [featuredDeals, allDeals]);

  // Filter deals based on selected filters
  const filteredDeals = useMemo(() => {
    let filtered = [...allDeals];
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(deal => 
        deal.category?.name && selectedCategories.includes(deal.category.name)
      );
    }
    
    if (selectedStores.length > 0) {
      filtered = filtered.filter(deal => 
        deal.store?.name && selectedStores.includes(deal.store.name)
      );
    }
    
    if (freeShippingOnly) {
      filtered = filtered.filter(deal => deal.freeShipping);
    }
    
    if (featuredOnly) {
      filtered = filtered.filter(deal => deal.isFeatured);
    }
    
    // Price filter
    filtered = filtered.filter(deal => {
      const price = parseFloat(deal.salePrice);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Discount filter
    if (minDiscount > 0) {
      filtered = filtered.filter(deal => {
        const discount = calculateDiscount(deal.originalPrice, deal.salePrice);
        return discount >= minDiscount;
      });
    }
    
    return filtered;
  }, [allDeals, selectedCategories, selectedStores, priceRange, freeShippingOnly, featuredOnly, minDiscount]);

  // Paginated deals (apply pagination to filtered results)
  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDeals.slice(startIndex, endIndex);
  }, [filteredDeals, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);

  // Reset to first page when filters change
  const resetPagination = () => {
    setCurrentPage(1);
  };

  const filteredFeaturedDeals = useMemo(() => {
    let filtered = [...featuredDeals];
    
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(deal => 
        deal.category?.name && selectedCategories.includes(deal.category.name)
      );
    }
    
    if (selectedStores.length > 0) {
      filtered = filtered.filter(deal => 
        deal.store?.name && selectedStores.includes(deal.store.name)
      );
    }
    
    if (freeShippingOnly) {
      filtered = filtered.filter(deal => deal.freeShipping);
    }
    
    // Price filter
    filtered = filtered.filter(deal => {
      const price = parseFloat(deal.salePrice);
      return price >= priceRange[0] && price <= priceRange[1];
    });
    
    // Discount filter
    if (minDiscount > 0) {
      filtered = filtered.filter(deal => {
        const discount = calculateDiscount(deal.originalPrice, deal.salePrice);
        return discount >= minDiscount;
      });
    }
    
    return filtered;
  }, [featuredDeals, selectedCategories, selectedStores, priceRange, freeShippingOnly, minDiscount]);

  // If page is not found in banner settings, show 404
  if (!pageLoading && (pageError || !pageSettings)) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Store33/Brad's Deals styling */}
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
                  {siteSettings?.siteName} <span className="text-blue-200">DEALS</span>
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

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-8">
          {/* Left Filter Panel */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Categories Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {uniqueCategories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories([...selectedCategories, category]);
                          } else {
                            setSelectedCategories(selectedCategories.filter(c => c !== category));
                          }
                          resetPagination();
                        }}
                      />
                      <label htmlFor={`category-${category}`} className="text-sm text-gray-700 cursor-pointer">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stores Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Stores</h4>
                <div className="space-y-2">
                  {uniqueStores.map((store) => (
                    <div key={store} className="flex items-center space-x-2">
                      <Checkbox
                        id={`store-${store}`}
                        checked={selectedStores.includes(store)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedStores([...selectedStores, store]);
                          } else {
                            setSelectedStores(selectedStores.filter(s => s !== store));
                          }
                          resetPagination();
                        }}
                      />
                      <label htmlFor={`store-${store}`} className="text-sm text-gray-700 cursor-pointer">
                        {store}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={(value) => {
                      setPriceRange(value);
                      resetPagination();
                    }}
                    max={1000}
                    min={0}
                    step={10}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}+</span>
                  </div>
                </div>
              </div>

              {/* Discount Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Min Discount</h4>
                <div className="px-2">
                  <Slider
                    value={[minDiscount]}
                    onValueChange={(value) => {
                      setMinDiscount(value[0]);
                      resetPagination();
                    }}
                    max={80}
                    min={0}
                    step={5}
                    className="mb-2"
                  />
                  <div className="text-sm text-gray-600 text-center">
                    {minDiscount}%+
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="free-shipping"
                    checked={freeShippingOnly}
                    onCheckedChange={(checked) => {
                      setFreeShippingOnly(checked === true);
                      resetPagination();
                    }}
                  />
                  <label htmlFor="free-shipping" className="text-sm text-gray-700 cursor-pointer">
                    Free Shipping
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-only"
                    checked={featuredOnly}
                    onCheckedChange={(checked) => {
                      setFeaturedOnly(checked === true);
                      resetPagination();
                    }}
                  />
                  <label htmlFor="featured-only" className="text-sm text-gray-700 cursor-pointer">
                    Featured Deals Only
                  </label>
                </div>
              </div>

              {/* Clear Filters */}
              <Button
                variant="outline"
                className="w-full mt-6"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedStores([]);
                  setPriceRange([0, 1000]);
                  setFreeShippingOnly(false);
                  setFeaturedOnly(false);
                  setMinDiscount(0);
                  resetPagination();
                }}
              >
                Clear All Filters
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
        {/* Featured Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-featured">Featured</h2>
          
          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {dealsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex-none w-64">
                    <Skeleton className="w-full h-48 rounded-lg mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : (
                filteredFeaturedDeals.slice(0, 5).map((deal, index) => (
                  <a href={`/deal/${deal.id}`} key={deal.id} className="flex-none w-64 bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img 
                        src={deal.imageUrl || ''} 
                        alt={deal.title}
                        className="w-full h-40 object-cover"
                        data-testid={`img-featured-deal-${index}`}
                      />
                      <div className="absolute top-2 right-2">
                        <HeartButton dealId={deal.id} className="bg-white/80 hover:bg-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2" data-testid={`title-featured-deal-${index}`}>
                        {deal.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {deal.salePrice && (
                          <span className="text-lg font-bold text-red-600">
                            {formatPrice(deal.salePrice)}
                          </span>
                        )}
                        {deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(deal.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </section>

        {/* All Deals Section */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="title-all-deals">All Deals</h2>
          </div>

          {/* Deals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allDealsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
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
              paginatedDeals.map((deal, index) => {
                const discount = calculateDiscount(deal.originalPrice, deal.salePrice);
                const isExclusive = index % 3 === 0; // Make every 3rd deal "exclusive" for demo
                
                return (
                  <a href={`/deal/${deal.id}`} key={deal.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img 
                        src={deal.imageUrl || ''} 
                        alt={deal.title}
                        className="w-full h-48 object-cover"
                        data-testid={`img-deal-${index}`}
                      />
                      
                      {isExclusive && (
                        <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                          Exclusive
                        </Badge>
                      )}
                      
                      <div className="absolute top-2 right-2">
                        <HeartButton dealId={deal.id} className="bg-white/80 hover:bg-white" />
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2" data-testid={`title-deal-${index}`}>
                        {deal.title}
                      </h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {deal.salePrice && (
                            <span className="text-lg font-bold text-red-600">
                              {formatPrice(deal.salePrice)}
                            </span>
                          )}
                          {deal.originalPrice && deal.salePrice && deal.originalPrice > deal.salePrice && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(deal.originalPrice)}
                            </span>
                          )}
                        </div>
                        
                        {discount > 0 && (
                          <Badge variant="secondary" className="text-green-700 bg-green-100">
                            {discount}% off
                          </Badge>
                        )}
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        {deal.store?.name}
                      </div>
                    </div>
                  </a>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current page
                  const showPage = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 2;
                  const showEllipsis = (page === 2 && currentPage > 4) || (page === totalPages - 1 && currentPage < totalPages - 3);
                  
                  if (showEllipsis) {
                    return <span key={page} className="px-2 text-gray-500">...</span>;
                  }
                  
                  if (!showPage) {
                    return null;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      data-testid={`button-page-${page}`}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Show results count */}
          <div className="text-sm text-gray-600 text-center mt-6">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredDeals.length)} of {filteredDeals.length} deals
          </div>

          {/* No results message */}
          {!allDealsLoading && filteredDeals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No deals found matching your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSelectedCategories([]);
                  setSelectedStores([]);
                  setPriceRange([0, 1000]);
                  setFreeShippingOnly(false);
                  setFeaturedOnly(false);
                  setMinDiscount(0);
                  resetPagination();
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </section>
      </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}