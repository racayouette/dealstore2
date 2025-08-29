import { useState } from "react";
import { Download, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/top-nav";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";

export default function AdminDownloads() {
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const csvTemplates = [
    {
      name: "Categories",
      description: "Template for product categories with parent-child relationships",
      endpoint: "/api/admin/csv-templates/categories",
      filename: "categories_template.csv"
    },
    {
      name: "Stores",
      description: "Template for retail stores with logos and website URLs",
      endpoint: "/api/admin/csv-templates/stores",
      filename: "stores_template.csv"
    },
    {
      name: "Deals",
      description: "Template for product deals with pricing and discount information",
      endpoint: "/api/admin/csv-templates/deals",
      filename: "deals_template.csv"
    },
    {
      name: "Products",
      description: "Template for products with brand, model, and SKU information",
      endpoint: "/api/admin/csv-templates/products",
      filename: "products_template.csv"
    },
    {
      name: "Video Channels",
      description: "Template for YouTube channels and video content",
      endpoint: "/api/admin/csv-templates/video-channels",
      filename: "video_channels_template.csv"
    },
    {
      name: "Posts",
      description: "Template for social media posts and content",
      endpoint: "/api/admin/csv-templates/posts",
      filename: "posts_template.csv"
    },
    {
      name: "Blogs",
      description: "Template for blog articles and content",
      endpoint: "/api/admin/csv-templates/blogs",
      filename: "blogs_template.csv"
    },
    {
      name: "Business Categories",
      description: "Template for business directory categories",
      endpoint: "/api/admin/csv-templates/business-categories",
      filename: "business_categories_template.csv"
    },
    {
      name: "Businesses",
      description: "Template for business directory listings with location data",
      endpoint: "/api/admin/csv-templates/businesses",
      filename: "businesses_template.csv"
    }
  ];

  const handleDownload = async (template: typeof csvTemplates[0]) => {
    setDownloadingFiles(prev => new Set(prev).add(template.name));

    try {
      const response = await fetch(template.endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to download ${template.name} template`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = template.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${template.name} template downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: `Failed to download ${template.name} template. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(template.name);
        return newSet;
      });
    }
  };

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-downloads">
                CSV Template Downloads
              </h1>
              <p className="text-gray-600">
                Download CSV template files for bulk importing data into the database tables.
              </p>
            </div>

            <Alert className="mb-8">
              <Database className="h-4 w-4" />
              <AlertDescription>
                These template files contain the proper column headers and sample data to help you format your data correctly for bulk imports.
                Each template corresponds to a specific database table in the system.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {csvTemplates.map((template) => (
                <Card key={template.name} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                    </div>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleDownload(template)}
                      disabled={downloadingFiles.has(template.name)}
                      className="w-full"
                      data-testid={`download-${template.name.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {downloadingFiles.has(template.name) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-2" />
                          Download Template
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Use CSV Templates</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Download the template file for the data type you want to import</li>
                <li>Open the CSV file in Excel, Google Sheets, or any spreadsheet application</li>
                <li>Fill in your data following the column format and data types shown</li>
                <li>Save the file as CSV format when ready to upload</li>
                <li>Use the appropriate import functionality to upload your data</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}