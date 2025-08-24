import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TopNav from "@/components/top-nav";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, Eye, EyeOff, Home, ShoppingBag, Store, Video, FileText, Users, Search, LogOut, ExternalLink, ChevronDown, ChevronRight, Edit3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { getAdminSession, clearAdminSession } from "@/lib/auth";
import { useLocation } from "wouter";

interface PageBannerSettings {
  id?: string;
  pageName: string;
  pageUrl: string;
  showHeader: boolean;
  showTop: boolean;
  showLeft: boolean;
  showRight: boolean;
  showBottom: boolean;
}

interface AdvertisementBanner {
  id: string;
  pageUrl: string | null;
  position: string;
  size: string;
  title: string;
  description: string;
  imageUrl: string;
  clickUrl: string;
  isActive: boolean;
  alwaysShow: boolean;
  maxImpressions: number;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface BannerSectionProps {
  position: string;
  positionName: string;
  banners: AdvertisementBanner[];
  isVisible: boolean;
  updateBannerMutation: any;
}

function BannerSection({ position, positionName, banners, isVisible, updateBannerMutation }: BannerSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h4 className="font-medium">{positionName}</h4>
          <span className={`px-2 py-1 rounded-full text-xs ${
            isVisible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {isVisible ? 'Visible' : 'Hidden'}
          </span>
          <span className="text-sm text-gray-500">
            ({banners.length} banner{banners.length !== 1 ? 's' : ''})
          </span>
        </div>
        {banners.length > 0 && (
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Content
                {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
              <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                {banners.map((banner) => (
                  <div key={banner.id} className="bg-white border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-sm">{banner.title}</h5>
                        <p className="text-xs text-gray-500">Size: {banner.size}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {banner.alwaysShow ? 'Always Show' : `Max Impressions: ${banner.maxImpressions === 0 ? 'Unlimited' : banner.maxImpressions}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        banner.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${banner.id}`} className="text-sm font-medium">
                          Banner Title
                        </Label>
                        <input
                          id={`title-${banner.id}`}
                          type="text"
                          defaultValue={banner.title}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
                          onChange={(e) => {
                            const title = e.target.value;
                            setTimeout(() => {
                              updateBannerMutation.mutate({
                                bannerId: banner.id,
                                updates: { title }
                              });
                            }, 1000);
                          }}
                          data-testid={`input-banner-title-${banner.id}`}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`url-${banner.id}`} className="text-sm font-medium">
                          Click URL
                        </Label>
                        <input
                          id={`url-${banner.id}`}
                          type="url"
                          defaultValue={banner.clickUrl}
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
                          onChange={(e) => {
                            const clickUrl = e.target.value;
                            setTimeout(() => {
                              updateBannerMutation.mutate({
                                bannerId: banner.id,
                                updates: { clickUrl }
                              });
                            }, 1000);
                          }}
                          data-testid={`input-banner-url-${banner.id}`}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={`description-${banner.id}`} className="text-sm font-medium">
                        Description
                      </Label>
                      <textarea
                        id={`description-${banner.id}`}
                        defaultValue={banner.description}
                        rows={3}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
                        onChange={(e) => {
                          const description = e.target.value;
                          setTimeout(() => {
                            updateBannerMutation.mutate({
                              bannerId: banner.id,
                              updates: { description }
                            });
                          }, 1000);
                        }}
                        data-testid={`textarea-banner-description-${banner.id}`}
                      />
                    </div>

                    <div>
                      <Label htmlFor={`image-${banner.id}`} className="text-sm font-medium">
                        Image URL
                      </Label>
                      <input
                        id={`image-${banner.id}`}
                        type="url"
                        defaultValue={banner.imageUrl}
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
                        onChange={(e) => {
                          const imageUrl = e.target.value;
                          setTimeout(() => {
                            updateBannerMutation.mutate({
                              bannerId: banner.id,
                              updates: { imageUrl }
                            });
                          }, 1000);
                        }}
                        data-testid={`input-banner-image-${banner.id}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          id={`always-show-${banner.id}`}
                          checked={banner.alwaysShow}
                          onCheckedChange={(checked) => {
                            updateBannerMutation.mutate({
                              bannerId: banner.id,
                              updates: { alwaysShow: checked }
                            });
                          }}
                          data-testid={`switch-always-show-${banner.id}`}
                        />
                        <Label htmlFor={`always-show-${banner.id}`} className="text-sm font-medium">
                          Always Show Banner
                        </Label>
                      </div>
                      
                      <div>
                        <Label htmlFor={`impressions-${banner.id}`} className="text-sm font-medium">
                          Max Impressions {banner.alwaysShow ? '(Ignored when Always Show is on)' : '(0 = Unlimited)'}
                        </Label>
                        <input
                          id={`impressions-${banner.id}`}
                          type="number"
                          min="0"
                          defaultValue={banner.maxImpressions}
                          disabled={banner.alwaysShow}
                          className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green ${
                            banner.alwaysShow ? 'bg-gray-100 text-gray-400' : ''
                          }`}
                          onChange={(e) => {
                            const maxImpressions = parseInt(e.target.value) || 0;
                            setTimeout(() => {
                              updateBannerMutation.mutate({
                                bannerId: banner.id,
                                updates: { maxImpressions }
                              });
                            }, 1000);
                          }}
                          data-testid={`input-banner-impressions-${banner.id}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </div>
      
      {banners.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p className="text-sm">No banners found for this position.</p>
          <p className="text-xs">Create banners for this position to edit their content here.</p>
        </div>
      )}
    </div>
  );
}

