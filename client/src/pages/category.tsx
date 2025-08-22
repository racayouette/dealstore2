import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";
import DealCard from "@/components/deal-card";
import Breadcrumb from "@/components/breadcrumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Category, DealWithRelations } from "@shared/schema";

export default function Category() {
  const { slug } = useParams<{ slug: string }>();

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
            Techbargains.com is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.
            <a href="#" className="text-net-blue hover:underline ml-1">Learn More</a>
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        {categoryLoading ? (
          <Skeleton className="h-8 w-64 mb-6" />
        ) : (
          <h1 className="text-3xl font-bold text-net-dark mb-6" data-testid={`title-category-${slug}`}>
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
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
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

          {/* Sidebar */}
          <aside className="w-80 space-y-8">
            {/* Category Information */}
            {category && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-xl font-bold text-net-dark mb-4">
                  About {category.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {category.description || `Find the best deals and discounts in ${category.name}.`}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active Deals:</span>
                    <span className="text-sm font-medium">{deals.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-net-dark mb-4">Related Categories</h3>
              
              <div className="space-y-2">
                <a href="/category/computers" className="block text-net-blue hover:underline text-sm">
                  Computers
                </a>
                <a href="/category/electronics" className="block text-net-blue hover:underline text-sm">
                  Electronics
                </a>
                <a href="/category/lifestyle-home" className="block text-net-blue hover:underline text-sm">
                  Lifestyle & Home
                </a>
                <a href="/category/small-business" className="block text-net-blue hover:underline text-sm">
                  Small Business
                </a>
              </div>
            </div>

            {/* Deal Alert */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-bold text-net-dark mb-4">Deal Alerts</h3>
              <p className="text-sm text-gray-600 mb-4">
                Get notified when new deals are posted in {category?.name}.
              </p>
              <Button className="w-full">
                Set Up Alert
              </Button>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
