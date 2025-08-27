import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import StoreCard from "@/components/store-card";
import Breadcrumb from "@/components/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { api } from "@/lib/api";
import type { Store, SiteSettings, BannerSettings } from "@shared/schema";

export default function Stores() {
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  
  // Fetch all stores or featured stores for initial display
  const { 
    data: featuredStores = [], 
    isLoading: featuredLoading, 
    error: featuredError 
  } = useQuery<Store[]>({
    queryKey: ["/api/stores/featured"],
    queryFn: () => api.getFeaturedStores(),
  });

  // Fetch stores by letter when a letter is selected
  const { 
    data: letterStores = [], 
    isLoading: letterLoading, 
    error: letterError 
  } = useQuery<Store[]>({
    queryKey: ["/api/stores/letter", selectedLetter],
    queryFn: () => api.getStoresByLetter(selectedLetter!),
    enabled: !!selectedLetter,
  });

  // Fetch site settings for dynamic site name
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return response.json();
    },
  });

  // Fetch visible pages for navigation
  const { data: visiblePages = [] } = useQuery<BannerSettings[]>({
    queryKey: ["/api/visible-pages"],
    queryFn: async () => {
      const response = await fetch("/api/visible-pages");
      return response.json();
    },
  });

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const numbers = '0-9';
  const allLetters = [...alphabet, numbers];

  const breadcrumbItems = [
    { label: "Stores" }
  ];

  const currentStores = selectedLetter ? letterStores : featuredStores;
  const isLoading = selectedLetter ? letterLoading : featuredLoading;
  const error = selectedLetter ? letterError : featuredError;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with blue banner matching Store33 style */}
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
                <h1 className="text-2xl font-bold" data-testid="title-stores">
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
      </div>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Popular Stores Section */}
            {!selectedLetter && (
              <section className="mb-12">
                
                {error && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      Failed to load stores. Please try refreshing the page.
                    </AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                        <Skeleton className="w-20 h-12 mx-auto mb-4" />
                        <Skeleton className="h-5 w-24 mx-auto" />
                      </div>
                    ))}
                  </div>
                ) : currentStores.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentStores.map((store) => (
                      <StoreCard key={store.id} store={store} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No stores available at the moment.</p>
                    <Button onClick={() => window.location.reload()}>
                      Refresh Page
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Stores by Letter Section */}
            <section>
              <h2 className="text-2xl font-bold text-net-dark mb-6">Stores by Letter</h2>
              
              {/* Alphabetical Navigation */}
              <div className="flex flex-wrap gap-2 mb-8 pb-4 border-b border-gray-200">
                <Button
                  variant={selectedLetter === null ? "default" : "outline"}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setSelectedLetter(null)}
                  data-testid="letter-all"
                >
                  All
                </Button>
                {allLetters.map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0 text-net-green hover:bg-net-green hover:text-white"
                    onClick={() => setSelectedLetter(letter)}
                    data-testid={`letter-${letter.toLowerCase()}`}
                  >
                    {letter}
                  </Button>
                ))}
              </div>

              {/* Selected Letter Stores */}
              {selectedLetter && (
                <div>
                  <h3 className="text-xl font-semibold text-net-dark mb-4">
                    Stores starting with "{selectedLetter}"
                  </h3>

                  {error && (
                    <Alert className="mb-6">
                      <AlertDescription>
                        Failed to load stores for letter {selectedLetter}. Please try again.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                          <Skeleton className="w-20 h-12 mx-auto mb-4" />
                          <Skeleton className="h-5 w-24 mx-auto" />
                        </div>
                      ))}
                    </div>
                  ) : currentStores.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentStores.map((store) => (
                        <StoreCard key={store.id} store={store} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-600 mb-4">
                        No stores found starting with "{selectedLetter}".
                      </p>
                      <Button onClick={() => setSelectedLetter(null)}>
                        View All Stores
                      </Button>
                    </div>
                  )}
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
