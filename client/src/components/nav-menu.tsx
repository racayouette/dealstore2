import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import UserMenu from "./user-menu";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, User, X } from "lucide-react";

export default function NavMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: siteSettings } = useSiteSettings();

  const { data: visiblePages } = useQuery({
    queryKey: ["/api/visible-pages"],
    queryFn: async () => {
      const response = await fetch("/api/visible-pages");
      if (!response.ok) throw new Error("Failed to fetch visible pages");
      return response.json();
    },
  });

  return (
    <div className="bg-blue-600 text-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold" data-testid="title-blogs">
              {siteSettings?.siteName}
            </h1>
            <nav className="hidden lg:flex items-center space-x-6">
              <a href="/" className="hover:text-blue-200 transition-colors">
                Stores
              </a>
              {Array.isArray(visiblePages) &&
                visiblePages.map((page) => (
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
          <div className="flex items-center space-x-1">
            <UserMenu />
            <div className="flex items-center space-x-2 lg:space-x-4">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-white hover:text-blue-200 hover:bg-blue-700"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              
            </div>
          </div>






        </div>
                  {/* Mobile Navigation Menu */}
                  {isMobileMenuOpen && (
                    <nav className="lg:hidden ">
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
                        {/* {isAdminPage && (
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
                        )} */}
                      </div>
                    </nav>
                  )}
      </div>
    </div>
  );
}
