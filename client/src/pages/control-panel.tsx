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
import { Settings, Eye, EyeOff, Home, ShoppingBag, Store, Video, FileText, Users, Search, LogOut } from "lucide-react";
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
                    <button
                      key={page.url}
                      onClick={() => setSelectedPage(page)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 ${
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