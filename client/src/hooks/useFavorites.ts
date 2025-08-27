import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Simple user identifier for this demo - in production this would come from auth
function getUserId(): string {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

export function useFavorites() {
  const userId = getUserId();
  
  return useQuery({
    queryKey: [`/api/favorites/${userId}`],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${userId}`);
      if (!response.ok) throw new Error('Failed to fetch favorites');
      return response.json();
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const userId = getUserId();
  
  return useMutation({
    mutationFn: async ({ dealId, isFavorite }: { dealId: string, isFavorite: boolean }) => {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch('/api/favorites', {
          method: 'DELETE',
          body: JSON.stringify({ userId, dealId }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to remove favorite');
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          body: JSON.stringify({ userId, dealId }),
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to add favorite');
      }
    },
    onSuccess: (_, { dealId }) => {
      // Invalidate both the general favorites list and the specific deal's favorite status
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/${userId}/${dealId}`] });
    }
  });
}

export function useIsFavorite(dealId: string) {
  const userId = getUserId();
  
  return useQuery({
    queryKey: [`/api/favorites/${userId}/${dealId}`],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${userId}/${dealId}`);
      if (!response.ok) throw new Error('Failed to check favorite status');
      return response.json();
    },
  });
}