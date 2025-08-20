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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stores" component={Stores} />
      <Route path="/category/:slug" component={Category} />
      <Route path="/deal/:id" component={DealDetails} />
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
