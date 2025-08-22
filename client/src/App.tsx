import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stores" component={Stores} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/deal/:id" component={DealDetails} />
      <Route path="/videos" component={Videos} />
      <Route path="/video2" component={Video2} />
      <Route path="/posts" component={Posts} />
      <Route path="/blogs" component={Blogs} />
      <Route path="/directory" component={Directory} />
      <Route path="/auth" component={Auth} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
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