interface Page {
  name: string;
  url: string;
  icon: any;
  description: string;
}

const PAGES: Page[] = [
  { name: "Videos", url: "/videos", icon: Video, description: "Video channel content" },
  { name: "Video2", url: "/video2", icon: Video, description: "YouTube-style videos" },
  { name: "Posts", url: "/posts", icon: FileText, description: "Reddit-style posts" },
  { name: "Blogs", url: "/blogs", icon: FileText, description: "Blog articles and content" },
  { name: "Directory", url: "/directory", icon: Users, description: "Business directory" },
  { name: "Search", url: "/search", icon: Search, description: "Search results page" },
];

export default function AdvertisingPanelPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const adminSession = getAdminSession();
  
  const [selectedPage, setSelectedPage] = useState<Page>(PAGES[0]);
  const [pageSettings, setPageSettings] = useState<PageBannerSettings>({
    pageName: selectedPage.name,
    pageUrl: selectedPage.url,
    showHeader: true,
    showTop: true,
    showLeft: true,
    showRight: true,
    showBottom: true
  });

  // Fetch banner settings for the selected page
  const { data: currentSettings } = useQuery({
    queryKey: ['/api/banner-settings', selectedPage.url],
    queryFn: async () => {
      const response = await fetch(`/api/banner-settings${selectedPage.url === '/' ? '' : selectedPage.url}`);
      return response.json();
    },
  });

  // Fetch advertisement banners for the selected page
  const { data: pageBanners = [] } = useQuery<AdvertisementBanner[]>({
    queryKey: ['/api/advertisement-banners/page', selectedPage.url],
    queryFn: async () => {
      const response = await fetch(`/api/advertisement-banners/page${selectedPage.url}`);
      return response.json();
    },
  });

  // Update mutation for banner settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: PageBannerSettings) => {
      return await apiRequest('POST', '/api/banner-settings', settings);
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: `Banner settings for ${selectedPage.name} have been updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/banner-settings'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save banner settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update mutation for banner content
  const updateBannerMutation = useMutation({
    mutationFn: async ({ bannerId, updates }: { bannerId: string; updates: Partial<AdvertisementBanner> }) => {
      return await apiRequest('PUT', `/api/advertisement-banners/${bannerId}`, updates);
    },
    onSuccess: () => {
      toast({
        title: "Banner updated",
        description: "Banner content has been saved automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-banners/page'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update banner content.",
        variant: "destructive",
      });
    },
  });

  // Update local state when page changes or settings are fetched
  useEffect(() => {
    if (currentSettings) {
      setPageSettings(currentSettings);
    } else {
      setPageSettings({
        pageName: selectedPage.name,
        pageUrl: selectedPage.url,
        showHeader: true,
        showTop: true,
        showLeft: true,
        showRight: true,
        showBottom: true
      });
    }
  }, [currentSettings, selectedPage]);

  const handleToggle = (position: keyof Omit<PageBannerSettings, 'id' | 'pageName' | 'pageUrl'>) => {
    const newSettings = {
      ...pageSettings,
      pageName: selectedPage.name,
      pageUrl: selectedPage.url,
      [position]: !pageSettings[position]
    };
    setPageSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const showAllBanners = () => {
    const newSettings = {
      ...pageSettings,
      pageName: selectedPage.name,
      pageUrl: selectedPage.url,
      showHeader: true,
      showTop: true,
      showLeft: true,
      showRight: true,
      showBottom: true
    };
    setPageSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const hideAllBanners = () => {
    const newSettings = {
      ...pageSettings,
      pageName: selectedPage.name,
      pageUrl: selectedPage.url,
      showHeader: false,
      showTop: false,
      showLeft: false,
      showRight: false,
      showBottom: false
    };
    setPageSettings(newSettings);
    updateSettingsMutation.mutate(newSettings);
  };

  const handleLogout = () => {
    clearAdminSession();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    setLocation('/wp-admin');
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
      
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-6 h-6 text-net-green" />
              <h1 className="text-xl font-bold text-net-dark">Advertising Panel</h1>
            </div>
            <p className="text-sm text-gray-600">Manage banner settings for each page</p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Pages</h2>
              <div className="space-y-1">
                {PAGES.map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <div
                      key={page.url}
                      className={`rounded-lg border ${
                        selectedPage.url === page.url 
                          ? 'border-net-green bg-net-green' 
                          : 'border-transparent'
                      }`}
                    >
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedPage(page)}
                          className={`flex-1 text-left p-3 rounded-l-lg transition-colors flex items-center gap-3 ${
                            selectedPage.url === page.url 
                              ? 'bg-net-green text-white' 
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                          data-testid={`page-${page.url.replace('/', '')}`}
                        >
                          <IconComponent className="w-4 h-4 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{page.name}</div>
                            <div className={`text-xs truncate ${
                              selectedPage.url === page.url ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {page.description}
                            </div>
                          </div>
                        </button>
                        <button
                          onClick={() => window.open(page.url, '_blank')}
                          className={`px-3 py-3 rounded-r-lg transition-colors border-l ${
                            selectedPage.url === page.url 
                              ? 'bg-net-green-dark text-white border-net-green-dark hover:bg-net-green' 
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-200'
                          }`}
                          title={`View ${page.name} page in new tab`}
                          data-testid={`view-page-${page.url.replace('/', '')}`}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <selectedPage.icon className="w-8 h-8 text-net-green" />
              <div>
                <h1 className="text-3xl font-bold text-net-dark">{selectedPage.name}</h1>
                <p className="text-gray-600">{selectedPage.description}</p>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Advertisement Banner Settings for {selectedPage.name}
                </CardTitle>
                <CardDescription>
                  Control which advertisement banners are visible on this specific page.
                  Changes are saved to the database and take effect immediately.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Quick Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={showAllBanners}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-show-all-banners"
                  >
                    <Eye className="w-4 h-4" />
                    Show All Banners
                  </Button>
                  <Button 
                    onClick={hideAllBanners}
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={updateSettingsMutation.isPending}
                    data-testid="button-hide-all-banners"
                  >
                    <EyeOff className="w-4 h-4" />
                    Hide All Banners
                  </Button>
                </div>
                
                <Separator />
                
                {/* Individual Banner Controls */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Banner Positions</h3>
                  
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="header-banner" className="font-medium">
                          Header Banner
                        </Label>
                        <p className="text-sm text-gray-600">
                          Banner displayed at the top of the header section
                        </p>
                      </div>
                      <Switch
                        id="header-banner"
                        checked={pageSettings.showHeader}
                        onCheckedChange={() => handleToggle('showHeader')}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="switch-header-banner"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="top-banner" className="font-medium">
                          Top Banner
                        </Label>
                        <p className="text-sm text-gray-600">
                          Banner displayed at the top of the main content area
                        </p>
                      </div>
                      <Switch
                        id="top-banner"
                        checked={pageSettings.showTop}
                        onCheckedChange={() => handleToggle('showTop')}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="switch-top-banner"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="left-banner" className="font-medium">
                          Left Sidebar Banner
                        </Label>
                        <p className="text-sm text-gray-600">
                          Banner displayed in the left sidebar area
                        </p>
                      </div>
                      <Switch
                        id="left-banner"
                        checked={pageSettings.showLeft}
                        onCheckedChange={() => handleToggle('showLeft')}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="switch-left-banner"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="right-banner" className="font-medium">
                          Right Sidebar Banner
                        </Label>
                        <p className="text-sm text-gray-600">
                          Banner displayed in the right sidebar area
                        </p>
                      </div>
                      <Switch
                        id="right-banner"
                        checked={pageSettings.showRight}
                        onCheckedChange={() => handleToggle('showRight')}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="switch-right-banner"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <Label htmlFor="bottom-banner" className="font-medium">
                          Bottom Banner
                        </Label>
                        <p className="text-sm text-gray-600">
                          Banner displayed at the bottom of the main content area
                        </p>
                      </div>
                      <Switch
                        id="bottom-banner"
                        checked={pageSettings.showBottom}
                        onCheckedChange={() => handleToggle('showBottom')}
                        disabled={updateSettingsMutation.isPending}
                        data-testid="switch-bottom-banner"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

{/* Banner sections organized by position */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Edit Banner Content</h3>
                  <p className="text-sm text-gray-600">Edit the content and settings of advertisement banners for this page. Changes are saved automatically.</p>
                  
                  {['header', 'top', 'left', 'right', 'bottom'].map((position) => {
                    const positionBanners = pageBanners?.filter(banner => banner.position === position) || [];
                    const positionName = position === 'left' ? 'Left Sidebar Banner' : 
                                       position === 'right' ? 'Right Sidebar Banner' :
                                       position.charAt(0).toUpperCase() + position.slice(1) + ' Banner';
                    const isVisible = position === 'header' ? pageSettings.showHeader :
                                    position === 'top' ? pageSettings.showTop :
                                    position === 'left' ? pageSettings.showLeft :
                                    position === 'right' ? pageSettings.showRight :
                                    pageSettings.showBottom;
                    
                    return (
                      <BannerSection
                        key={position}
                        position={position}
                        positionName={positionName}
                        banners={positionBanners}
                        isVisible={isVisible}
                        updateBannerMutation={updateBannerMutation}
                      />
                    );
                  })}
                </div>

                <Separator />
                
                {/* Current Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Current Settings for {selectedPage.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Header Banner: <span className={pageSettings.showHeader ? "text-green-600" : "text-red-600"}>{pageSettings.showHeader ? "Visible" : "Hidden"}</span></p>
                    <p>Top Banner: <span className={pageSettings.showTop ? "text-green-600" : "text-red-600"}>{pageSettings.showTop ? "Visible" : "Hidden"}</span></p>
                    <p>Left Banner: <span className={pageSettings.showLeft ? "text-green-600" : "text-red-600"}>{pageSettings.showLeft ? "Visible" : "Hidden"}</span></p>
                    <p>Right Banner: <span className={pageSettings.showRight ? "text-green-600" : "text-red-600"}>{pageSettings.showRight ? "Visible" : "Hidden"}</span></p>
                    <p>Bottom Banner: <span className={pageSettings.showBottom ? "text-green-600" : "text-red-600"}>{pageSettings.showBottom ? "Visible" : "Hidden"}</span></p>
                  </div>
                </div>
                
                {updateSettingsMutation.isPending && (
                  <div className="text-center py-4">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-net-green"></div>
                      Saving settings...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
        
        <Footer />
      </div>
    </ProtectedAdminRoute>
  );
}