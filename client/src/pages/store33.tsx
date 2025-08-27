import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { usePageTracking } from "@/hooks/use-page-tracking";
import type { DealWithRelations } from "@shared/schema";
import { HeartButton } from "@/components/HeartButton";

interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  affiliateDisclosure: string;
}

export default function Store33() {
  // Track page view for analytics
  usePageTracking("Store33", "/store33");
  
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [freeShippingOnly, setFreeShippingOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [minDiscount, setMinDiscount] = useState(0);

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
                <h1 className="text-2xl font-bold" data-testid="title-store33">
                  {siteSettings?.siteName || 'NETDISCOUNT'} <span className="text-blue-200">DEALS</span>
                </h1>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="#" className="hover:text-blue-200 transition-colors">Categories</a>
                  <a href="#" className="hover:text-blue-200 transition-colors">Stores</a>
                  <a href="#" className="hover:text-blue-200 transition-colors">Coupons</a>
                  <a href="#" className="hover:text-blue-200 transition-colors">Shopping Guide</a>
                  <a href="#" className="hover:text-blue-200 transition-colors">Today's Deals</a>
                </nav>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
                  Log in or Sign Up
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {uniqueStores.slice(0, 6).map((store) => (
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
                    onValueChange={setPriceRange}
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
                    onValueChange={(value) => setMinDiscount(value[0])}
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
                    onCheckedChange={(checked) => setFreeShippingOnly(checked === true)}
                  />
                  <label htmlFor="free-shipping" className="text-sm text-gray-700 cursor-pointer">
                    Free Shipping
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured-only"
                    checked={featuredOnly}
                    onCheckedChange={(checked) => setFeaturedOnly(checked === true)}
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
            
            {/* Navigation arrows */}
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 bg-white shadow-lg"
              data-testid="button-featured-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 bg-white shadow-lg"
              data-testid="button-featured-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
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
              filteredDeals.map((deal, index) => {
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
        </section>
            </div>
          </div>
      </main>

      <Footer />
    </div>
  );
}