import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, Play, ExternalLink, User, Eye, Clock } from "lucide-react";
import type { YoutubeVideo } from "@shared/schema";
import AdvertisementBanner from "@/components/advertisement-banner";
import { useSiteSettings } from "@/hooks/use-site-settings";


export default function Video2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 6;

  // Fetch site settings from global cache
  const { data: siteSettings } = useSiteSettings();

  // Fetch visible pages for navigation
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: async () => {
      const response = await fetch('/api/visible-pages');
      if (!response.ok) throw new Error('Failed to fetch visible pages');
      return response.json();
    },
  });

  const { data: videos = [], isLoading } = useQuery<YoutubeVideo[]>({
    queryKey: ["/api/youtube-videos", currentSearch],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (currentSearch) {
        params.append("search", currentSearch);
      }
      const response = await fetch(`/api/youtube-videos?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch videos");
      }
      return response.json();
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentSearch(searchQuery.trim());
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 py-1">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold" data-testid="title-video2">
                {siteSettings?.siteName}
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="hover:text-blue-200 transition-colors">Stores</a>
                {Array.isArray(visiblePages) && visiblePages.map((page) => (
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

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
        {/* YouTube-style header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Houseplant Care Videos
            </h1>
            <div className="text-sm text-gray-600">
              About {videos.length} results
            </div>
          </div>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <Input
              type="text"
              placeholder="Search houseplant care videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              data-testid="input-video-search"
            />
            <Button 
              type="submit" 
              className="bg-red-600 hover:bg-red-700 text-white px-6"
              data-testid="button-video-search"
            >
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Removed Filter tabs */}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage).map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Video Thumbnail */}
                  <div className="md:w-80 md:flex-shrink-0">
                    <a 
                      href={video.videoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="relative block cursor-pointer"
                      data-testid={`thumbnail-video-${video.id}`}
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-48 md:h-56 object-cover"
                        data-testid={`img-video-${video.id}`}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center group">
                        <Play className="w-16 h-16 text-white opacity-0 group-hover:opacity-90 transition-opacity" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </a>
                  </div>
                  
                  {/* Video Info */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 hover:text-red-600 cursor-pointer">
                        <a 
                          href={video.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          data-testid={`link-video-${video.id}`}
                        >
                          {video.title}
                        </a>
                      </h2>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-external-${video.id}`}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="mr-4">{formatNumber(video.viewCount || 0)} views</span>
                      <Clock className="w-4 h-4 mr-1" />
                      <span>{video.uploadDate}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-700 mb-3">
                      <User className="w-4 h-4 mr-2" />
                      <a 
                        href={video.channelUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-red-600 font-medium"
                        data-testid={`link-channel-${video.id}`}
                      >
                        {video.channelName}
                      </a>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                      {video.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {video.tags?.map((tag, index) => (
                        <span 
                          key={index} 
                          className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full hover:bg-gray-200 cursor-pointer"
                          data-testid={`tag-${tag.replace(' ', '-')}`}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Pagination Controls */}
            {videos.length > videosPerPage && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => {
                        if (currentPage > 1) {
                          setCurrentPage(currentPage - 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  <PaginationItem>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {Math.ceil(videos.length / videosPerPage)} ({videos.length} total videos)
                    </span>
                  </PaginationItem>
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => {
                        if (currentPage < Math.ceil(videos.length / videosPerPage)) {
                          setCurrentPage(currentPage + 1);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className={currentPage === Math.ceil(videos.length / videosPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
            
            {videos.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Play className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No videos found</h3>
                <p className="text-gray-600">
                  {currentSearch 
                    ? `No videos found for "${currentSearch}". Try a different search term.`
                    : "No videos available at the moment."
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