import { Link } from "wouter";
import { Settings, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TopNav() {
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
            <Link href="/control-panel" className="hover:text-gray-200 transition-colors" data-testid="nav-control-panel">
              Control Panel
            </Link>
            <Link href="/admin/users" className="hover:text-gray-200 transition-colors" data-testid="nav-users">
              Users
            </Link>
            <Link href="/admin/content" className="hover:text-gray-200 transition-colors" data-testid="nav-content">
              Content
            </Link>
          </div>
          
          {/* Right side - User Menu */}
          <div className="flex items-center space-x-3">
            <Link href="/control-panel">
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
                <DropdownMenuItem data-testid="menu-settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="menu-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}