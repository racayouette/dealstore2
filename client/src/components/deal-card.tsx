import { Link } from "wouter";
import { Star, Clock, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DealWithRelations } from "@shared/schema";

interface DealCardProps {
  deal: DealWithRelations;
  featured?: boolean;
}

export default function DealCard({ deal, featured = false }: DealCardProps) {
  const formatPrice = (price: string | null) => {
    if (!price) return null;
    return `$${parseFloat(price).toFixed(2)}`;
  };

  const formatDiscount = () => {
    if (deal.discountPercent) {
      return `${deal.discountPercent}% Off`;
    }
    if (deal.originalPrice && deal.salePrice) {
      const original = parseFloat(deal.originalPrice);
      const sale = parseFloat(deal.salePrice);
      const discount = Math.round(((original - sale) / original) * 100);
      return `${discount}% Off`;
    }
    return null;
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
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="w-4 h-4 text-gray-300" />
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 absolute top-0 left-0 overflow-hidden" 
                style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border overflow-hidden ${featured ? 'mb-6' : 'mb-4'}`}>
      {/* Header with store badge and author */}
      <div className="bg-gray-100 px-4 py-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {deal.authorName && (
              <>
                Posted by {deal.authorName}
                <Clock className="w-3 h-3 inline ml-1" />
              </>
            )}
          </span>
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
        <div className="flex gap-6">
          {/* Deal Image */}
          <div className="w-32 h-24 flex-shrink-0">
            <img 
              src={deal.imageUrl || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200'} 
              alt={deal.title} 
              className="w-full h-full object-cover rounded-lg"
              data-testid={`img-deal-${deal.id}`}
            />
          </div>
          
          <div className="flex-1">
            {/* Deal Title */}
            <Link href={`/deal/${deal.id}`}>
              <h3 className="text-xl font-semibold text-tech-dark mb-3 hover:text-tech-blue cursor-pointer" data-testid={`title-deal-${deal.id}`}>
                {deal.title}
              </h3>
            </Link>
            
            {/* Deal Description */}
            {deal.description && (
              <p className="text-gray-600 mb-4 text-sm leading-relaxed" data-testid={`description-deal-${deal.id}`}>
                {deal.description.substring(0, 200)}
                {deal.description.length > 200 && '...'}
              </p>
            )}
            
            {/* Rating */}
            {deal.rating && (
              <div className="flex items-center space-x-2 mb-3" data-testid={`rating-deal-${deal.id}`}>
                <div className="flex">
                  {renderStars(formatRating(deal.rating))}
                </div>
                <span className="text-sm text-gray-600">
                  {deal.rating} ({deal.reviewCount?.toLocaleString() || 0} reviews)
                </span>
              </div>
            )}
            
            {/* Pricing and Actions */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-red-600" data-testid={`price-sale-${deal.id}`}>
                    {formatPrice(deal.salePrice)}
                  </span>
                  {deal.originalPrice && (
                    <span className="text-lg text-gray-500 line-through" data-testid={`price-original-${deal.id}`}>
                      {formatPrice(deal.originalPrice)}
                    </span>
                  )}
                </div>
                {formatDiscount() && (
                  <div className="text-sm text-green-600" data-testid={`discount-${deal.id}`}>
                    {formatDiscount()} + free shipping
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {deal.couponCode ? (
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    data-testid={`button-reveal-code-${deal.id}`}
                  >
                    Reveal Code
                  </Button>
                ) : (
                  <Button 
                    className="bg-tech-blue hover:bg-tech-blue-dark text-white"
                    asChild
                    data-testid={`button-view-deal-${deal.id}`}
                  >
                    <a href={deal.dealUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View Deal
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
