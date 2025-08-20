import { Card } from "@/components/ui/card";

interface AdvertisementBannerProps {
  position: 'top' | 'left' | 'right' | 'bottom' | 'header';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export function AdvertisementBanner({ position, size = 'medium', className = '' }: AdvertisementBannerProps) {
  const getAdContent = () => {
    switch (position) {
      case 'top':
        return {
          title: "Plant Care Tips Newsletter",
          subtitle: "Get weekly expert advice delivered to your inbox",
          cta: "Subscribe Free",
          bgColor: "bg-green-50",
          textColor: "text-green-800",
          ctaColor: "bg-green-600 hover:bg-green-700"
        };
      case 'left':
        return {
          title: "Indoor Air Quality",
          subtitle: "Discover plants that naturally purify your home's air",
          cta: "Learn More",
          bgColor: "bg-blue-50",
          textColor: "text-blue-800",
          ctaColor: "bg-blue-600 hover:bg-blue-700"
        };
      case 'right':
        return {
          title: "Plant Care Tools",
          subtitle: "Essential tools every plant parent needs",
          cta: "Shop Now",
          bgColor: "bg-purple-50",
          textColor: "text-purple-800",
          ctaColor: "bg-purple-600 hover:bg-purple-700"
        };
      case 'bottom':
        return {
          title: "Join Plant Community",
          subtitle: "Connect with thousands of plant enthusiasts worldwide",
          cta: "Join Today",
          bgColor: "bg-orange-50",
          textColor: "text-orange-800",
          ctaColor: "bg-orange-600 hover:bg-orange-700"
        };
      case 'header':
        return {
          title: "Plant Care Made Simple",
          subtitle: "Expert guides for healthy houseplants",
          cta: "Explore",
          bgColor: "bg-emerald-50",
          textColor: "text-emerald-800",
          ctaColor: "bg-emerald-600 hover:bg-emerald-700"
        };
      default:
        return {
          title: "Plant Resources",
          subtitle: "Everything you need for plant success",
          cta: "Get Started",
          bgColor: "bg-gray-50",
          textColor: "text-gray-800",
          ctaColor: "bg-gray-600 hover:bg-gray-700"
        };
    }
  };

  const getSizeClasses = () => {
    const baseClasses = {
      top: {
        small: "h-16 w-full",
        medium: "h-24 w-full",
        large: "h-32 w-full"
      },
      left: {
        small: "w-32 min-h-48",
        medium: "w-48 min-h-64",
        large: "w-64 min-h-80"
      },
      right: {
        small: "w-32 min-h-48",
        medium: "w-48 min-h-64",
        large: "w-64 min-h-80"
      },
      bottom: {
        small: "h-16 w-full",
        medium: "h-24 w-full",
        large: "h-32 w-full"
      },
      header: {
        small: "h-20 w-full",
        medium: "h-28 w-full",
        large: "h-36 w-full"
      }
    };
    
    return baseClasses[position][size];
  };

  const adContent = getAdContent();
  const sizeClasses = getSizeClasses();

  const isVertical = position === 'left' || position === 'right';
  const isSmall = size === 'small';

  return (
    <Card 
      className={`${adContent.bgColor} ${adContent.textColor} ${sizeClasses} ${className} border-2 border-dashed border-gray-300 flex ${isVertical ? 'flex-col' : 'flex-row'} items-center justify-center p-4 text-center transition-all duration-200 hover:shadow-md`}
      data-testid={`ad-banner-${position}`}
    >
      <div className={`${isVertical ? 'space-y-2' : 'space-y-1'} ${isSmall ? 'text-xs' : 'text-sm'}`}>
        <h3 className={`font-semibold ${isSmall ? 'text-xs' : isVertical ? 'text-sm' : 'text-base'}`}>
          {adContent.title}
        </h3>
        {!isSmall && (
          <p className={`${isVertical ? 'text-xs' : 'text-sm'} opacity-80`}>
            {adContent.subtitle}
          </p>
        )}
        <button 
          className={`${adContent.ctaColor} text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200`}
          data-testid={`ad-cta-${position}`}
        >
          {adContent.cta}
        </button>
      </div>
    </Card>
  );
}

export default AdvertisementBanner;