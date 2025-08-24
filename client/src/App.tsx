import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VisibleRoute } from "@/components/visible-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Stores from "@/pages/stores";
import Category from "@/pages/category";
import DealDetails from "@/pages/deal-details";
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
import AdminLogin from "@/pages/admin-login";
import Analytics from "@/pages/analytics";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stores" component={Stores} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/deal/:id" component={DealDetails} />
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
      <Route path="/wp-admin" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
