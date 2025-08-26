import { useState, useEffect } from "react";
import { X, Mail } from "lucide-react";
import { FaFacebook, FaGoogle, FaApple } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { NewsletterPopupSettings } from "@shared/schema";
import logoPath from "@/assets/logo.png";

interface NewsletterPopupProps {
  onClose: () => void;
}

export default function NewsletterPopup({ onClose }: NewsletterPopupProps) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Fetch popup settings
  const { data: settings } = useQuery<NewsletterPopupSettings>({
    queryKey: ['/api/newsletter/popup-settings'],
    queryFn: async () => {
      const response = await fetch('/api/newsletter/popup-settings');
      if (!response.ok) throw new Error('Failed to fetch popup settings');
      return response.json();
    },
  });

  // Newsletter subscription mutation
  const subscribeMutation = useMutation({
    mutationFn: async (data: { email: string; signupMethod: string }) => {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Subscription failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Subscription Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    await subscribeMutation.mutateAsync({ email, signupMethod: 'email' });
    setIsSubmitting(false);
  };

  const handleSocialSignup = async (provider: string) => {
    // For now, show a message that social signup is coming soon
    toast({
      title: "Coming Soon",
      description: `${provider} signup will be available soon. Please use email for now.`,
    });
  };

  const popupType = settings?.popupType || 'dark';

  // Dark theme popup (Design 1)
  const DarkThemePopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 rounded-lg shadow-2xl max-w-md w-full relative border border-slate-600">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <img src={logoPath} alt="Logo" className="mx-auto mb-4 h-12 w-auto" />
          <h2 className="text-2xl font-bold mb-2">Daily Deal Alerts</h2>
          <p className="text-lg mb-2">Take 50 to 90% off Top Brands at the Best Stores.</p>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" htmlFor="email">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-white text-black border-0"
              required
              data-testid="input-email"
            />
            <p className="text-xs text-gray-300 mt-1">Please enter your email address.</p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
            data-testid="button-submit"
          >
            {isSubmitting ? "Subscribing..." : "Submit"}
          </Button>
        </form>

        <div className="mt-4">
          <Button
            onClick={() => handleSocialSignup('Facebook')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 flex items-center justify-center gap-2"
            data-testid="button-facebook"
          >
            <FaFacebook className="w-5 h-5" />
            Sign Up with Facebook
          </Button>
        </div>

        <div className="text-center mt-6 text-xs text-gray-300">
          <p>The Privacy Policy is this:</p>
          <p>We don't share your email address with anyone, and we never will.</p>
        </div>
      </div>
    </div>
  );

  // Light theme popup (Design 2)
  const LightThemePopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white text-gray-800 p-8 rounded-lg shadow-2xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          data-testid="button-close-popup"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Unlock Expertly Chosen Deals</h2>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="email">
              * Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full border-gray-300 rounded-full px-4 py-3"
              required
              data-testid="input-email"
            />
            <p className="text-xs text-gray-500 mt-1">Please enter your email address.</p>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold py-3 rounded-full text-lg"
            data-testid="button-submit"
          >
            {isSubmitting ? "Subscribing..." : "Subscribe - It's Free"}
          </Button>
        </form>

        <div className="text-center my-4 text-gray-500">
          <div className="flex items-center">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm">or</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => handleSocialSignup('Google')}
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
            data-testid="button-google"
          >
            <FaGoogle className="w-5 h-5 text-red-500" />
            Sign Up with Google
          </Button>

          <Button
            onClick={() => handleSocialSignup('Facebook')}
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
            data-testid="button-facebook"
          >
            <FaFacebook className="w-5 h-5 text-blue-600" />
            Sign Up with Facebook
          </Button>

          <Button
            onClick={() => handleSocialSignup('Apple')}
            variant="outline"
            className="w-full py-3 flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50"
            data-testid="button-apple"
          >
            <FaApple className="w-5 h-5 text-black" />
            Sign Up with Apple
          </Button>
        </div>

        <div className="text-center mt-6 text-xs text-gray-500">
          <p>By logging in, you agree to Terms of Service and Privacy Policies.</p>
          <div className="mt-2 space-x-2">
            <a href="#" className="underline hover:text-gray-700">Terms of Service</a>
            <span>|</span>
            <a href="#" className="underline hover:text-gray-700">Privacy Policy</a>
            <span>|</span>
            <a href="#" className="underline hover:text-gray-700">Do Not Sell My Information</a>
          </div>
        </div>
      </div>
    </div>
  );

  return popupType === 'dark' ? <DarkThemePopup /> : <LightThemePopup />;
}