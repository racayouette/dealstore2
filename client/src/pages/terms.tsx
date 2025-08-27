import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import type { SiteSettings } from "@shared/schema";

export default function TermsPage() {
  // Fetch site settings for dynamic site name
  const { data: siteSettings } = useQuery<SiteSettings>({
    queryKey: ['/api/site-settings'],
    queryFn: async () => {
      const response = await fetch('/api/site-settings');
      if (!response.ok) throw new Error('Failed to fetch site settings');
      return response.json();
    },
  });

  // Fetch visible pages for navigation
  const { data: visiblePages } = useQuery({
    queryKey: ['/api/visible-pages'],
    queryFn: async () => {
      const response = await fetch('/api/visible-pages');
      if (!response.ok) throw new Error('Failed to fetch visible pages');
      return response.json();
    },
  });

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Terms of Service" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Affiliate Disclosure */}
      <div className="bg-gray-100 py-1">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-gray-600">
            {siteSettings?.affiliateDisclosure || 'NetDiscount is supported by savers like you. When you buy through links on our site, we may earn an affiliate commission.'}
          </p>
        </div>
      </div>
      
      {/* Header */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold" data-testid="title-terms">
                {siteSettings?.siteName || 'NETDISCOUNT'}
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
                <a href="/" className="hover:text-blue-200 transition-colors">Home</a>
                {Array.isArray(visiblePages) && visiblePages.map((page) => (
                  <a
                    key={page.pageUrl}
                    href={page.pageUrl}
                    className="hover:text-blue-200 transition-colors"
                  >
                    {page.pageName}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-white hover:text-blue-200 hover:bg-blue-700">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-6">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: January 1, 2024
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p>
                Welcome to NetDiscount. These Terms of Service ("Terms") govern your access to and use of our website 
                netdiscount.com and our services (collectively, the "Service"). By accessing or using our Service, 
                you agree to be bound by these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
              <p>
                NetDiscount is a deal aggregation platform that provides users with information about discounts, 
                coupons, and promotional offers from various retailers. We also provide related content including 
                videos, blog posts, and business directory services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Account Creation</h3>
              <p>
                To access certain features, you may need to create an account. You must provide accurate and complete information 
                and keep your account information updated.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">Account Security</h3>
              <p>
                You are responsible for maintaining the confidentiality of your login credentials and for all activities 
                that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Post or transmit harmful, offensive, or inappropriate content</li>
                <li>Use automated systems to access the Service without permission</li>
                <li>Violate the rights of others, including intellectual property rights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Content and Intellectual Property</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Our Content</h3>
              <p>
                The Service and its content, including but not limited to text, graphics, logos, and software, 
                are owned by NetDiscount and are protected by copyright and other intellectual property laws.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">User-Generated Content</h3>
              <p>
                You retain ownership of content you post, but you grant us a worldwide, royalty-free license to 
                use, display, and distribute your content in connection with the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Affiliate Relationships</h2>
              <p>
                NetDiscount may receive compensation when you make purchases through links on our site. 
                This does not affect the price you pay for products or services. We are committed to providing 
                honest and unbiased information about deals and discounts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p>
                Our Service may integrate with or link to third-party services, websites, or applications. 
                We are not responsible for the content, policies, or practices of these third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Service Availability</h3>
              <p>
                We strive to maintain the Service but cannot guarantee continuous, uninterrupted access. 
                The Service is provided "as is" without warranties of any kind.
              </p>
              
              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">Deal Information</h3>
              <p>
                While we make efforts to provide accurate deal information, prices and availability may change. 
                We are not responsible for pricing errors or changes made by retailers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, NetDiscount shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <p>
                We may terminate or suspend your access to the Service at our discretion, with or without notice, 
                for violations of these Terms or for any other reason.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify users of material changes 
                by posting the updated Terms on our website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of the jurisdiction where 
                NetDiscount is incorporated, without regard to conflict of law principles.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>NetDiscount Legal Team</strong></p>
                <p>Email: legal@netdiscount.com</p>
                <p>Address: 123 Terms Avenue, Legal City, LC 12345</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}