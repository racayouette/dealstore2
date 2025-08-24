import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowUp, MessageSquare, ExternalLink, User } from "lucide-react";
import type { Post } from "@shared/schema";
import Header from "@/components/header";
import AdvertisementBanner from "@/components/advertisement-banner";


export default function Posts() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");


  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/posts", currentSearch],
    queryFn: () => {
      const params = new URLSearchParams();
      if (currentSearch) {
        params.append("q", currentSearch);
      }
      return fetch(`/api/posts?${params}`).then(res => res.json());
    }
  }) as { data: Post[]; isLoading: boolean };

  const handleSearch = () => {
    setCurrentSearch(searchQuery);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Header Banner Advertisement */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-2">
          <AdvertisementBanner position="header" size="small" />
        </div>
      </div>

      {/* Top Banner Advertisement */}
      <div className="container mx-auto px-4 pb-4">
        <AdvertisementBanner position="top" size="large" />
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          {/* Left Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2" data-testid="posts-title">
            Houseplant Care Posts
          </h1>
          <p className="text-gray-600 mb-6" data-testid="posts-description">
            Discover helpful tips, guides, and discussions about houseplant care from the community.
          </p>
          
          {/* Search Section */}
          <div className="flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search houseplant care posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
                data-testid="search-posts-input"
              />
            </div>
            <Button onClick={handleSearch} data-testid="search-posts-button">
              Search
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="animate-pulse" data-testid={`post-skeleton-${index}`}>
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Posts Grid */}
        {!isLoading && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow" data-testid={`post-card-${post.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-6 mb-2" data-testid={`post-title-${post.id}`}>
                        {post.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 text-sm" data-testid={`post-meta-${post.id}`}>
                        <User className="h-3 w-3" />
                        <span>u/{post.author}</span>
                        {post.subreddit && (
                          <>
                            <span>•</span>
                            <span>r/{post.subreddit}</span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                    {post.imageUrl && (
                      <img 
                        src={post.imageUrl} 
                        alt={post.title}
                        className="w-16 h-16 object-cover rounded ml-3"
                        data-testid={`post-image-${post.id}`}
                      />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3" data-testid={`post-content-${post.id}`}>
                    {post.content}
                  </p>
                  
                  {/* Post Stats */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1" data-testid={`post-upvotes-${post.id}`}>
                        <ArrowUp className="h-4 w-4" />
                        <span>{post.upvotes}</span>
                      </div>
                      <div className="flex items-center gap-1" data-testid={`post-comments-${post.id}`}>
                        <MessageSquare className="h-4 w-4" />
                        <span>{post.commentCount}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      data-testid={`post-link-${post.id}`}
                    >
                      <a 
                        href={post.postUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Post
                      </a>
                    </Button>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1" data-testid={`post-tags-${post.id}`}>
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && posts.length === 0 && (
          <div className="text-center py-12" data-testid="posts-empty-state">
            <div className="text-gray-400 mb-4">
              <MessageSquare className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentSearch ? "No posts found" : "No posts available"}
            </h3>
            <p className="text-gray-500">
              {currentSearch 
                ? `No posts found for "${currentSearch}". Try a different search term.`
                : "Check back later for new houseplant care discussions."
              }
            </p>
            {currentSearch && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setCurrentSearch("");
                  setSearchQuery("");
                }} 
                className="mt-4"
                data-testid="clear-search-button"
              >
                Clear Search
              </Button>
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