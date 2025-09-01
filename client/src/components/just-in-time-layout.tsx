import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useQuery } from "@tanstack/react-query";
import Navbar from "./nav-menu";
import NavMenu from "./nav-menu";

interface JustInTimeLayoutProps {
  children: ReactNode;
  pageTitle?: string;
  showAffiliateDisclosure?: boolean;
}

export function JustInTimeLayout({ 
  children, 
  pageTitle = "",
  showAffiliateDisclosure = true 
}: JustInTimeLayoutProps) {
  // Get site settings from global cache - loads immediately
  const { data: siteSettings } = useSiteSettings();
  
  // Get visible pages for navigation - loads progressively
  const { data: visiblePages = [] } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: async () => {
      const response = await fetch('/api/visible-pages');
      if (!response.ok) throw new Error('Failed to fetch visible pages');
      return response.json();
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Affiliate Disclosure - Show immediately if enabled */}
      {showAffiliateDisclosure && (
        <div className="bg-gray-100 py-1">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-600">
              {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Header - Shows immediately with cached site settings */}
      <NavMenu />
      
      {/* Content area - Renders immediately, individual sections load as data becomes available */}
      {children}
    </div>
  );
}