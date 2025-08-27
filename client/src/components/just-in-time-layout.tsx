import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useQuery } from "@tanstack/react-query";

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
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold" data-testid={`title-${pageTitle.toLowerCase()}`}>
                {siteSettings?.siteName}
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                {/* Navigation loads progressively as visiblePages data becomes available */}
                {Array.isArray(visiblePages) && visiblePages.map((page: any) => (
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
      
      {/* Content area - Renders immediately, individual sections load as data becomes available */}
      {children}
    </div>
  );
}