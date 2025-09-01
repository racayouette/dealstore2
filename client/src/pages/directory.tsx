import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, MapPin, Star, Clock, Phone, Globe, ChevronRight, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Footer from '@/components/footer';
import AdvertisementBanner from '@/components/advertisement-banner';
import { usePageTracking } from '@/hooks/use-page-tracking';

import type { BusinessWithCategory } from '@shared/schema';
import { useSiteSettings } from '@/hooks/use-site-settings';
import UserMenu from '@/components/user-menu';
import NavMenu from '@/components/nav-menu';

export default function Directory() {
  // Track page view for analytics
  usePageTracking("Directory", "/directory");
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const businessesPerPage = 6;

  // Function to get map link based on device/platform
  const getMapLink = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const userAgent = navigator.userAgent.toLowerCase();
    const isDesktop = window.innerWidth >= 1024; // lg breakpoint
    
    // Check if it's an iPhone
    if (/iphone|ipod/.test(userAgent) && !isDesktop) {
      return `maps://maps.apple.com/?q=${encodedAddress}`;
    }
    
    // Check if it's Android
    if (/android/.test(userAgent) && !isDesktop) {
      return `https://maps.google.com/?q=${encodedAddress}`;
    }
    
    // Desktop - default to Google Maps (could add MapQuest option)
    if (isDesktop) {
      return `https://maps.google.com/?q=${encodedAddress}`;
    }
    
    // Fallback to Google Maps
    return `https://maps.google.com/?q=${encodedAddress}`;
  };


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

  // Fetch businesses with search
  const { data: businesses, isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ['/api/businesses', searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      params.append('limit', '100'); // Increase limit to get more results for search
      
      const response = await fetch(`/api/businesses?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch businesses');
      return response.json();
    },
  });

  // Use the businesses directly since server handles the search
  const filteredBusinesses = businesses || [];

  const renderBusinessCard = (business: BusinessWithCategory) => (
    <Card key={business.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4 md:p-6">
        <div className="flex gap-3 md:gap-4">
          <div className="flex-shrink-0">
            {business.website ? (
              <a 
                href={business.website} 
                target="_blank" 
                rel="noopener noreferrer"
                data-testid={`link-business-image-${business.id}`}
              >
                <img
                  src={business.imageUrl || '/placeholder-business.jpg'}
                  alt={business.name}
                  className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>
            ) : (
              <img
                src={business.imageUrl || '/placeholder-business.jpg'}
                alt={business.name}
                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
              />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {business.website ? (
                  <a 
                    href={business.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-base md:text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    data-testid={`link-business-website-${business.id}`}
                  >
                    {business.name}
                  </a>
                ) : (
                  <h3 
                    className="text-base md:text-lg font-semibold text-gray-900"
                    data-testid={`text-business-${business.id}`}
                  >
                    {business.name}
                  </h3>
                )}
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs md:text-sm font-medium">{business.rating}</span>
                    <span className="text-xs md:text-sm text-gray-500">({business.reviewCount} reviews)</span>
                  </div>
                  
                  {business.priceRange && (
                    <Badge variant="outline" className="text-xs">
                      {business.priceRange}
                    </Badge>
                  )}
                </div>

                {business.category && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {business.category.name}
                  </Badge>
                )}

                {business.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {business.description}
                  </p>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs md:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                    <a 
                      href={getMapLink(business.address)}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer break-words"
                      data-testid={`link-address-${business.id}`}
                    >
                      {business.address}
                    </a>
                  </div>
                  
                  {business.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      {window.innerWidth < 1024 ? ( // Mobile - make clickable
                        <a 
                          href={`tel:${business.phone}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                          data-testid={`link-phone-${business.id}`}
                        >
                          {business.phone}
                        </a>
                      ) : ( // Desktop - plain text
                        <span>{business.phone}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Removed Open now and Featured badges */}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
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
<NavMenu />
      
      {/* Header Banner Advertisement */}
      <div className="w-full">
        <AdvertisementBanner position="header" size="medium" className="rounded-none" />
      </div>

      {/* Top Banner Advertisement */}
      <div className="container mx-auto px-4 mb-6">
        <AdvertisementBanner position="top" size="medium" />
      </div>

      {/* Main Layout with Sidebars */}
      <div className="container mx-auto px-4 pb-6">
        <div className="flex gap-6">
          {/* Left Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
          Business Directory
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Discover local businesses, read reviews, and find exactly what you're looking for in your area.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              placeholder="Search businesses, services, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm md:text-base"
              data-testid="input-search"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="md:size-default"
            onClick={() => {
              setSearchQuery('');
            }}
            data-testid="button-clear-search"
          >
            Clear Search
          </Button>
        </div>

        {/* Removed Category Pills and Tabs */}
      </div>

      {/* Removed Featured Businesses Section */}

      {/* Results Section */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900">
            All Businesses
          </h2>
          <span className="text-sm md:text-base text-gray-500" data-testid="text-results-count">
            {filteredBusinesses.length} results
          </span>
        </div>
      </div>

      {/* Business Listings */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredBusinesses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">No businesses found</h3>
              <p className="text-sm">Try adjusting your search criteria or browse all categories.</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
              }}
              data-testid="button-reset-search"
            >
              Show All Businesses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {filteredBusinesses.slice((currentPage - 1) * businessesPerPage, currentPage * businessesPerPage).map(renderBusinessCard)}
          </div>
          
          {/* Pagination Controls */}
          {filteredBusinesses.length > businessesPerPage && (
            <Pagination className="mt-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                <PaginationItem>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {Math.ceil(filteredBusinesses.length / businessesPerPage)} ({filteredBusinesses.length} total businesses)
                  </span>
                </PaginationItem>
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => {
                      if (currentPage < Math.ceil(filteredBusinesses.length / businessesPerPage)) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === Math.ceil(filteredBusinesses.length / businessesPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Load More Button (if needed) */}
      {filteredBusinesses.length > 0 && filteredBusinesses.length >= 20 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" data-testid="button-load-more">
            Load More Results
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
          </div>

          {/* Right Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="right" size="medium" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner Advertisement */}
      <div className="container mx-auto px-4 pb-6">
        <AdvertisementBanner position="bottom" size="medium" />
      </div>
      
      <Footer />
    </div>
  );
}