import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { DealWithRelations } from "@shared/schema";

export default function SearchPage() {
  const [location, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");

  // Parse search query from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const query = urlParams.get('q') || '';
    setSearchQuery(query);
    setCurrentQuery(query);
  }, [location]);

  // Fetch search results
  const { 
    data: searchResults = [], 
    isLoading, 
    error 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/search", currentQuery],
    queryFn: () => api.searchDeals(currentQuery, 50),
    enabled: !!currentQuery.trim(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newQuery = searchQuery.trim();
      setCurrentQuery(newQuery);
      navigate(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  const breadcrumbItems = [
    { label: `Search Results` }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-2">
          <p className="text-sm text-gray-600">
            Techbargains.com is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.
            <a href="#" className="text-tech-blue hover:underline ml-1">Learn More</a>
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Search Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-tech-dark mb-4">
                {currentQuery ? `Search Results for "${currentQuery}"` : 'Search Deals'}
              </h1>
              
              {/* Search Form */}
              <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl">
                <Input
                  type="text"
                  placeholder="Search for deals, products, or stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  data-testid="input-search-page"
                />
                <Button 
                  type="submit"
                  className="bg-tech-blue hover:bg-tech-blue-dark"
                  data-testid="button-search-page"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>

            {/* Search Results */}
            {currentQuery && (
              <section>
                {error && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      Failed to load search results. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <Skeleton className="h-6 w-48" />
                    </div>
                    {[1, 2, 3, 4, 5].map(i => (
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
                ) : searchResults.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-tech-dark">
                        Found {searchResults.length} deal{searchResults.length !== 1 ? 's' : ''}
                      </h2>
                    </div>
                    <div className="space-y-4">
                      {searchResults.map((deal) => (
                        <DealCard key={deal.id} deal={deal} />
                      ))}
                    </div>
                  </>
                ) : currentQuery.trim() ? (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No deals found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any deals matching "{currentQuery}". Try searching with different keywords or browse our categories.
                      </p>
                      <div className="space-y-3">
                        <Button 
                          onClick={() => {
                            setSearchQuery("");
                            setCurrentQuery("");
                            navigate("/");
                          }}
                          variant="outline"
                        >
                          Browse All Deals
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>
            )}

            {/* Search Tips */}
            {!currentQuery && (
              <section className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-bold text-tech-dark mb-4">Search Tips</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Popular Searches</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Laptop deals</li>
                      <li>• Gaming desktop</li>
                      <li>• iPhone accessories</li>
                      <li>• Smart home devices</li>
                      <li>• Headphones</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Search by Store</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Amazon deals</li>
                      <li>• Dell computers</li>
                      <li>• HP printers</li>
                      <li>• Microsoft Surface</li>
                      <li>• Lenovo laptops</li>
                    </ul>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-80 space-y-8">
            {/* Search Categories */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-tech-dark mb-4">Browse by Category</h3>
              <div className="space-y-2">
                <a href="/category/computers" className="block text-tech-blue hover:underline text-sm">
                  Computers & Laptops
                </a>
                <a href="/category/electronics" className="block text-tech-blue hover:underline text-sm">
                  Electronics & Gadgets
                </a>
                <a href="/category/lifestyle-home" className="block text-tech-blue hover:underline text-sm">
                  Home & Lifestyle
                </a>
                <a href="/category/small-business" className="block text-tech-blue hover:underline text-sm">
                  Business Solutions
                </a>
              </div>
            </div>

            {/* Popular Stores */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-tech-dark mb-4">Popular Stores</h3>
              <div className="space-y-2">
                <a href="/stores/amazon" className="block text-tech-blue hover:underline text-sm">
                  Amazon
                </a>
                <a href="/stores/dell" className="block text-tech-blue hover:underline text-sm">
                  Dell
                </a>
                <a href="/stores/hp" className="block text-tech-blue hover:underline text-sm">
                  HP
                </a>
                <a href="/stores/microsoft" className="block text-tech-blue hover:underline text-sm">
                  Microsoft
                </a>
                <a href="/stores" className="block text-tech-blue hover:underline text-sm font-medium">
                  View All Stores →
                </a>
              </div>
            </div>

            {/* Search Stats */}
            {currentQuery && searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-bold text-tech-dark mb-4">Search Results</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Results:</span>
                    <span className="text-sm font-medium">{searchResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Query:</span>
                    <span className="text-sm font-medium">"{currentQuery}"</span>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
