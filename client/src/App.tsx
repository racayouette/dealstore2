import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VisibleRoute } from "@/components/visible-route";
import NotFound from "@/pages/not-found";
import Stores from "@/pages/stores";
import Category from "@/pages/category";
import DealDetails from "@/pages/deal-details";
import Store33 from "@/pages/store33";
import Store44 from "@/pages/store44";
import Store55 from "@/pages/store55";
import Videos from "@/pages/videos";
import Video2 from "@/pages/video2";
import Posts from "@/pages/posts";
import Blogs from "@/pages/blogs";
import Directory from "@/pages/directory";
import Auth from "@/pages/auth";
import Privacy from "@/pages/privacy";
import Terms from "@/pages/terms";
import Search from "@/pages/search";
import ControlPanel from "@/pages/control-panel";
import SEOPanel from "@/pages/seo-panel";
import AdminLogin from "@/pages/admin-login";
import Analytics from "@/pages/analytics";
import AdminUsers from "@/pages/admin-users";
import AdminDownloads from "@/pages/admin-downloads";
import AdminUpload from "@/pages/admin-upload";
import DynamicPage from "@/pages/dynamic-page";
import NewsletterPopup from "@/components/newsletter-popup";
import { useNewsletterPopup } from "@/hooks/use-newsletter-popup";

function Router() {
  // Get all banner settings to create dynamic routes
  const { data: bannerSettings = [], isLoading: bannerSettingsLoading } = useQuery({
    queryKey: ['/api/banner-settings'],
    queryFn: async () => {
      const response = await fetch('/api/banner-settings');
      return response.json();
    },
  });

  // Define static routes that should not be handled by dynamic pages
  const staticRoutes = [
    '/', '/stores', '/store33', '/store44', '/store55', '/videos', '/video2', 
    '/posts', '/blogs', '/directory', '/search', '/auth', '/privacy', 
    '/terms', '/advertising-panel', '/control-panel', '/seo-panel', '/wp-admin', 
    '/admin-login', '/analytics', '/admin/users', '/admin/downloads', '/admin/upload'
  ];

  // Find dynamic pages that aren't static routes
  const dynamicPages = bannerSettings.filter((setting: any) => 
    !staticRoutes.includes(setting.pageUrl) && 
    !setting.pageUrl.startsWith('/category/') && 
    !setting.pageUrl.startsWith('/deal/')
  );

  // If banner settings are still loading, render a minimal loading state
  // to prevent 404 flash for dynamic routes
  if (bannerSettingsLoading) {
    return (
      <Switch>
        <Route path="/" component={Stores} />
        <Route path="/category/:slug" component={Category} />
        <Route path="/deal/:id" component={DealDetails} />
        <Route path="/store33" component={Store33} />
        <Route path="/store44" component={Store44} />
        <Route path="/store55" component={Store55} />
        <VisibleRoute path="/videos" component={Videos} />
        <VisibleRoute path="/video2" component={Video2} />
        <VisibleRoute path="/posts" component={Posts} />
        <VisibleRoute path="/blogs" component={Blogs} />
        <VisibleRoute path="/directory" component={Directory} />
        <VisibleRoute path="/search" component={Search} />
        <Route path="/auth" component={Auth} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/terms" component={Terms} />
        <Route path="/advertising-panel" component={ControlPanel} />
        <Route path="/control-panel" component={ControlPanel} />
        <Route path="/seo-panel" component={SEOPanel} />
        <Route path="/wp-admin" component={AdminLogin} />
        <Route path="/admin-login" component={AdminLogin} />
        <Route path="/analytics" component={Analytics} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/downloads" component={AdminDownloads} />
        <Route path="/admin/upload" component={AdminUpload} />
        
        {/* Show loading component for potential dynamic routes */}
        <Route component={() => <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-600">Loading...</div></div>} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Stores} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/deal/:id" component={DealDetails} />
      <Route path="/store33" component={Store33} />
      <Route path="/store44" component={Store44} />
      <Route path="/store55" component={Store55} />
      <VisibleRoute path="/videos" component={Videos} />
      <VisibleRoute path="/video2" component={Video2} />
      <VisibleRoute path="/posts" component={Posts} />
      <VisibleRoute path="/blogs" component={Blogs} />
      <VisibleRoute path="/directory" component={Directory} />
      <VisibleRoute path="/search" component={Search} />
      <Route path="/auth" component={Auth} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/advertising-panel" component={ControlPanel} />
      <Route path="/control-panel" component={ControlPanel} />
      <Route path="/seo-panel" component={SEOPanel} />
      <Route path="/wp-admin" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/downloads" component={AdminDownloads} />
      <Route path="/admin/upload" component={AdminUpload} />
      
      {/* Dynamic routes for duplicated pages */}
      {dynamicPages.map((setting: any) => (
        <Route 
          key={setting.pageUrl} 
          path={setting.pageUrl} 
          component={DynamicPage} 
        />
      ))}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function MainLayout() {
  const { showPopup, closePopup, settings } = useNewsletterPopup();
  
  return (
    <>
      <Router />
      {showPopup && settings?.isEnabled && (
        <NewsletterPopup onClose={closePopup} />
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <MainLayout />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
