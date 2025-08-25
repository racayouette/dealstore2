import { Link, useLocation } from "wouter";
import { Settings, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isAdminAuthenticated, getAdminSession, clearAdminSession } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNav() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const isAdmin = isAdminAuthenticated();
  const adminSession = getAdminSession();

  const handleLogout = () => {
    clearAdminSession();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
    setLocation('/wp-admin');
  };

  return (
    <nav className="bg-net-green text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Left side - Brand */}
          <Link href="/" className="text-lg font-semibold hover:text-gray-200" data-testid="nav-brand">
            NetDiscount Admin
          </Link>
          
          {/* Center - Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/advertising-panel" className="hover:text-gray-200 transition-colors" data-testid="nav-advertising-panel">
              Advertising Panel
            </Link>
            <Link href="/seo-panel" className="hover:text-gray-200 transition-colors" data-testid="nav-seo">
              SEO
            </Link>
            <Link href="/analytics" className="hover:text-gray-200 transition-colors" data-testid="nav-analytics">
              Analytics
            </Link>
            <Link href="/admin/users" className="hover:text-gray-200 transition-colors" data-testid="nav-users">
              Users
            </Link>
          </div>
          
          {/* Right side - User Menu */}
          <div className="flex items-center space-x-3">
            {isAdmin && (
              <>
                <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-net-green-dark rounded-full">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{adminSession?.username}</span>
                </div>
                
                <Link href="/advertising-panel">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-net-green-dark hover:text-white"
                    data-testid="nav-settings-button"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white hover:bg-net-green-dark hover:text-white"
                  data-testid="nav-user-menu"
                >
                  <User className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem data-testid="menu-profile">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuItem data-testid="menu-settings">
                      <Settings className="w-4 h-4 mr-2" />
                      Account Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-red-600" 
                      data-testid="menu-logout"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Admin Logout
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}