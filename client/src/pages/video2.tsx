import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Play, ExternalLink, User, Eye, Clock } from "lucide-react";
import type { YoutubeVideo } from "@shared/schema";
import Header from "@/components/header";
import AdvertisementBanner from "@/components/advertisement-banner";


export default function Video2() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentSearch, setCurrentSearch] = useState("");


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
            {videos.map((video) => (
              <div key={video.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Video Thumbnail */}
                  <div className="md:w-80 md:flex-shrink-0">
                    <div className="relative">
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
                    </div>
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