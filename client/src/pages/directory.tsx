import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Search, MapPin, Star, Clock, Phone, Globe, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AdvertisementBanner from '@/components/advertisement-banner';
import { usePageTracking } from '@/hooks/use-page-tracking';

import type { BusinessCategory, BusinessWithCategory, BusinessWithDetails } from '@shared/schema';

export default function Directory() {
  // Track page view for analytics
  usePageTracking("Directory", "/directory");
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');


  // Fetch business categories
  const { data: categories } = useQuery<BusinessCategory[]>({
    queryKey: ['/api/business-categories'],
  });

  // Fetch businesses
  const { data: businesses, isLoading } = useQuery<BusinessWithCategory[]>({
    queryKey: ['/api/businesses', searchQuery, selectedCategory],
  });

  // Fetch featured businesses
  const { data: featuredBusinesses } = useQuery<BusinessWithCategory[]>({
    queryKey: ['/api/businesses', 'featured'],
    queryFn: () => fetch('/api/businesses?featured=true').then(res => res.json()),
  });

  const filteredBusinesses = businesses?.filter(business => {
    const matchesSearch = searchQuery === '' || 
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || 
      business.businessCategoryId === selectedCategory;

    const matchesTab = activeTab === 'all' ||
      (activeTab === 'open' && business.isOpenNow) ||
      (activeTab === 'featured' && business.isFeatured);

    return matchesSearch && matchesCategory && matchesTab;
  }) || [];

  const renderBusinessCard = (business: BusinessWithCategory) => (
    <Card key={business.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <img
              src={business.imageUrl || '/placeholder-business.jpg'}
              alt={business.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Link href={`/directory/${business.id}`}>
                  <h3 
                    className="text-lg font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
                    data-testid={`link-business-${business.id}`}
                  >
                    {business.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{business.rating}</span>
                    <span className="text-sm text-gray-500">({business.reviewCount} reviews)</span>
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

                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{business.address}</span>
                  </div>
                  
                  {business.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span>{business.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2">
                {business.isOpenNow && (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>Open now</span>
                  </div>
                )}
                
                {business.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Featured
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
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
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Business Directory
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Discover local businesses, read reviews, and find exactly what you're looking for in your area.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search businesses, services, or categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
              setActiveTab('all');
            }}
            data-testid="button-clear-filters"
          >
            Clear Filters
          </Button>
        </div>

        {/* Category Pills */}
        {categories && categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              data-testid="button-category-all"
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                data-testid={`button-category-${category.id}`}
              >
                {category.name}
              </Button>
            ))}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all" data-testid="tab-all">All Businesses</TabsTrigger>
            <TabsTrigger value="open" data-testid="tab-open">Open Now</TabsTrigger>
            <TabsTrigger value="featured" data-testid="tab-featured">Featured</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Featured Businesses Section */}
      {activeTab === 'all' && featuredBusinesses && featuredBusinesses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Featured Businesses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredBusinesses.slice(0, 3).map((business) => (
              <Card key={business.id} className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={business.imageUrl || '/placeholder-business.jpg'}
                    alt={business.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <Badge className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 border-yellow-300">
                    Featured
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <Link href={`/directory/${business.id}`}>
                    <h3 
                      className="font-semibold text-blue-600 hover:text-blue-800 cursor-pointer mb-2"
                      data-testid={`link-featured-business-${business.id}`}
                    >
                      {business.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{business.rating}</span>
                    <span className="text-sm text-gray-500">({business.reviewCount})</span>
                  </div>

                  {business.category && (
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {business.category.name}
                    </Badge>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {business.description}
                  </p>

                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{business.address}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Separator className="mt-8" />
        </div>
      )}

      {/* Results Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {activeTab === 'all' && 'All Businesses'}
            {activeTab === 'open' && 'Open Now'}
            {activeTab === 'featured' && 'Featured Businesses'}
          </h2>
          <span className="text-gray-500" data-testid="text-results-count">
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
                setSelectedCategory(null);
                setActiveTab('all');
              }}
              data-testid="button-reset-search"
            >
              Show All Businesses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBusinesses.map(renderBusinessCard)}
        </div>
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