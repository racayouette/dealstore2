import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import Footer from "@/components/footer";
import DealCard from "@/components/deal-card";
import StoreCard from "@/components/store-card";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { DealWithRelations, Store, BannerSettings } from "@shared/schema";
import { usePageTracking } from "@/hooks/use-page-tracking";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { JustInTimeLayout } from "@/components/just-in-time-layout";

export default function Home() {
  // Track page view for analytics
  usePageTracking("Home", "/");
  
  const { toast } = useToast();

  // Fetch featured deals
  const { 
    data: featuredDeals = [], 
    isLoading: dealsLoading, 
    error: dealsError 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/featured"],
    queryFn: () => api.getFeaturedDeals(6),
  });

  // Fetch featured stores
  const { 
    data: featuredStores = [], 
    isLoading: storesLoading, 
    error: storesError 
  } = useQuery<Store[]>({
    queryKey: ["/api/stores/featured"],
    queryFn: () => api.getFeaturedStores(),
  });

  // Fetch site settings from global cache
  const { data: siteSettings } = useSiteSettings();

  // Fetch visible pages for navigation
  const { data: visiblePages = [] } = useQuery<BannerSettings[]>({
    queryKey: ["/api/visible-pages"],
    queryFn: async () => {
      const response = await fetch("/api/visible-pages");
      return response.json();
    },
  });

  // Auto-seed database on first load if no data
  const { mutate: seedDatabase } = useMutation({
    mutationFn: () => api.seedDatabase(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals/featured"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stores/featured"] });
      toast({
        title: "Database seeded successfully",
        description: "Sample data has been loaded",
      });
    },
  });

  useEffect(() => {
    // If no featured deals and not loading, try to seed the database
    if (!dealsLoading && featuredDeals.length === 0 && !dealsError) {
      seedDatabase();
    }
  }, [dealsLoading, featuredDeals.length, dealsError, seedDatabase]);

  const breadcrumbItems = [
    { label: "Home" }
  ];

  return (
    <JustInTimeLayout pageTitle="home">

      <main className="container mx-auto px-4 py-4 md:py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <h1 className="text-xl md:text-3xl font-bold text-net-dark mb-4 md:mb-6">Featured Net Deals</h1>

        {/* Error States */}
        {dealsError && (
          <Alert className="mb-6">
            <AlertDescription>
              Failed to load featured deals. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {storesError && (
          <Alert className="mb-6">
            <AlertDescription>
              Failed to load featured stores. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Featured Ad Banner - Static placeholder */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-1">
              <div className="bg-white rounded-lg p-6 flex items-center space-x-6 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200" 
                  alt="ULTRALOQ Bolt Fingerprint Smart Lock" 
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-net-dark mb-2">
                    ULTRALOQ Bolt Fingerprint Smart Lock, Works with Apple HomeKit
                  </h3>
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex text-yellow-400">
                      {[1, 2, 3, 4].map(i => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                      <span className="text-gray-300">☆</span>
                    </div>
                    <span className="text-sm text-gray-600">3,583</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-red-600">$159.99</span>
                    <span className="text-lg text-gray-500 line-through">$199.99</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Deals Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-net-dark mb-6">Featured Deals</h2>
              
              {dealsLoading ? (
                <div className="space-y-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
                      <div className="flex gap-6">
                        <Skeleton className="w-32 h-24 rounded-lg" />
                        <div className="flex-1 space-y-3">
                          <Skeleton className="h-6 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-10 w-32" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : featuredDeals.length > 0 ? (
                <div className="space-y-4">
                  {featuredDeals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} featured />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No featured deals available at the moment.</p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              )}
            </section>

            {/* Popular Stores Section */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-net-dark mb-6">Popular Stores</h2>
              
              {storesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                      <Skeleton className="w-20 h-12 mx-auto mb-4" />
                      <Skeleton className="h-5 w-24 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : featuredStores.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredStores.map((store) => (
                    <StoreCard key={store.id} store={store} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">No featured stores available at the moment.</p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="w-80 space-y-8">
            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-net-dark mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/category/computers" className="block text-net-green hover:underline text-sm">
                  Laptop Deals
                </a>
                <a href="/category/computers" className="block text-net-green hover:underline text-sm">
                  Desktop Deals
                </a>
                <a href="/category/electronics" className="block text-net-green hover:underline text-sm">
                  Electronics Deals
                </a>
                <a href="/category/computers" className="block text-net-green hover:underline text-sm">
                  Gaming Deals
                </a>
                <a href="/category/computers" className="block text-net-green hover:underline text-sm">
                  Computer Accessories
                </a>
              </div>
            </div>

            {/* Featured Computer Stores */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-net-dark mb-4">Featured Computer Stores</h3>
              
              <div className="space-y-4">
                {featuredStores.slice(0, 3).map((store) => (
                  <div key={store.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <img 
                      src={store.logoUrl || 'https://images.unsplash.com/photo-1633419461186-7d40a38105ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=120&h=60'} 
                      alt={store.name} 
                      className="w-16 h-10 object-contain"
                    />
                    <div className="ml-3">
                      <h4 className="font-medium text-net-dark">{store.name}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </JustInTimeLayout>
  );
}
