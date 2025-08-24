import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Clock, User, BookOpen, Calendar } from "lucide-react";
import type { Blog } from "@shared/schema";
import Header from "@/components/header";
import AdvertisementBanner from "@/components/advertisement-banner";
import { usePageTracking } from "@/hooks/use-page-tracking";


export default function Blogs() {
  // Track page view for analytics
  usePageTracking("Blogs", "/blogs");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");


  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ["/api/blogs", currentSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentSearch) {
        params.append("search", currentSearch);
      }
      const response = await fetch(`/api/blogs?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch blogs");
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearch(searchQuery.trim());
  };

  const groupedBlogs = blogs.reduce((acc: Record<string, Blog[]>, blog) => {
    if (!acc[blog.category]) {
      acc[blog.category] = [];
    }
    acc[blog.category].push(blog);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Banner Advertisement */}
      <div className="w-full">
        <AdvertisementBanner position="header" size="medium" className="rounded-none" />
      </div>

      {/* Top Banner Advertisement */}
      <div className="container mx-auto px-4 mb-6">
        <AdvertisementBanner position="top" size="medium" />
      </div>

      {/* Main Layout with Sidebars */}
      <div className="container mx-auto px-4 pb-6">
        <div className="flex gap-6">
          {/* Left Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {/* Google-style header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Houseplant Care Blogs
                </h1>
                <div className="text-sm text-gray-600">
                  About {blogs.length} results
                </div>
              </div>
              
              {/* Search bar */}
              <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
                <Input
                  type="text"
                  placeholder="Search houseplant care blogs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  data-testid="input-blog-search"
                />
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                  data-testid="button-blog-search"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>


            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading blogs...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedBlogs).map(([category, categoryBlogs]) => (
                  <div key={category} className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-4">
                      {category}
                    </h2>
                    
                    <div className="grid gap-4">
                      {categoryBlogs.map((blog) => (
                        <Card key={blog.id} className="hover:shadow-lg transition-all duration-200 border border-gray-200">
                          <div className="flex flex-col md:flex-row">
                            {/* Blog Image */}
                            <div className="md:w-72 md:flex-shrink-0">
                              <img
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="w-full h-48 md:h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                                data-testid={`img-blog-${blog.id}`}
                              />
                            </div>
                            
                            {/* Blog Content */}
                            <div className="flex-1 p-6">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <a 
                                    href={blog.blogUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="group"
                                    data-testid={`link-blog-${blog.id}`}
                                  >
                                    <h3 className="text-xl font-semibold text-blue-600 group-hover:text-blue-800 line-clamp-2 mb-2">
                                      {blog.title}
                                    </h3>
                                  </a>
                                  
                                  <div className="flex items-center text-sm text-gray-600 mb-2">
                                    <a 
                                      href={blog.websiteUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-green-600 hover:text-green-800 font-medium mr-4"
                                      data-testid={`link-website-${blog.id}`}
                                    >
                                      {blog.website}
                                    </a>
                                    <span className="text-gray-400">•</span>
                                    <span className="ml-2">{blog.publishDate}</span>
                                  </div>
                                </div>
                                
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  asChild
                                  data-testid={`button-external-${blog.id}`}
                                >
                                  <a href={blog.blogUrl} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                              </div>
                              
                              <p className="text-gray-700 text-sm mb-3 line-clamp-3">
                                {blog.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    <span>{blog.author}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    <span>{blog.readTime}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    <span>{blog.category}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Tags */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                {blog.tags?.slice(0, 4).map((tag, index) => (
                                  <Badge 
                                    key={index} 
                                    variant="secondary" 
                                    className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    data-testid={`tag-${tag.replace(' ', '-')}`}
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {blog.tags && blog.tags.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{blog.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
                
                {blogs.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <BookOpen className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs found</h3>
                    <p className="text-gray-600">
                      {currentSearch 
                        ? `No blogs found for "${currentSearch}". Try a different search term.`
                        : "No blogs available at the moment."
                      }
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="right" size="medium" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner Advertisement */}
      <div className="container mx-auto px-4 pb-6">
        <AdvertisementBanner position="bottom" size="medium" />
      </div>
    </div>
  );
}