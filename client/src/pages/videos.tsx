import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayCircle, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { VideoChannel } from "@shared/schema";
import AdvertisementBanner from "@/components/advertisement-banner";
import { usePageTracking } from "@/hooks/use-page-tracking";


export default function Videos() {
  // Track page view for analytics
  usePageTracking("Videos", "/videos");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 9;

  const { 
    data: allVideoChannels = [], 
    isLoading, 
    error 
  } = useQuery<VideoChannel[]>({
    queryKey: ["/api/video-channels"],
    queryFn: () => api.getVideoChannels(24),
  });

  // Calculate pagination
  const totalVideos = allVideoChannels.length;
  const totalPages = Math.ceil(totalVideos / videosPerPage);
  const startIndex = (currentPage - 1) * videosPerPage;
  const endIndex = startIndex + videosPerPage;
  const videoChannels = allVideoChannels.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Videos" }
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <Alert className="mb-6">
            <AlertDescription>
              Failed to load video channels. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

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

      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar Advertisement */}
          <div className="hidden lg:block flex-shrink-0">
            <div className="sticky top-6">
              <AdvertisementBanner position="left" size="medium" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-net-dark mb-2">Video Channels</h1>
          <p className="text-gray-600">
            Discover bicycle channels from around the world featuring everything from maintenance tutorials to adventure cycling
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <PlayCircle className="w-4 h-4" />
                <span>Channels</span>
                <span className="font-medium">{videoChannels.length}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">Sort by</span>
              <select 
                className="border rounded-md px-3 py-1 text-sm"
                data-testid="select-sort"
              >
                <option value="followers">Most Followers</option>
                <option value="videos">Most Videos</option>
                <option value="recent">Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Video Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video">
                  <Skeleton className="w-full h-full" />
                </div>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center mb-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            videoChannels.map((channel) => (
              <Card key={channel.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video relative overflow-hidden bg-gray-100">
                  <img
                    src={channel.thumbnailUrl}
                    alt={channel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    data-testid={`img-channel-${channel.id}`}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <PlayCircle className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-net-green transition-colors">
                    <a 
                      href={channel.channelUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid={`link-channel-${channel.id}`}
                    >
                      {channel.title}
                    </a>
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {channel.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="w-4 h-4" />
                      <span data-testid={`text-videos-${channel.id}`}>
                        {channel.videoCount} videos
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span data-testid={`text-followers-${channel.id}`}>
                        {channel.followerCount} followers
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {channel.tags?.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {!isLoading && totalVideos > videosPerPage && (
          <div className="flex justify-center items-center gap-4 mt-8 mb-6">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
              data-testid="button-previous-page"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <span className="text-xs text-gray-400">
                ({totalVideos} total videos)
              </span>
            </div>
            
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
              data-testid="button-next-page"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allVideoChannels.length === 0 && (
          <div className="text-center py-12">
            <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Video Channels Found</h3>
            <p className="text-gray-500">Check back later for new video content</p>
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
      </main>

      {/* Bottom Banner Advertisement */}
      <div className="container mx-auto px-4 pb-6">
        <AdvertisementBanner position="bottom" size="medium" />
      </div>
      
      <Footer />
    </div>
  );
}