import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Users } from "lucide-react";
import { api } from "@/lib/api";
import type { VideoChannel } from "@shared/schema";

export default function Videos() {
  const { 
    data: videoChannels = [], 
    isLoading, 
    error 
  } = useQuery<VideoChannel[]>({
    queryKey: ["/api/video-channels"],
    queryFn: () => api.getVideoChannels(24),
  });

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
      
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-tech-dark mb-2">Video Channels</h1>
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
                  <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-tech-blue transition-colors">
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

        {/* Empty State */}
        {!isLoading && videoChannels.length === 0 && (
          <div className="text-center py-12">
            <PlayCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Video Channels Found</h3>
            <p className="text-gray-500">Check back later for new video content</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}