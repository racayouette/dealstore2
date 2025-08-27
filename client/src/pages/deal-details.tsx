import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ExternalLink, Copy, Clock, User } from "lucide-react";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import type { DealWithRelations } from "@shared/schema";
import { usePageTracking } from "@/hooks/use-page-tracking";
import { HeartButton } from "@/components/HeartButton";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function DealDetails() {
  usePageTracking("Deal Details", "/deal/:id");
  
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  // Fetch deal details
  const { 
    data: deal, 
    isLoading, 
    error 
  } = useQuery<DealWithRelations>({
    queryKey: ["/api/deals", id],
    queryFn: () => api.getDealById(id!),
    enabled: !!id,
  });

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

  // Fetch related deals
  const { data: relatedDeals = [] } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals/related", deal?.category?.slug],
    queryFn: () => api.getDealsByCategory(deal?.category?.slug!, 8),
    enabled: !!deal?.category?.slug,
  });

  const formatPrice = (price: string | null) => {
    if (!price) return null;
    const numPrice = parseFloat(price);
    return `$${numPrice.toFixed(2)}`;
  };

  const calculateSavings = (originalPrice: string | null, salePrice: string | null) => {
    if (!originalPrice || !salePrice) return 0;
    const original = parseFloat(originalPrice);
    const sale = parseFloat(salePrice);
    if (original <= sale) return 0;
    return Math.round(((original - sale) / original) * 100);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Coupon code copied to clipboard",
    });
  };

  const formatRelativeTime = (date: string | null) => {
    if (!date) return "recently";
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours === 1) return "1 hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "1 day ago";
    return `${diffInDays} days ago`;
  };

  const breadcrumbItems = deal ? [
    { label: deal.category.name, href: `/category/${deal.category.slug}` },
    { label: deal.title }
  ] : [];

  if (error) {
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
                <h1 className="text-2xl font-bold" data-testid="title-deal-details">
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
        
        <main className="container mx-auto px-4 py-6">
          <Alert>
            <AlertDescription>
              Deal not found or failed to load. Please check the URL and try again.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold" data-testid="title-deal-details">
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

      <main className="container mx-auto px-4 py-6">
        {!isLoading && deal && <Breadcrumb items={breadcrumbItems} />}
        
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="w-full h-96 rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        ) : deal ? (
          <>
            {/* Main Deal Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Product Image */}
              <div className="relative">
                <img 
                  src={deal.imageUrl || ''} 
                  alt={deal.title}
                  className="w-full h-auto rounded-lg shadow-sm"
                  data-testid="img-deal-main"
                />
                <div className="absolute top-4 right-4">
                  <HeartButton dealId={deal.id} className="bg-white/80 hover:bg-white shadow-sm" size={20} />
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4" data-testid="title-deal">
                    {deal.title}
                  </h1>
                  
                  <div className="space-y-3">
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-black" data-testid="price-sale">
                        {formatPrice(deal.salePrice)}
                      </span>
                      {deal.originalPrice && deal.originalPrice !== deal.salePrice && (
                        <>
                          <span className="text-lg text-gray-500 line-through" data-testid="price-original">
                            {formatPrice(deal.originalPrice)}
                          </span>
                          <span className="text-lg font-semibold text-green-600">
                            Save {calculateSavings(deal.originalPrice, deal.salePrice)}%
                          </span>
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="text-blue-600 font-medium">{deal.store.name}</span>
                      <HeartButton dealId={deal.id} size={16} />
                    </div>

                    {deal.freeShipping && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Free Shipping
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Get This Deal Button */}
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-lg font-semibold"
                  onClick={() => window.open(deal.dealUrl, '_blank')}
                  data-testid="button-get-deal"
                >
                  Get This Deal
                </Button>

                {/* Coupon Code Section */}
                {deal.couponCode && (
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border">
                    <div className="flex-1">
                      <span className="text-sm font-medium text-blue-900">Coupon Code:</span>
                      <div className="text-lg font-bold text-blue-600 font-mono">
                        {deal.couponCode}
                      </div>
                    </div>
                    <Button 
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => copyToClipboard(deal.couponCode!)}
                      data-testid="button-copy-coupon"
                    >
                      Copy Coupon
                    </Button>
                  </div>
                )}

                {/* Editor Insights */}
                {deal.editorInsights && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Editor Insights</h3>
                    <div className="text-gray-700 leading-relaxed" data-testid="text-editor-insights">
                      {deal.editorInsights}
                    </div>
                  </div>
                )}

                {/* How to Get It */}
                {deal.howToGetIt && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">How to Get It</h3>
                    <div className="text-gray-700 leading-relaxed" data-testid="text-how-to-get-it">
                      {deal.howToGetIt}
                    </div>
                  </div>
                )}

                {/* Posted By */}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span data-testid="text-posted-by">
                    Posted by {deal.authorName || 'Staff'} {formatRelativeTime(deal.createdAt ? deal.createdAt.toString() : null)}
                  </span>
                </div>
              </div>
            </div>

            {/* More Deals Like This Section */}
            {relatedDeals.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6" data-testid="title-more-deals">
                  More Deals Like This
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {relatedDeals.slice(0, 6).map((relatedDeal, index) => (
                    <div key={relatedDeal.id} className="bg-white rounded-lg shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
                      <div className="relative">
                        <img 
                          src={relatedDeal.imageUrl || ''} 
                          alt={relatedDeal.title}
                          className="w-full h-32 object-cover"
                          data-testid={`img-related-deal-${index}`}
                        />
                        
                        
                        <div className="absolute top-1 right-1">
                          <HeartButton dealId={relatedDeal.id} className="bg-white/80 hover:bg-white" size={12} />
                        </div>
                      </div>
                      
                      <div className="p-3">
                        <h3 className="font-medium text-xs text-gray-900 mb-2 line-clamp-2" data-testid={`title-related-deal-${index}`}>
                          {relatedDeal.title}
                        </h3>
                        
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1">
                            {relatedDeal.salePrice && (
                              <span className="text-sm font-bold text-red-600">
                                {formatPrice(relatedDeal.salePrice)}
                              </span>
                            )}
                            {relatedDeal.originalPrice && relatedDeal.originalPrice !== relatedDeal.salePrice && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(relatedDeal.originalPrice)}
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-gray-500">
                            {relatedDeal.store?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          <Alert>
            <AlertDescription>
              Deal not found.
            </AlertDescription>
          </Alert>
        )}
      </main>

      <Footer />
    </div>
  );
}