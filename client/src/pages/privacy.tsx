import { useQuery } from "@tanstack/react-query";
import Footer from "@/components/footer";
import Breadcrumb from "@/components/breadcrumb";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useSiteSettings } from "@/hooks/use-site-settings";

export default function PrivacyPage() {
  // Fetch site settings from global cache
  const { data: siteSettings } = useSiteSettings();

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
    { label: "Stores", href: "/" },
    { label: "Privacy Policy" }
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
              <h1 className="text-2xl font-bold" data-testid="title-privacy">
                {siteSettings?.siteName}
              </h1>
              <nav className="hidden md:flex items-center space-x-6">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          
          <div className="prose max-w-none text-gray-700 space-y-6">
            <p className="text-sm text-gray-500 mb-8">
              Effective Date: January 1, 2024
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
              <p>
                Welcome to NetDiscount ("we," "us," or "our"). We are committed to protecting your privacy and personal information. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website 
                netdiscount.com (the "Service").
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Personal Information</h3>
              <p>
                When you create an account or use our services, we may collect:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Username and email address</li>
                <li>Password (encrypted)</li>
                <li>Profile preferences and settings</li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">Usage Information</h3>
              <p>
                We automatically collect information about how you interact with our Service:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Pages visited and time spent on our site</li>
                <li>Search queries and preferences</li>
                <li>Device information and browser type</li>
                <li>IP address and general location data</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <p>We use your information to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Provide and maintain our Service</li>
                <li>Personalize your experience and deal recommendations</li>
                <li>Send newsletters and promotional communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Prevent fraud and ensure security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing Your Information</h2>
              <p>
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>With your explicit consent</li>
                <li>To comply with legal obligations</li>
                <li>To protect our rights and prevent fraud</li>
                <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                <li>In connection with a business transfer or merger</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p>
                We implement appropriate technical and organizational security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet 
                or electronic storage is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and personal information</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>File a complaint with regulatory authorities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookies and Tracking</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience on our Service. 
                You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Links</h2>
              <p>
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices 
                or content of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect personal 
                information from children under 13.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by 
                posting the new Privacy Policy on this page and updating the "Effective Date."
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p><strong>NetDiscount Privacy Team</strong></p>
                <p>Email: privacy@netdiscount.com</p>
                <p>Address: 123 Privacy Street, Data City, DC 12345</p>
              </div>
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}