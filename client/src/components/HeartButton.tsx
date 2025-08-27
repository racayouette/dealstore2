import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites";

interface HeartButtonProps {
  dealId: string;
  className?: string;
  size?: number;
}

export function HeartButton({ dealId, className, size = 20 }: HeartButtonProps) {
  const { data: favoriteData, isLoading } = useIsFavorite(dealId);
  const toggleFavorite = useToggleFavorite();
  
  const isFavorite = (favoriteData as any)?.isFavorite || false;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isLoading && !toggleFavorite.isPending) {
      toggleFavorite.mutate({ dealId, isFavorite });
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || toggleFavorite.isPending}
      className={cn(
        "p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-gray-300",
        className
      )}
      data-testid={`heart-button-${dealId}`}
    >
      <Heart
        size={size}
        className={cn(
          "transition-colors duration-200",
          isFavorite 
            ? "fill-red-500 text-red-500" 
            : "text-gray-400 hover:text-gray-600"
        )}
      />
    </button>
  );
}