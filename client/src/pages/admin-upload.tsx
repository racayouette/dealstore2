import { useState } from "react";
import { Upload, FileText, Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import TopNav from "@/components/top-nav";
import { ProtectedAdminRoute } from "@/components/protected-admin-route";
import { SubdomainSelector } from "@/components/subdomain-selector";

interface UploadResult {
  success: boolean;
  message: string;
  table?: string;
  recordsProcessed?: number;
  duplicatesSkipped?: number;
}

export default function AdminUpload() {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [selectedSubdomain, setSelectedSubdomain] = useState<string>("");
  const { toast } = useToast();

  const supportedTables = [
    "categories", "stores", "deals", "products", "video-channels", "posts", 
    "blogs", "business-categories", "businesses", "users"
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = async (files: File[]) => {
    const csvFiles = files.filter(file => file.name.toLowerCase().endsWith('.csv'));
    
    if (csvFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please upload only CSV files.",
        variant: "destructive",
      });
      return;
    }

    // if (!selectedSubdomain) {
    //   toast({
    //     title: "Subdomain Required",
    //     description: "Please select a subdomain before uploading files.",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    setUploading(true);
    setUploadResults([]);

    for (const file of csvFiles) {
      try {
        const result = await uploadFile(file);
        setUploadResults(prev => [...prev, result]);
      } catch (error) {
        setUploadResults(prev => [...prev, {
          success: false,
          message: `Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        }]);
      }
    }

    setUploading(false);
  };

  const uploadFile = async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('csv', file);
    if (selectedSubdomain) {
      formData.append('subdomainId', selectedSubdomain);
    }

    const response = await fetch('/api/admin/upload-csv', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  };

  const getTableFromFilename = (filename: string): string | null => {
    const baseName = filename.toLowerCase().replace('.csv', '');
    for (const table of supportedTables) {
      if (baseName.startsWith(table)) {
        return table;
      }
    }
    return null;
  };

  const totalRecordsProcessed = uploadResults.reduce((sum, result) => sum + (result.recordsProcessed || 0), 0);
  const totalDuplicatesSkipped = uploadResults.reduce((sum, result) => sum + (result.duplicatesSkipped || 0), 0);

  return (
    <ProtectedAdminRoute>
      <div className="min-h-screen bg-gray-50">
        <TopNav />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="title-upload">
                CSV File Upload
              </h1>
              <p className="text-gray-600">
                Upload CSV files to bulk import data into the database. Files will be automatically processed based on their filename prefix.
              </p>
            </div>

            {/* <div className="mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Settings</CardTitle>
                  <CardDescription>
                    Select the subdomain where the uploaded data will be associated
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubdomainSelector
                    value={selectedSubdomain}
                    onValueChange={setSelectedSubdomain}
                    includeAllOption={false}
                    label="Target Subdomain"
                    placeholder="Select subdomain for data import"
                  />
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      <strong>Required:</strong> You must select a subdomain before uploading files. 
                      All imported data will be associated with the selected subdomain.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div> */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Area */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5" />
                    <span>Upload CSV Files</span>
                  </CardTitle>
                  <CardDescription>
                    Drag and drop CSV files or click to select files for upload
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {uploading ? (
                      <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-600">Processing files...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">
                            Drop CSV files here
                          </p>
                          <p className="text-gray-600">or click to browse</p>
                        </div>
                        <input
                          type="file"
                          multiple
                          accept=".csv"
                          onChange={handleFileInput}
                          className="hidden"
                          id="file-upload"
                          data-testid="file-input"
                        />
                        <Button 
                          onClick={() => document.getElementById('file-upload')?.click()}
                          disabled={uploading}
                          data-testid="upload-button"
                        >
                          Select Files
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5" />
                    <span>File Naming Convention</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Files are automatically routed to the correct table based on the filename prefix:
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      {supportedTables.map((table) => (
                        <div key={table} className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {table}*.csv
                          </code>
                          <span className="text-gray-600">→ {table.replace('-', ' ')} table</span>
                        </div>
                      ))}
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        <strong>Example:</strong> "categories20250829.csv" will import to the categories table.
                        Duplicate records are automatically skipped based on unique identifiers.
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            {uploadResults.length > 0 && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Upload Results</CardTitle>
                  <CardDescription>
                    Summary of processed files and records
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{uploadResults.length}</div>
                        <div className="text-sm text-blue-600">Files Processed</div>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{totalRecordsProcessed}</div>
                        <div className="text-sm text-green-600">Records Added</div>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{totalDuplicatesSkipped}</div>
                        <div className="text-sm text-yellow-600">Duplicates Skipped</div>
                      </div>
                    </div>

                    {/* Detailed Results */}
                    <div className="space-y-2">
                      {uploadResults.map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            result.success 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          {result.success ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-red-600" />
                          )}
                          <div className="flex-1">
                            <p className={`font-medium ${
                              result.success ? 'text-green-900' : 'text-red-900'
                            }`}>
                              {result.message}
                            </p>
                            {result.success && result.table && (
                              <p className="text-sm text-gray-600">
                                Table: {result.table} | 
                                Records: {result.recordsProcessed} | 
                                Skipped: {result.duplicatesSkipped}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </ProtectedAdminRoute>
  );
}