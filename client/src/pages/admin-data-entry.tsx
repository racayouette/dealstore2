import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Plus, 
  Trash2, 
  Edit, 
  ChevronLeft, 
  ChevronRight,
  Database
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import TopNav from "@/components/top-nav";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";

interface TableInfo {
  name: string;
  displayName: string;
  primaryKey: string;
}

interface TableRow {
  [key: string]: any;
}

interface PaginatedResponse {
  data: TableRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export default function AdminDataEntry() {
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Available tables list (sorted A-Z)
  const tables: TableInfo[] = [
    { name: "advertisement_banners", displayName: "Advertisement Banners", primaryKey: "id" },
    { name: "banner_settings", displayName: "Banner Settings", primaryKey: "id" },
    { name: "blogs", displayName: "Blogs", primaryKey: "id" },
    { name: "business_categories", displayName: "Business Categories", primaryKey: "id" },
    { name: "business_hours", displayName: "Business Hours", primaryKey: "id" },
    { name: "business_photos", displayName: "Business Photos", primaryKey: "id" },
    { name: "business_reviews", displayName: "Business Reviews", primaryKey: "id" },
    { name: "businesses", displayName: "Businesses", primaryKey: "id" },
    { name: "categories", displayName: "Categories", primaryKey: "id" },
    { name: "click_thru", displayName: "Click Through", primaryKey: "id" },
    { name: "deals", displayName: "Deals", primaryKey: "id" },
    { name: "newsletter_popup_settings", displayName: "Newsletter Popup Settings", primaryKey: "id" },
    { name: "newsletter_subscribers", displayName: "Newsletter Subscribers", primaryKey: "id" },
    { name: "page_views", displayName: "Page Views", primaryKey: "id" },
    { name: "posts", displayName: "Posts", primaryKey: "id" },
    { name: "products", displayName: "Products", primaryKey: "id" },
    { name: "site_settings", displayName: "Site Settings", primaryKey: "id" },
    { name: "stores", displayName: "Stores", primaryKey: "id" },
    { name: "user_favorites", displayName: "User Favorites", primaryKey: "id" },
    { name: "users", displayName: "Users", primaryKey: "id" },
    { name: "video_channels", displayName: "Video Channels", primaryKey: "id" },
    { name: "youtube_videos", displayName: "YouTube Videos", primaryKey: "id" }
  ];

  // Fetch table data with pagination
  const { data: tableData, isLoading } = useQuery<PaginatedResponse>({
    queryKey: ['/api/admin/table-data', selectedTable, currentPage],
    queryFn: async () => {
      const response = await fetch(`/api/admin/table-data/${selectedTable}?page=${currentPage}&pageSize=10`);
      if (!response.ok) throw new Error('Failed to fetch table data');
      return response.json();
    },
    enabled: !!selectedTable,
  });

  // Fetch table schema for form generation
  const { data: tableSchema } = useQuery<any>({
    queryKey: ['/api/admin/table-schema', selectedTable],
    queryFn: async () => {
      const response = await fetch(`/api/admin/table-schema/${selectedTable}`);
      if (!response.ok) throw new Error('Failed to fetch table schema');
      return response.json();
    },
    enabled: !!selectedTable,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        const response = await fetch(`/api/admin/table-data/${selectedTable}/${id}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Delete failed');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/table-data', selectedTable] });
      setSelectedRows([]);
      toast({
        title: "Success",
        description: `Deleted ${selectedRows.length} record(s) successfully.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete records: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Add mutation
  const addMutation = useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const response = await fetch(`/api/admin/table-data/${selectedTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Add failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/table-data', selectedTable] });
      setShowAddDialog(false);
      setFormData({});
      toast({
        title: "Success",
        description: "Record added successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, any> }) => {
      const response = await fetch(`/api/admin/table-data/${selectedTable}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/table-data', selectedTable] });
      setShowEditDialog(false);
      setEditingRow(null);
      setFormData({});
      toast({
        title: "Success",
        description: "Record updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update record: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  });

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSelectedRows([]);
    setCurrentPage(1);
  };

  const handleRowSelect = (rowId: string, checked: boolean) => {
    if (checked) {
      setSelectedRows([...selectedRows, rowId]);
    } else {
      setSelectedRows(selectedRows.filter(id => id !== rowId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && tableData?.data) {
      const allIds = tableData.data.map(row => row.id);
      setSelectedRows(allIds);
    } else {
      setSelectedRows([]);
    }
  };

  const handleDelete = () => {
    if (selectedRows.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedRows.length} record(s)?`)) {
      deleteMutation.mutate(selectedRows);
    }
  };

  const handleEditRow = (row: TableRow) => {
    setEditingRow(row);
    setFormData({ ...row });
    setShowEditDialog(true);
  };

  const handleAddRecord = () => {
    setFormData({});
    setShowAddDialog(true);
  };

  const handleFormSubmit = () => {
    if (editingRow) {
      updateMutation.mutate({ id: editingRow.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  const renderFormFields = () => {
    if (!tableSchema) return null;

    return Object.entries(tableSchema).map(([field, config]: [string, any]) => {
      if (field === 'id' && editingRow) return null; // Don't edit ID in update mode

      return (
        <div key={field} className="space-y-2">
          <Label htmlFor={field}>{field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
          {config.type === 'boolean' ? (
            <div className="flex items-center space-x-2">
              <Checkbox
                id={field}
                checked={formData[field] || false}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, [field]: Boolean(checked) })
                }
                data-testid={`input-${field}`}
              />
            </div>
          ) : config.type === 'text' || config.type === 'textarea' ? (
            <Textarea
              id={field}
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              placeholder={`Enter ${field}`}
              data-testid={`input-${field}`}
            />
          ) : (
            <Input
              id={field}
              type={config.type === 'number' ? 'number' : 'text'}
              value={formData[field] || ''}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              placeholder={`Enter ${field}`}
              data-testid={`input-${field}`}
            />
          )}
        </div>
      );
    });
  };

  return (
    <ProtectedAdminRoute>
      <TopNav />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DataEntry</h1>
          <p className="text-gray-600">Manage database tables and records</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Table List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Tables
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-1">
                  {tables.map((table) => (
                    <button
                      key={table.name}
                      onClick={() => handleTableSelect(table.name)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors
                        ${selectedTable === table.name 
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
                          : 'hover:bg-gray-100'
                        }`}
                      data-testid={`table-${table.name}`}
                    >
                      {table.displayName}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Content - Data Grid */}
          <div className="lg:col-span-3">
            {selectedTable ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>
                      {tables.find(t => t.name === selectedTable)?.displayName} Data
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleAddRecord}
                        className="bg-green-600 hover:bg-green-700"
                        data-testid="button-add"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                      <Button 
                        onClick={handleDelete}
                        disabled={selectedRows.length === 0}
                        variant="destructive"
                        data-testid="button-delete"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedRows.length})
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">Loading...</div>
                  ) : tableData?.data ? (
                    <>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={tableData.data.length > 0 && selectedRows.length === tableData.data.length}
                                  onCheckedChange={handleSelectAll}
                                  data-testid="select-all"
                                />
                              </TableHead>
                              {tableData.data.length > 0 && Object.keys(tableData.data[0]).slice(0, 5).map((column) => (
                                <TableHead key={column}>
                                  {column.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </TableHead>
                              ))}
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {tableData.data.map((row) => (
                              <TableRow key={row.id}>
                                <TableCell>
                                  <Checkbox
                                    checked={selectedRows.includes(row.id)}
                                    onCheckedChange={(checked) => handleRowSelect(row.id, Boolean(checked))}
                                    data-testid={`select-row-${row.id}`}
                                  />
                                </TableCell>
                                {Object.entries(row).slice(0, 5).map(([key, value]) => (
                                  <TableCell key={key} className="max-w-xs truncate">
                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                     typeof value === 'object' && value !== null ? JSON.stringify(value) :
                                     String(value || '')}
                                  </TableCell>
                                ))}
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditRow(row)}
                                    data-testid={`edit-row-${row.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {tableData.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * tableData.pageSize) + 1} to {Math.min(currentPage * tableData.pageSize, tableData.total)} of {tableData.total} records
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              data-testid="pagination-prev"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <span className="flex items-center px-3 text-sm">
                              Page {currentPage} of {tableData.totalPages}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === tableData.totalPages}
                              data-testid="pagination-next"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">No data found</div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center py-16">
                  <div className="text-center">
                    <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Table</h3>
                    <p className="text-gray-500">Choose a table from the left to view and manage its data</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Add Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderFormFields()}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleFormSubmit}
                  disabled={addMutation.isPending}
                  data-testid="button-submit-add"
                >
                  {addMutation.isPending ? 'Adding...' : 'Add'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  data-testid="button-cancel-add"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderFormFields()}
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleFormSubmit}
                  disabled={updateMutation.isPending}
                  data-testid="button-submit-edit"
                >
                  {updateMutation.isPending ? 'Updating...' : 'Update'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  data-testid="button-cancel-edit"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}