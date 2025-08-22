import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-net-dark text-white mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">NetDiscount</h3>
            <p className="text-gray-300 text-sm mb-4">
              Your destination for the best net deals, coupons, and discounts from top retailers.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <div className="space-y-2">
              <Link href="/category/computers" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-computers">
                Computers
              </Link>
              <Link href="/category/electronics" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-electronics">
                Electronics
              </Link>
              <Link href="/category/lifestyle-home" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-lifestyle">
                Lifestyle & Home
              </Link>
              <Link href="/category/small-business" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-business">
                Small Business
              </Link>
            </div>
          </div>

          {/* Popular Stores */}
          <div>
            <h4 className="font-semibold mb-4">Popular Stores</h4>
            <div className="space-y-2">
              <Link href="/stores/amazon" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-store-amazon">
                Amazon
              </Link>
              <Link href="/stores/dell" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-store-dell">
                Dell
              </Link>
              <Link href="/stores/hp" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-store-hp">
                HP
              </Link>
              <Link href="/stores/microsoft" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-store-microsoft">
                Microsoft
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <div className="space-y-2">
              <Link href="/contact" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-contact">
                Contact Us
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-about">
                About Us
              </Link>
              <Link href="/privacy" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-privacy">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-gray-300 hover:text-white text-sm" data-testid="footer-terms">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} NetDiscount. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
