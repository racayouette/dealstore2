import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { CategoryWithChildren } from "@shared/schema";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  const { data: categories = [] } = useQuery<CategoryWithChildren[]>({
    queryKey: ["/api/categories"],
    queryFn: () => api.getCategories(),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-tech-blue text-white">
      <div className="container mx-auto px-4">
        {/* Top bar with logo and search */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-4">
            <Link href="/" data-testid="link-logo">
              <h1 className="text-2xl font-bold cursor-pointer">
                <span className="text-white">tech</span>
                <span className="text-blue-200">bargains</span>
              </h1>
            </Link>
          </div>
          
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
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="flex items-center space-x-1 hover:text-blue-200 text-white"
              data-testid="button-newsletter"
            >
              <Mail className="w-4 h-4" />
              <span>Newsletter</span>
            </Button>
            <Button 
              variant="ghost" 
              className="hover:text-blue-200 text-white"
              data-testid="button-login"
            >
              <User className="w-4 h-4" />
              <span className="ml-1">Login</span>
            </Button>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="border-t border-blue-400">
          <div className="flex space-x-8 py-2">
            <Link 
              href="/stores" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-stores"
            >
              Stores
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="hover:text-blue-200 font-medium"
                data-testid={`nav-${category.slug}`}
              >
                {category.name}
              </Link>
            ))}
            <Link 
              href="/videos" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-videos"
            >
              Videos
            </Link>
            <Link 
              href="/video2" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-video2"
            >
              Video2
            </Link>
            <Link 
              href="/posts" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-posts"
            >
              Posts
            </Link>
            <Link 
              href="/blogs" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-blogs"
            >
              Blogs
            </Link>
            <Link 
              href="/directory" 
              className="hover:text-blue-200 font-medium"
              data-testid="nav-directory"
            >
              Directory
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
