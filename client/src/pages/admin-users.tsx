import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import TopNav from "@/components/top-nav";
import Footer from "@/components/footer";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { 
  Users, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Calendar,
  Mail,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const usersPerPage = 10;

  // Fetch users with pagination
  const { 
    data: usersData, 
    isLoading, 
    error 
  } = useQuery<UsersResponse>({
    queryKey: ['/api/admin/users', currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?page=${currentPage}&limit=${usersPerPage}`);
      if (!response.ok) throw new Error('Failed to fetch users');
      return response.json();
    },
  });

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/admin/users/export');
      if (!response.ok) throw new Error('Failed to export users');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'users-export.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  if (error) {
    return (
      <ProtectedAdminRoute>
        <div className="min-h-screen bg-gray-50">
          <TopNav />
          <div className="container mx-auto px-4 py-8">
            <Alert>
              <AlertDescription>
                Failed to load users. Please try refreshing the page.
              </AlertDescription>
            </Alert>
          </div>
          <Footer />
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        
        <div className="container mx-auto px-4 py-4 md:py-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Users className="w-6 h-6 md:w-8 md:h-8 text-net-green" />
                  User Management
                </h1>
                <p className="text-sm md:text-base text-gray-600 mt-2">
                  View and manage registered users
                </p>
              </div>
              
              <Button 
                onClick={handleExportCSV}
                disabled={isExporting || isLoading}
                className="bg-net-green hover:bg-green-600 text-white self-start sm:self-auto"
                data-testid="button-export-csv"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900" data-testid="text-total-users">
                      {isLoading ? '...' : usersData?.total || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Page</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {currentPage} of {usersData?.totalPages || 1}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Per Page</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {usersPerPage}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Registered Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0 md:p-6">
              {isLoading ? (
                <div className="p-4 md:p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : usersData?.users.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">No registered users in the system yet.</p>
                </div>
              ) : (
                <>
                  {/* Mobile View */}
                  <div className="block md:hidden">
                    <div className="divide-y divide-gray-200">
                      {usersData?.users.map((user) => (
                        <div key={user.id} className="p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {user.username.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900" data-testid={`text-username-${user.id}`}>
                                  {user.username}
                                </p>
                                <div className="flex items-center gap-1 text-sm text-gray-600">
                                  <Mail className="w-3 h-3" />
                                  <span data-testid={`text-email-${user.id}`}>{user.email}</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              ID: {user.id.slice(0, 8)}...
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Created: {formatDate(user.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Updated: {formatDate(user.updatedAt)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-gray-200">
                        <tr>
                          <th className="text-left p-4 font-medium text-gray-900">User</th>
                          <th className="text-left p-4 font-medium text-gray-900">Email</th>
                          <th className="text-left p-4 font-medium text-gray-900">User ID</th>
                          <th className="text-left p-4 font-medium text-gray-900">Created</th>
                          <th className="text-left p-4 font-medium text-gray-900">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {usersData?.users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900" data-testid={`text-username-${user.id}`}>
                                    {user.username}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600" data-testid={`text-email-${user.id}`}>
                              {user.email}
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {user.id.slice(0, 8)}...
                              </Badge>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {formatDate(user.updatedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {usersData && usersData.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * usersPerPage) + 1} to{' '}
                {Math.min(currentPage * usersPerPage, usersData.total)} of{' '}
                {usersData.total} users
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, usersData.totalPages) }, (_, i) => {
                    let pageNum;
                    if (usersData.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= usersData.totalPages - 2) {
                      pageNum = usersData.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={currentPage === pageNum ? "bg-net-green hover:bg-green-600" : ""}
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(usersData.totalPages, prev + 1))}
                  disabled={currentPage === usersData.totalPages}
                  data-testid="button-next-page"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </ProtectedAdminRoute>
  );
}