import { Link } from "wouter";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import UserDropdown from "@/components/user-dropdown";

export default function UserMenu() {
  const { isAuthenticated, isLoading } = useAuth();

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
    <Link href="/auth">
      <Button 
        variant="ghost" 
        className="text-white hover:text-blue-200 hover:bg-blue-700"
        data-testid="button-login"
      >
        <User className="w-5 h-5" />
      </Button>
    </Link>
  );
}