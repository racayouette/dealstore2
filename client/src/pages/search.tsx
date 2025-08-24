import Header from "@/components/header";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { usePageTracking } from "@/hooks/use-page-tracking";

export default function SearchPage() {
  // Track page view for analytics
  usePageTracking("Search", "/search");

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Search" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-net-dark mb-2">Search Results</h1>
          <p className="text-gray-600">
            Find deals, stores, and more across our platform
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Search functionality coming soon</h3>
            <p className="text-gray-500">This page will display search results for deals, stores, and content</p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}