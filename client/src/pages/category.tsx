import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { api } from "@/lib/api";
import type { Category, DealWithRelations, SiteSettings } from "@shared/schema";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [currentPage, setCurrentPage] = useState(1);
  const dealsPerPage = 6;

  // Fetch category details
  const { 
    data: category, 
    isLoading: categoryLoading, 
    error: categoryError 
  } = useQuery<Category>({
    queryKey: ["/api/categories", slug],
    queryFn: () => api.getCategoryBySlug(slug!),
    enabled: !!slug,
  });

  // Fetch deals for this category
  const { 
    data: deals = [], 
    isLoading: dealsLoading, 
    error: dealsError 
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/category", slug],
    queryFn: () => api.getDealsByCategory(slug!, 20),
    enabled: !!slug,
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

  const breadcrumbItems = [
    { label: category?.name || "Category" }
  ];

  if (categoryError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Alert>
            <AlertDescription>
              Category not found or failed to load. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-2">
          <p className="text-sm text-gray-600">
            {siteSettings?.siteName || 'NetDiscount'} is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4 md:py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {categoryLoading ? (
          <Skeleton className="h-6 md:h-8 w-48 md:w-64 mb-4 md:mb-6" />
        ) : (
          <h1 className="text-xl md:text-3xl font-bold text-net-dark mb-4 md:mb-6" data-testid={`title-category-${slug}`}>
            {category?.name} Deals
          </h1>
        )}

        {category?.description && (
          <p className="text-gray-600 mb-8 text-lg" data-testid={`description-category-${slug}`}>
            {category.description}
          </p>
        )}

        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Deals Section */}
            <section>
              {dealsError && (
                <Alert className="mb-6">
                  <AlertDescription>
                    Failed to load deals for this category. Please try refreshing the page.
                  </AlertDescription>
                </Alert>
              )}

              {dealsLoading ? (
                <div className="space-y-6">
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
              ) : deals.length > 0 ? (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-net-dark mb-6">
                    Latest {category?.name} Deals
                  </h2>
                  {deals.slice((currentPage - 1) * dealsPerPage, currentPage * dealsPerPage).map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                  
                  {/* Pagination Controls */}
                  {deals.length > dealsPerPage && (
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
                            Page {currentPage} of {Math.ceil(deals.length / dealsPerPage)} ({deals.length} total deals)
                          </span>
                        </PaginationItem>
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => {
                              if (currentPage < Math.ceil(deals.length / dealsPerPage)) {
                                setCurrentPage(currentPage + 1);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }
                            }}
                            className={currentPage === Math.ceil(deals.length / dealsPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No deals available in this category at the moment.
                  </p>
                  <Button onClick={() => window.location.reload()}>
                    Refresh Page
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
