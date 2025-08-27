import { useQuery } from "@tanstack/react-query";

export interface SiteSettings {
  id: string;
  siteName: string;
  siteDescription: string;
  affiliateDisclosure: string;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return response.json();
    },
    staleTime: Infinity, // Cache forever since site settings rarely change
    gcTime: Infinity, // Keep in cache forever
  });
}