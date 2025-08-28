import { Link } from "wouter";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import UserDropdown from "@/components/user-dropdown";

export default function UserMenu() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  // Handle click when not authenticated - ensure we go to auth page
  const handleLoginClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Clear any lingering session data
    logout();
    // Navigate to auth page
    window.location.href = '/auth';
  };

  if (isLoading) {
    return (
      <Button 
        variant="ghost" 
        className="text-white hover:text-blue-200 hover:bg-blue-700"
        disabled
      >
        <User className="w-5 h-5" />
      </Button>
    );
  }

  if (isAuthenticated) {
    return <UserDropdown />;
  }

  return (
    <Button 
      variant="ghost" 
      className="text-white hover:text-blue-200 hover:bg-blue-700"
      data-testid="button-login"
      onClick={handleLoginClick}
    >
      <User className="w-5 h-5" />
    </Button>
  );
}