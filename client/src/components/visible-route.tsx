import { useQuery } from "@tanstack/react-query";
import { Route } from "wouter";
import NotFound from "@/pages/not-found";
import type { BannerSettings } from "@shared/schema";

interface VisibleRouteProps {
  path: string;
  component: () => React.JSX.Element;
}

export function VisibleRoute({ path, component: Component }: VisibleRouteProps) {
  const { data: visiblePages = [], isLoading } = useQuery<BannerSettings[]>({
    queryKey: ["/api/visible-pages"],
    queryFn: async () => {
      const response = await fetch("/api/visible-pages");
      return response.json();
    },
  });

  // If still loading, render nothing to avoid flicker
  if (isLoading) {
    return <Route path={path} component={() => <div />} />;
  }

  // Check if this page is visible
  const isVisible = visiblePages.some(page => page.pageUrl === path);

  // If page is not visible, render a 404 instead and don't include it in DOM
  if (!isVisible) {
    return <Route path={path} component={NotFound} />;
  }

  // Page is visible, render the component normally
  return <Route path={path} component={Component} />;
}