import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VisibleRoute } from "@/components/visible-route";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Videos from "@/pages/videos";
import Video2 from "@/pages/video2";
import Posts from "@/pages/posts";
import Blogs from "@/pages/blogs";
import Directory from "@/pages/directory";
import Search from "@/pages/search";
import ControlPanel from "@/pages/control-panel";
import AdminLogin from "@/pages/admin-login";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <VisibleRoute path="/videos" component={Videos} />
      <VisibleRoute path="/video2" component={Video2} />
      <VisibleRoute path="/posts" component={Posts} />
      <VisibleRoute path="/blogs" component={Blogs} />
      <VisibleRoute path="/directory" component={Directory} />
      <VisibleRoute path="/search" component={Search} />
      <Route path="/advertising-panel" component={ControlPanel} />
      <Route path="/wp-admin" component={AdminLogin} />
      <Route path="/admin-login" component={AdminLogin} />
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
