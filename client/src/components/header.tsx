import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { BannerSettings, SiteSettings } from "@shared/schema";
import logoImage from "@/assets/logo.png";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showElectronicsMenu, setShowElectronicsMenu] = useState(false);
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

  // Electronics supermenu data
  const electronicsCategories = [
    {
      title: "Computers & Tablets",
      items: ["Laptops", "Desktop PCs", "Tablets", "Monitors", "Computer Accessories"]
    },
    {
      title: "Mobile Devices",
      items: ["Smartphones", "Cell Phone Cases", "Phone Accessories", "Smartwatches", "Wireless Chargers"]
    },
    {
      title: "Audio & Video",
      items: ["Headphones & Earbuds", "Speakers", "TVs", "Home Theater", "Streaming Devices"]
    },
    {
      title: "Gaming",
      items: ["Gaming Consoles", "Gaming Laptops", "Gaming Accessories", "Video Games", "VR Headsets"]
    },
    {
      title: "Smart Home",
      items: ["Smart Speakers", "Security Cameras", "Smart Lighting", "Home Automation", "Smart Thermostats"]
    },
    {
      title: "Photography",
      items: ["Digital Cameras", "Camera Lenses", "Tripods", "Camera Bags", "Photo Accessories"]
    }
  ];

  return (
    <>
      {/* Affiliate Disclosure - Only show on non-admin pages */}
      {!isAdminPage && (
        <div className="bg-yellow-50 border-b border-yellow-200 py-2">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-gray-700">
              {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
            </p>
          </div>
        </div>
      )}
      
      <header className="bg-net-green text-white">
      <div className="container mx-auto px-4">
        {/* Top bar with logo and search */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <Link href="/" data-testid="link-logo">
              {isAdminPage ? (
                <h1 className="text-xl md:text-2xl font-bold cursor-pointer text-black">
                  {siteSettings?.siteName || 'NetDiscount'}
                </h1>
              ) : (
                <img 
                  src={logoImage} 
                  alt={siteSettings?.siteName || 'NetDiscount'} 
                  className="h-10 md:h-16 cursor-pointer"
                />
              )}
            </Link>
          </div>
          
          {/* Search bar - only show on admin pages */}
          {isAdminPage && (
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
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
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden text-white hover:text-blue-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            
            <Link href="/auth">
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:text-blue-200 text-white"
                data-testid="button-login"
              >
                <User className="w-4 h-4" />
                <span className="ml-1 hidden sm:inline">Login</span>
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Desktop Navigation Menu */}
        <nav className="hidden md:block border-t border-green-600 relative">
          <div className="flex space-x-6 lg:space-x-8 py-2 overflow-x-auto">
            {Array.isArray(visiblePages) && visiblePages.map((page) => (
              <div
                key={page.pageUrl}
                className="relative"
                onMouseEnter={() => page.pageName.toLowerCase() === 'electronics' && setShowElectronicsMenu(true)}
                onMouseLeave={() => page.pageName.toLowerCase() === 'electronics' && setShowElectronicsMenu(false)}
              >
                <Link
                  href={page.pageUrl}
                  className="hover:text-blue-200 font-medium whitespace-nowrap text-sm lg:text-base"
                  data-testid={`nav-${page.pageUrl.replace('/', '')}`}
                >
                  {page.pageName}
                </Link>
                
                {/* Electronics Supermenu */}
                {page.pageName.toLowerCase() === 'electronics' && showElectronicsMenu && (
                  <div 
                    className="absolute left-0 top-full mt-0 bg-white shadow-lg border border-gray-200 rounded-lg z-50 w-screen max-w-4xl"
                    onMouseEnter={() => setShowElectronicsMenu(true)}
                    onMouseLeave={() => setShowElectronicsMenu(false)}
                  >
                    <div className="grid grid-cols-3 gap-6 p-6">
                      {electronicsCategories.map((category, index) => (
                        <div key={index} className="space-y-3">
                          <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                            {category.title}
                          </h3>
                          <ul className="space-y-2">
                            {category.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <Link
                                  href={`/search?q=${encodeURIComponent(item)}`}
                                  className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-150"
                                  data-testid={`electronics-${item.toLowerCase().replace(/\s+/g, '-')}`}
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>
        
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden border-t border-green-600 bg-net-green">
            <div className="flex flex-col space-y-1 py-2">
              {Array.isArray(visiblePages) && visiblePages.map((page) => (
                <Link
                  key={page.pageUrl}
                  href={page.pageUrl}
                  className="hover:text-blue-200 font-medium px-4 py-2 text-sm"
                  data-testid={`nav-mobile-${page.pageUrl.replace('/', '')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {page.pageName}
                </Link>
              ))}
              
              {/* Mobile search for admin pages */}
              {isAdminPage && (
                <div className="px-4 py-2">
                  <form onSubmit={handleSearch} className="relative">
                    <Input
                      type="text"
                      placeholder="Search deals, stores & more"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 pr-12 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                      data-testid="input-search-mobile"
                    />
                    <Button 
                      type="submit"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                      data-testid="button-search-mobile"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>
          </nav>
        )}
      </div>
      </header>
    </>
  );
}
