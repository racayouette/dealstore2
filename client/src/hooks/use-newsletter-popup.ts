import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { NewsletterPopupSettings } from "@shared/schema";

export function useNewsletterPopup() {
  const [showPopup, setShowPopup] = useState(false);
  const [location] = useLocation();

  // Fetch popup settings
  const { data: settings } = useQuery<NewsletterPopupSettings>({
    queryKey: ['/api/newsletter/popup-settings'],
    queryFn: async () => {
      const response = await fetch('/api/newsletter/popup-settings');
      if (!response.ok) throw new Error('Failed to fetch popup settings');
      return response.json();
    },
  });

  useEffect(() => {
    if (!settings?.isEnabled) return;

    // Check if popup should show on current page
    const showOnPages = settings.showOnPages || [];
    const shouldShowOnThisPage = showOnPages.length === 0 || showOnPages.includes(location);

    if (!shouldShowOnThisPage) return;

    // Check frequency settings
    const frequency = settings.frequency || 'once_per_session';
    const storageKey = `newsletter_popup_${frequency}`;
    
    let shouldShow = false;
    
    switch (frequency) {
      case 'once_per_session':
        shouldShow = !sessionStorage.getItem(storageKey);
        break;
      case 'daily':
        const lastShown = localStorage.getItem(storageKey);
        const today = new Date().toDateString();
        shouldShow = !lastShown || lastShown !== today;
        break;
      case 'always':
        shouldShow = true;
        break;
      default:
        shouldShow = false;
    }

    if (shouldShow) {
      const delay = settings.showDelay || 5000;
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [settings, location]);

  const closePopup = () => {
    setShowPopup(false);
    
    if (!settings) return;

    // Mark popup as shown based on frequency
    const frequency = settings.frequency || 'once_per_session';
    const storageKey = `newsletter_popup_${frequency}`;
    
    switch (frequency) {
      case 'once_per_session':
        sessionStorage.setItem(storageKey, 'shown');
        break;
      case 'daily':
        const today = new Date().toDateString();
        localStorage.setItem(storageKey, today);
        break;
      // For 'always', we don't store anything so it shows every time
    }
  };

  return {
    showPopup,
    closePopup,
    settings,
  };
}