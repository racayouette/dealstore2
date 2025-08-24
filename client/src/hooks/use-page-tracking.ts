import { useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

/**
 * Custom hook to automatically track page views
 * Sends page view data to the backend when component mounts
 */
export function usePageTracking(pageName: string, pageUrl: string) {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await apiRequest('POST', '/api/page-views', {
          pageName,
          pageUrl,
          userAgent: navigator.userAgent,
        });
      } catch (error) {
        // Silently fail page tracking to avoid disrupting user experience
        console.warn('Failed to track page view:', error);
      }
    };

    // Track page view when component mounts
    trackPageView();
  }, [pageName, pageUrl]);
}