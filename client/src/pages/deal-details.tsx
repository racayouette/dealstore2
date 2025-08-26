import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ExternalLink, Star, Clock, Tag, Store } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";
import type { DealWithRelations, SiteSettings } from "@shared/schema";

export default function DealDetails() {
  const { id } = useParams<{ id: string }>();

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

  // Fetch site settings for dynamic site name
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return response.json();
    },
  });

  const formatPrice = (price: string | null) => {
    if (!price) return null;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatRating = (rating: string | null) => {
    if (!rating) return 0;
    return parseFloat(rating);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-5 h-5 text-gray-300" />
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden" 
                style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  const calculateDiscount = () => {
    if (deal?.discountPercent) {
      return deal.discountPercent;
    }
    if (deal?.originalPrice && deal?.salePrice) {
      const original = parseFloat(deal.originalPrice);
      const sale = parseFloat(deal.salePrice);
      return Math.round(((original - sale) / original) * 100);
    }
    return 0;
  };

  const breadcrumbItems = deal ? [
    { label: deal.category.name, href: `/category/${deal.category.slug}` },
    { label: deal.title }
  ] : [];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
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
      <Header />
      
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 border-b">
        <div className="container mx-auto px-4 py-2">
          <p className="text-sm text-gray-600">
            {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
          </p>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {!isLoading && deal && <Breadcrumb items={breadcrumbItems} />}
        
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-8 w-3/4" />
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex gap-6">
                    <Skeleton className="w-64 h-48 rounded-lg" />
                    <div className="flex-1 space-y-4">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-12 w-32" />
                    </div>
                  </div>
                </div>
              </div>
            ) : deal ? (
              <>
                {/* Deal Header */}
                <div className="bg-white rounded-lg shadow-sm border mb-6 overflow-hidden">
                  {/* Store Badge Header */}
                  <div className="bg-gray-100 px-6 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Store className="w-4 h-4 text-gray-600" />
                        <span className="text-sm text-gray-600">
                          {deal.authorName && `Posted by ${deal.authorName} • `}
                          Available at
                        </span>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="bg-blue-600 text-white"
                        data-testid={`badge-store-${deal.store.slug}`}
                      >
                        {deal.store.name}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex gap-8">
                      {/* Deal Image */}
                      <div className="w-64 h-48 flex-shrink-0">
                        <img 
                          src={deal.imageUrl || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400'} 
                          alt={deal.title} 
                          className="w-full h-full object-cover rounded-lg border"
                          data-testid={`img-deal-${deal.id}`}
                        />
                      </div>
                      
                      <div className="flex-1">
                        {/* Deal Title */}
                        <h1 className="text-2xl font-bold text-net-dark mb-4" data-testid={`title-deal-${deal.id}`}>
                          {deal.title}
                        </h1>
                        
                        {/* Rating */}
                        {deal.rating && (
                          <div className="flex items-center space-x-2 mb-4" data-testid={`rating-deal-${deal.id}`}>
                            <div className="flex">
                              {renderStars(formatRating(deal.rating))}
                            </div>
                            <span className="text-lg font-medium">
                              {deal.rating}
                            </span>
                            <span className="text-gray-600">
                              ({deal.reviewCount?.toLocaleString() || 0} reviews)
                            </span>
                          </div>
                        )}
                        
                        {/* Pricing */}
                        <div className="mb-6">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-3xl font-bold text-red-600" data-testid={`price-sale-${deal.id}`}>
                              {formatPrice(deal.salePrice)}
                            </span>
                            {deal.originalPrice && (
                              <span className="text-xl text-gray-500 line-through" data-testid={`price-original-${deal.id}`}>
                                {formatPrice(deal.originalPrice)}
                              </span>
                            )}
                            {calculateDiscount() > 0 && (
                              <Badge variant="destructive" className="text-sm">
                                {calculateDiscount()}% OFF
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-green-600 font-medium">
                            + Free shipping available
                          </p>
                        </div>

                        {/* Coupon Code */}
                        {deal.couponCode && (
                          <Card className="mb-6 border-green-200 bg-green-50">
                            <CardContent className="p-4">
                              <div className="flex items-center space-x-2">
                                <Tag className="w-4 h-4 text-green-600" />
                                <span className="font-medium text-green-800">Coupon Code:</span>
                                <code className="bg-white px-2 py-1 rounded border font-mono text-sm">
                                  {deal.couponCode}
                                </code>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                        
                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                          <Button 
                            size="lg"
                            className="bg-net-green hover:bg-net-green-dark text-white px-8"
                            asChild
                            data-testid={`button-get-deal-${deal.id}`}
                          >
                            <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-5 h-5 mr-2" />
                              Get This Deal
                            </a>
                          </Button>
                          
                          {deal.couponCode && (
                            <Button 
                              variant="outline"
                              size="lg"
                              onClick={() => navigator.clipboard.writeText(deal.couponCode!)}
                              data-testid={`button-copy-code-${deal.id}`}
                            >
                              Copy Code
                            </Button>
                          )}
                        </div>

                        {/* Expiration Warning */}
                        {deal.expiresAt && (
                          <div className="mt-4 flex items-center space-x-2 text-orange-600">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">
                              Expires: {new Date(deal.expiresAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deal Description */}
                {deal.description && (
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Deal Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="prose max-w-none" data-testid={`description-deal-${deal.id}`}>
                        <p className="text-gray-700 leading-relaxed">
                          {deal.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Store Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>About {deal.store.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-4">
                      <img 
                        src={deal.store.logoUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=60'} 
                        alt={`${deal.store.name} logo`} 
                        className="w-16 h-10 object-contain border rounded"
                      />
                      <div className="flex-1">
                        <p className="text-gray-700 mb-3">
                          {deal.store.description || `Shop the latest deals and offers from ${deal.store.name}.`}
                        </p>
                        <Button variant="outline" asChild>
                          <Link href={`/stores/${deal.store.slug}`}>
                            View All {deal.store.name} Deals
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* Sidebar */}
          <aside className="w-80 space-y-6">
            {deal && (
              <>
                {/* Quick Deal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deal Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Store:</span>
                      <span className="text-sm font-medium">{deal.store.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Category:</span>
                      <Link href={`/category/${deal.category.slug}`} className="text-sm font-medium text-net-green hover:underline">
                        {deal.category.name}
                      </Link>
                    </div>
                    {deal.rating && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <span className="text-sm font-medium">{deal.rating}/5</span>
                      </div>
                    )}
                    {calculateDiscount() > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Discount:</span>
                        <span className="text-sm font-medium text-green-600">{calculateDiscount()}%</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Related Links */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Related</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href={`/category/${deal.category.slug}`} className="block text-net-green hover:underline text-sm">
                      More {deal.category.name} Deals
                    </Link>
                    <Link href={`/stores/${deal.store.slug}`} className="block text-net-green hover:underline text-sm">
                      More {deal.store.name} Deals
                    </Link>
                    <Link href="/deals" className="block text-net-green hover:underline text-sm">
                      All Active Deals
                    </Link>
                  </CardContent>
                </Card>

                {/* Share Deal */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Share This Deal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigator.clipboard.writeText(window.location.href)}
                    >
                      Copy Link
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
