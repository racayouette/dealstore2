import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import TopNav from "@/components/top-nav";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Settings, Eye, EyeOff, Home, ShoppingBag, Store, Video, FileText, Users, Search, LogOut, ExternalLink, ChevronDown, ChevronRight, Edit3, Globe, Copy, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { getAdminSession, clearAdminSession } from "@/lib/auth";
import { useLocation } from "wouter";

interface PageBannerSettings {
  id?: string;
  pageName: string;
  pageUrl: string;
  isVisible: boolean;
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

function BannerEditForm({ banner, updateBannerMutation }: { banner: AdvertisementBanner, updateBannerMutation: any }) {
  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium text-sm">{banner.title}</h5>
          <p className="text-xs text-gray-500">Size: {banner.size}</p>
          <p className="text-xs text-gray-400 mt-1">
            {banner.alwaysShow ? 'Always Show' : `Max Impressions: ${banner.maxImpressions === 0 ? 'Unlimited' : banner.maxImpressions}`}
          </p>
        </div>
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
  );
}

function CreateBannerForm({ position, positionName, updateBannerMutation }: { position: string, positionName: string, updateBannerMutation: any }) {
  const [isAlwaysShow, setIsAlwaysShow] = useState(true);
  const { toast } = useToast();

  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: any) => {
      const res = await apiRequest("POST", "/api/advertisement-banners", bannerData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Banner created",
        description: "New banner has been created successfully.",
      });
      // Refetch the banners for this page
      queryClient.invalidateQueries({ queryKey: ["/api/advertisement-banners"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating banner",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateBanner = async (formData: FormData) => {
    const bannerData = {
      position,
      size: "medium",
      title: formData.get("title") || `New ${positionName}`,
      description: formData.get("description") || "",
      imageUrl: formData.get("imageUrl") || "",
      clickUrl: formData.get("clickUrl") || "",
      isActive: true,
      alwaysShow: isAlwaysShow,
      maxImpressions: parseInt(formData.get("maxImpressions")?.toString() || "0") || 0,
      displayOrder: 0
    };
    
    createBannerMutation.mutate(bannerData);
  };

  return (
    <div className="bg-white border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="font-medium text-sm">Create New {positionName}</h5>
          <p className="text-xs text-gray-500">Size: medium</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
          New Banner
        </span>
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleCreateBanner(formData);
      }} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor={`new-title-${position}`} className="text-sm font-medium">
              Banner Title
            </Label>
            <input
              id={`new-title-${position}`}
              name="title"
              type="text"
              placeholder={`New ${positionName}`}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
              data-testid={`input-new-banner-title-${position}`}
            />
          </div>
          
          <div>
            <Label htmlFor={`new-url-${position}`} className="text-sm font-medium">
              Click URL
            </Label>
            <input
              id={`new-url-${position}`}
              name="clickUrl"
              type="url"
              placeholder="https://example.com"
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
              data-testid={`input-new-banner-url-${position}`}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor={`new-description-${position}`} className="text-sm font-medium">
            Description
          </Label>
          <textarea
            id={`new-description-${position}`}
            name="description"
            rows={3}
            placeholder="Enter banner description..."
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
            data-testid={`textarea-new-banner-description-${position}`}
          />
        </div>

        <div>
          <Label htmlFor={`new-image-${position}`} className="text-sm font-medium">
            Image URL
          </Label>
          <input
            id={`new-image-${position}`}
            name="imageUrl"
            type="url"
            placeholder="https://images.example.com/banner.jpg"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green"
            data-testid={`input-new-banner-image-${position}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Switch
              id={`new-always-show-${position}`}
              checked={isAlwaysShow}
              onCheckedChange={setIsAlwaysShow}
              data-testid={`switch-new-always-show-${position}`}
            />
            <Label htmlFor={`new-always-show-${position}`} className="text-sm font-medium">
              Always Show Banner
            </Label>
          </div>
          
          <div>
            <Label htmlFor={`new-impressions-${position}`} className="text-sm font-medium">
              Max Impressions {isAlwaysShow ? '(Ignored when Always Show is on)' : '(0 = Unlimited)'}
            </Label>
            <input
              id={`new-impressions-${position}`}
              name="maxImpressions"
              type="number"
              min="0"
              defaultValue="0"
              disabled={isAlwaysShow}
              className={`mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-net-green focus:border-net-green ${
                isAlwaysShow ? 'bg-gray-100 text-gray-400' : ''
              }`}
              data-testid={`input-new-banner-impressions-${position}`}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={createBannerMutation.isPending}
            className="bg-net-green hover:bg-net-green-dark"
          >
            {createBannerMutation.isPending ? "Creating..." : "Create Banner"}
          </Button>
        </div>
      </form>
    </div>
  );
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
              {banners.length > 0 ? (
                banners.map((banner) => (
                  <BannerEditForm 
                    key={banner.id} 
                    banner={banner} 
                    updateBannerMutation={updateBannerMutation} 
                  />
                ))
              ) : (
                <CreateBannerForm 
                  position={position} 
                  positionName={positionName}
                  updateBannerMutation={updateBannerMutation} 
                />
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface Page {
  name: string;
  url: string;
  icon: any;
  description: string;
}

const STATIC_PAGES: Page[] = [
  { name: "SEO Panel", url: "/seo-panel", icon: Globe, description: "SEO & page management controls" },
  { name: "Videos", url: "/videos", icon: Video, description: "Video channel content" },
  { name: "Video2", url: "/video2", icon: Video, description: "YouTube-style videos" },
  { name: "Posts", url: "/posts", icon: FileText, description: "Reddit-style posts" },
  { name: "Blogs", url: "/blogs", icon: FileText, description: "Blog articles and content" },
  { name: "Directory", url: "/directory", icon: Users, description: "Business directory" },
  { name: "Search", url: "/search", icon: Search, description: "Search results page" },
];

function PageListItem({ 
  page, 
  selectedPage, 
  setSelectedPage, 
  updateSettingsMutation,
  onDuplicate 
}: { 
  page: Page; 
  selectedPage: Page; 
  setSelectedPage: (page: Page) => void;
  updateSettingsMutation: any;
  onDuplicate: (page: Page) => void;
}) {
  const { toast } = useToast();
  const IconComponent = page.icon;
  
  // Fetch current page settings to get visibility status
  const { data: pageSettings } = useQuery({
    queryKey: ['/api/banner-settings', page.url],
    queryFn: async () => {
      const response = await fetch(`/api/banner-settings${page.url === '/' ? '' : page.url}`);
      return response.json();
    },
  });

  const isVisible = pageSettings?.isVisible ?? true;

  const handleVisibilityToggle = async () => {
    try {
      const newSettings = {
        pageName: page.name,
        pageUrl: page.url,
        isVisible: !isVisible,
        showHeader: pageSettings?.showHeader ?? true,
        showTop: pageSettings?.showTop ?? true,
        showLeft: pageSettings?.showLeft ?? true,
        showRight: pageSettings?.showRight ?? true,
        showBottom: pageSettings?.showBottom ?? true
      };
      
      await apiRequest('POST', '/api/banner-settings', newSettings);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/banner-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visible-pages'] });
      
      toast({
        title: isVisible ? "Page Hidden" : "Page Visible",
        description: `${page.name} page is now ${!isVisible ? 'visible' : 'hidden'} in navigation.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update page visibility.",
        variant: "destructive",
      });
    }
  };

  return (
    <div
      className={`rounded-lg border ${
        selectedPage.url === page.url 
          ? 'border-net-green bg-net-green' 
          : 'border-transparent'
      }`}
    >
      <div className="flex items-center">
        <button
          onClick={handleVisibilityToggle}
          className={`px-2 py-3 rounded-l-lg transition-colors border-r ${
            selectedPage.url === page.url 
              ? `${isVisible ? 'bg-net-green-dark hover:bg-net-green' : 'bg-red-600 hover:bg-red-500'} text-white border-net-green-dark` 
              : `${isVisible ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'} hover:text-gray-700 border-gray-200`
          }`}
          title={`${isVisible ? 'Hide' : 'Show'} ${page.name} page from navigation`}
          data-testid={`toggle-visibility-${page.url.replace('/', '')}`}
        >
          {isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setSelectedPage(page)}
          className={`flex-1 text-left p-3 transition-colors flex items-center gap-3 ${
            selectedPage.url === page.url 
              ? 'bg-net-green text-white' 
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          data-testid={`page-${page.url.replace('/', '')}`}
        >
          <IconComponent className="w-4 h-4 flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-medium truncate">
              {page.name}
              {!isVisible && <span className="ml-2 text-xs opacity-75">(Hidden)</span>}
            </div>
            <div className={`text-xs truncate ${
              selectedPage.url === page.url ? 'text-green-100' : 'text-gray-500'
            }`}>
              {page.description}
            </div>
          </div>
        </button>
        <button
          onClick={() => onDuplicate(page)}
          className={`px-3 py-3 transition-colors border-l ${
            selectedPage.url === page.url 
              ? 'bg-net-green-dark text-white border-net-green-dark hover:bg-net-green' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700 border-gray-200'
          }`}
          title={`Duplicate ${page.name} page`}
          data-testid={`duplicate-page-${page.url.replace('/', '')}`}
        >
          <Copy className="w-4 h-4" />
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
}

export default function AdvertisingPanelPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const adminSession = getAdminSession();
  
  const [selectedPage, setSelectedPage] = useState<Page>(STATIC_PAGES[0]);
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
  const [pageToDuplicate, setPageToDuplicate] = useState<Page | null>(null);
  const [duplicateForm, setDuplicateForm] = useState({
    name: '',
    url: '',
    description: ''
  });

  // Query for page visibility status
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: () => fetch('/api/visible-pages').then(res => res.json())
  });

  // Create dynamic pages list from database
  const dynamicPages: Page[] = visiblePages ? visiblePages.map((page: any) => {
    // Find matching static page for icon, or use default
    const staticMatch = STATIC_PAGES.find(sp => sp.url === page.pageUrl);
    return {
      name: page.pageName,
      url: page.pageUrl,
      icon: staticMatch?.icon || FileText,
      description: staticMatch?.description || page.pageName
    };
  }) : [];

  const allPages = dynamicPages.length > 0 ? dynamicPages : STATIC_PAGES;
  const [pageSettings, setPageSettings] = useState<PageBannerSettings>({
    pageName: selectedPage.name,
    pageUrl: selectedPage.url,
    isVisible: true,
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

  const duplicatePageMutation = useMutation({
    mutationFn: async (data: { originalPageUrl?: string; newPage: { name: string; url: string; description: string } }) => {
      const endpoint = data.originalPageUrl ? "/api/duplicate-page" : "/api/create-page";
      const response = await apiRequest("POST", endpoint, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/banner-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/visible-pages'] });
      queryClient.invalidateQueries({ queryKey: ['/api/advertisement-banners'] });
      setIsDuplicateDialogOpen(false);
      setDuplicateForm({ name: '', url: '', description: '' });
      setPageToDuplicate(null);
      toast({
        title: pageToDuplicate ? "Page Duplicated" : "Page Created",
        description: `Page "${data.name}" has been ${pageToDuplicate ? 'duplicated' : 'created'} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: `Failed to ${pageToDuplicate ? 'duplicate' : 'create'} page.`,
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
        isVisible: true,
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

  const handleDuplicatePage = (page: Page) => {
    setPageToDuplicate(page);
    setDuplicateForm({
      name: `${page.name} Copy`,
      url: `${page.url}-copy`,
      description: `Copy of ${page.description}`
    });
    setIsDuplicateDialogOpen(true);
  };

  const handleDuplicateSubmit = () => {
    if (!pageToDuplicate || !duplicateForm.name || !duplicateForm.url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Ensure URL starts with /
    const formattedUrl = duplicateForm.url.startsWith('/') ? duplicateForm.url : `/${duplicateForm.url}`;

    duplicatePageMutation.mutate({
      originalPageUrl: pageToDuplicate?.url,
      newPage: {
        name: duplicateForm.name,
        url: formattedUrl,
        description: duplicateForm.description
      }
    });
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
      
      <div className="flex">
        {/* Left Sidebar */}
        <div className="w-96 bg-white border-r border-gray-200 min-h-screen">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-6 h-6 text-net-green" />
              <h1 className="text-xl font-bold text-net-dark">Advertising Panel</h1>
            </div>
            <p className="text-sm text-gray-600">Manage banner settings for each page</p>
          </div>
          
          <ScrollArea className="h-[calc(100vh-120px)]">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Pages</h2>
                <Button
                  size="sm"
                  onClick={() => {
                    setPageToDuplicate(null);
                    setDuplicateForm({ name: '', url: '', description: '' });
                    setIsDuplicateDialogOpen(true);
                  }}
                  className="flex items-center gap-1 bg-net-green hover:bg-net-green-dark"
                  data-testid="button-add-new-page"
                >
                  <Plus className="w-3 h-3" />
                  Add
                </Button>
              </div>
              <div className="space-y-1">
                {allPages.map((page) => {
                  const IconComponent = page.icon;
                  return (
                    <PageListItem 
                      key={page.url} 
                      page={page} 
                      selectedPage={selectedPage} 
                      setSelectedPage={setSelectedPage}
                      updateSettingsMutation={updateSettingsMutation}
                      onDuplicate={handleDuplicatePage}
                    />
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

      {/* Duplicate Page Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{pageToDuplicate ? 'Duplicate Page' : 'Create New Page'}</DialogTitle>
            <DialogDescription>
              {pageToDuplicate 
                ? `Create a copy of "${pageToDuplicate.name}" with all its banner settings and configurations.`
                : 'Create a new page with default banner settings and configurations.'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="page-name" className="text-right">
                Name
              </Label>
              <Input
                id="page-name"
                value={duplicateForm.name}
                onChange={(e) => setDuplicateForm(prev => ({ ...prev, name: e.target.value }))}
                className="col-span-3"
                placeholder="Enter page name"
                data-testid="input-duplicate-name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="page-url" className="text-right">
                URL
              </Label>
              <Input
                id="page-url"
                value={duplicateForm.url}
                onChange={(e) => setDuplicateForm(prev => ({ ...prev, url: e.target.value }))}
                className="col-span-3"
                placeholder="/page-url"
                data-testid="input-duplicate-url"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="page-description" className="text-right">
                Description
              </Label>
              <Input
                id="page-description"
                value={duplicateForm.description}
                onChange={(e) => setDuplicateForm(prev => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Enter description"
                data-testid="input-duplicate-description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDuplicateDialogOpen(false)}
              data-testid="button-cancel-duplicate"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDuplicateSubmit}
              disabled={duplicatePageMutation.isPending || !duplicateForm.name || !duplicateForm.url}
              data-testid="button-confirm-duplicate"
            >
              {duplicatePageMutation.isPending ? "Creating..." : "Create Page"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedAdminRoute>
  );
}