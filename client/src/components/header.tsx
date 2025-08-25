import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { BannerSettings, SiteSettings } from "@shared/schema";
import logoImage from "@/assets/logo.png";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, navigate] = useLocation();

  const { data: visiblePages = [] } = useQuery<BannerSettings[]>({
    queryKey: ["/api/visible-pages"],
    queryFn: async () => {
      const response = await fetch("/api/visible-pages");
      return response.json();
    },
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Check if current page is an admin page
  const isAdminPage = location === "/advertising-panel" || 
                      location === "/site-settings" || 
                      location?.startsWith("/admin");

  return (
    <header className="bg-net-green text-white">
      <div className="container mx-auto px-4">
        {/* Top bar with logo and search */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <Link href="/" data-testid="link-logo">
              {isAdminPage ? (
                <h1 className="text-2xl font-bold cursor-pointer text-black">
                  {siteSettings?.siteName || 'NetDiscount'}
                </h1>
              ) : (
                <img 
                  src={logoImage} 
                  alt={siteSettings?.siteName || 'NetDiscount'} 
                  className="h-16 cursor-pointer"
                />
              )}
            </Link>
          </div>
          
          {/* Search bar - only show on admin pages */}
          {isAdminPage && (
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search deals, stores & more"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-12 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                  data-testid="input-search"
                />
                <Button 
                  type="submit"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  data-testid="button-search"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>
          )}
          
          {/* Spacer for non-admin pages */}
          {!isAdminPage && <div className="flex-1"></div>}
          
          <div className="flex items-center space-x-4">
            <Link href="/auth">
              <Button 
                variant="ghost" 
                className="hover:text-blue-200 text-white"
                data-testid="button-login"
              >
                <User className="w-4 h-4" />
                <span className="ml-1">Login</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="border-t border-green-600">
          <div className="flex space-x-8 py-2">
            {Array.isArray(visiblePages) && visiblePages.map((page) => (
              <Link
                key={page.pageUrl}
                href={page.pageUrl}
                className="hover:text-blue-200 font-medium"
                data-testid={`nav-${page.pageUrl.replace('/', '')}`}
              >
                {page.pageName}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
