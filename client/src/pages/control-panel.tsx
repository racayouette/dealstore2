import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BannerSettings {
  showHeader: boolean;
  showTop: boolean;
  showLeft: boolean;
  showRight: boolean;
  showBottom: boolean;
}

export default function ControlPanelPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [settings, setSettings] = useState<BannerSettings>({
    showHeader: true,
    showTop: true,
    showLeft: true,
    showRight: true,
    showBottom: true
  });

  // Load banner settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('bannerSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save settings to localStorage and update global state
  const saveSettings = (newSettings: BannerSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bannerSettings', JSON.stringify(newSettings));
    
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('bannerSettingsChanged', { 
      detail: newSettings 
    }));
    
    toast({
      title: "Settings saved",
      description: "Banner visibility settings have been updated across all pages.",
    });
  };

  const handleToggle = (position: keyof BannerSettings) => {
    const newSettings = {
      ...settings,
      [position]: !settings[position]
    };
    saveSettings(newSettings);
  };

  const showAllBanners = () => {
    const newSettings = {
      showHeader: true,
      showTop: true,
      showLeft: true,
      showRight: true,
      showBottom: true
    };
    saveSettings(newSettings);
  };

  const hideAllBanners = () => {
    const newSettings = {
      showHeader: false,
      showTop: false,
      showLeft: false,
      showRight: false,
      showBottom: false
    };
    saveSettings(newSettings);
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Control Panel" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-8 h-8 text-net-green" />
            <h1 className="text-3xl font-bold text-net-dark">Control Panel</h1>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Advertisement Banner Settings
              </CardTitle>
              <CardDescription>
                Control which advertisement banners are visible across all pages of the website.
                Changes take effect immediately on all pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-4">
                <Button 
                  onClick={showAllBanners}
                  variant="outline"
                  className="flex items-center gap-2"
                  data-testid="button-show-all-banners"
                >
                  <Eye className="w-4 h-4" />
                  Show All Banners
                </Button>
                <Button 
                  onClick={hideAllBanners}
                  variant="outline"
                  className="flex items-center gap-2"
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
                      checked={settings.showHeader}
                      onCheckedChange={() => handleToggle('showHeader')}
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
                      checked={settings.showTop}
                      onCheckedChange={() => handleToggle('showTop')}
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
                      checked={settings.showLeft}
                      onCheckedChange={() => handleToggle('showLeft')}
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
                      checked={settings.showRight}
                      onCheckedChange={() => handleToggle('showRight')}
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
                      checked={settings.showBottom}
                      onCheckedChange={() => handleToggle('showBottom')}
                      data-testid="switch-bottom-banner"
                    />
                  </div>
                </div>
              </div>

              <Separator />
              
              {/* Current Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Current Settings</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Header Banner: <span className={settings.showHeader ? "text-green-600" : "text-red-600"}>{settings.showHeader ? "Visible" : "Hidden"}</span></p>
                  <p>Top Banner: <span className={settings.showTop ? "text-green-600" : "text-red-600"}>{settings.showTop ? "Visible" : "Hidden"}</span></p>
                  <p>Left Banner: <span className={settings.showLeft ? "text-green-600" : "text-red-600"}>{settings.showLeft ? "Visible" : "Hidden"}</span></p>
                  <p>Right Banner: <span className={settings.showRight ? "text-green-600" : "text-red-600"}>{settings.showRight ? "Visible" : "Hidden"}</span></p>
                  <p>Bottom Banner: <span className={settings.showBottom ? "text-green-600" : "text-red-600"}>{settings.showBottom ? "Visible" : "Hidden"}</span></p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Settings are saved locally and will persist across browser sessions.
              Navigate to any page to see the banner visibility changes take effect immediately.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}