import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { AdvertisementBanner as BannerType } from "@shared/schema";

interface AdvertisementBannerProps {
  position: 'top' | 'left' | 'right' | 'bottom' | 'header';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

function getSizeClasses(position: string, size: string) {
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
  
  return baseClasses[position as keyof typeof baseClasses]?.[size as keyof typeof baseClasses['top']] || '';
}

export function AdvertisementBanner({ position, size = 'medium', className = '' }: AdvertisementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Get current page URL for banner settings lookup
  const currentPath = window.location.pathname;

  // Track click-through events
  const trackClickThru = async (banner: BannerType) => {
    try {
      await fetch('/api/click-thru', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageName: getPageNameFromPath(currentPath),
          pageUrl: currentPath,
          advertisementId: banner.id,
          advertisementTitle: banner.title,
          advertisementClickUrl: banner.clickUrl,
          bannerPosition: position,
          userAgent: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to track click-through:', error);
      // Don't block the user's click if tracking fails
    }
  };

  // Convert path to readable page name
  const getPageNameFromPath = (path: string): string => {
    if (path === '/') return 'Home';
    if (path === '/stores') return 'Stores';
    if (path === '/posts') return 'Posts';
    if (path === '/blogs') return 'Blogs';
    if (path === '/directory') return 'Directory';
    if (path === '/videos') return 'Videos';
    if (path === '/video2') return 'Video2';
    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '');
      return slug.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return path.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  // Check banner settings from database
  const { data: bannerSettings } = useQuery({
    queryKey: ['/api/banner-settings', currentPath],
    queryFn: async () => {
      const response = await fetch(`/api/banner-settings${currentPath === '/' ? '' : currentPath}`);
      return response.json();
    },
  });

  useEffect(() => {
    if (bannerSettings) {
      const positionKey = position === 'header' ? 'showHeader' : 
                        position === 'top' ? 'showTop' :
                        position === 'left' ? 'showLeft' :
                        position === 'right' ? 'showRight' :
                        position === 'bottom' ? 'showBottom' : 'showTop';
      setIsVisible(bannerSettings[positionKey] !== false);
    }
  }, [bannerSettings, position]);

  const { data: banners, isLoading, error } = useQuery<BannerType[]>({
    queryKey: ['/api/advertisement-banners', position],
    queryFn: async () => {
      const response = await fetch(`/api/advertisement-banners?position=${position}`);
      if (!response.ok) throw new Error('Failed to fetch banners');
      return response.json();
    },
  });

  // Don't render if banner is set to be hidden
  if (!isVisible) {
    return null;
  }

  const sizeClasses = getSizeClasses(position, size);
  const isVertical = position === 'left' || position === 'right';
  const isSmall = size === 'small';

  if (isLoading) {
    return (
      <Card className={`${sizeClasses} ${className} animate-pulse bg-gray-100 border-2 border-dashed border-gray-300`}>
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-gray-400 text-sm">Loading...</div>
        </div>
      </Card>
    );
  }

  if (error || !banners || banners.length === 0) {
    return null; // Don't show anything if no banners or error
  }

  // Get the first banner for this position (could be randomized later)
  const banner = banners[0];

  return (
    <Card 
      className={`${sizeClasses} ${className} bg-white border border-gray-200 flex ${isVertical ? 'flex-col' : 'flex-row'} items-center justify-center p-4 text-center transition-all duration-200 hover:shadow-md cursor-pointer overflow-hidden`}
      data-testid={`ad-banner-${position}`}
      onClick={async () => {
        // Track the click-through event
        await trackClickThru(banner);
        // Open the URL after tracking
        window.open(banner.clickUrl, '_blank');
      }}
    >
      <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
        {banner.imageUrl && (
          <div className={`${isVertical ? 'w-full h-32' : 'h-full w-32'} flex-shrink-0 overflow-hidden rounded`}>
            <img 
              src={banner.imageUrl} 
              alt={banner.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className={`${isVertical ? 'space-y-1' : 'space-y-1 ml-3'} ${isSmall ? 'text-xs' : 'text-sm'} flex-1`}>
          <h3 className={`font-semibold ${isSmall ? 'text-xs' : isVertical ? 'text-sm' : 'text-base'} text-gray-900`}>
            {banner.title}
          </h3>
          {!isSmall && banner.description && (
            <p className={`${isVertical ? 'text-xs' : 'text-sm'} text-gray-600 line-clamp-2`}>
              {banner.description}
            </p>
          )}
          <button 
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-200"
            data-testid={`ad-cta-${position}`}
          >
            Learn More
          </button>
        </div>
      </div>
    </Card>
  );
}

export default AdvertisementBanner;