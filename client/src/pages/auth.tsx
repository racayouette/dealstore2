import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';
import Footer from '@/components/footer';
import type { SiteSettings } from '@shared/schema';

export default function Auth() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch site settings
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
  
  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        setLocation('/');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password,
        }),
      });

      if (response.ok) {
        setLocation('/');
      } else {
        const errorData = await response.text();
        setError(errorData || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
    } finally {
      setIsLoading(false);
    }
  };

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
              <h1 className="text-2xl font-bold" data-testid="title-auth">
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
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Auth Forms */}
            <div className="space-y-6">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to NetDiscount
                </h1>
                <p className="text-gray-600">
                  Sign in to access exclusive deals and personalized recommendations
                </p>
              </div>

              <Card className="w-full max-w-md mx-auto md:mx-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-center">Account Access</CardTitle>
                  <CardDescription className="text-center">
                    Sign in to your account or create a new one
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login" data-testid="tab-login">
                        Sign In
                      </TabsTrigger>
                      <TabsTrigger value="register" data-testid="tab-register">
                        Sign Up
                      </TabsTrigger>
                    </TabsList>

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <TabsContent value="login" className="space-y-4 mt-4">
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-username">Username</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="login-username"
                              type="text"
                              placeholder="Enter your username"
                              className="pl-10"
                              value={loginData.username}
                              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                              required
                              data-testid="input-login-username"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="login-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              value={loginData.password}
                              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                              required
                              data-testid="input-login-password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-password"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={isLoading}
                          data-testid="button-login"
                        >
                          {isLoading ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="register" className="space-y-4 mt-4">
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="register-username">Username</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="register-username"
                              type="text"
                              placeholder="Choose a username"
                              className="pl-10"
                              value={registerData.username}
                              onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                              required
                              data-testid="input-register-username"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="Enter your email"
                              className="pl-10"
                              value={registerData.email}
                              onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                              required
                              data-testid="input-register-email"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-password">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="register-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="pl-10 pr-10"
                              value={registerData.password}
                              onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                              required
                              data-testid="input-register-password"
                            />
                            <button
                              type="button"
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              onClick={() => setShowPassword(!showPassword)}
                              data-testid="button-toggle-register-password"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="register-confirm-password">Confirm Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                              id="register-confirm-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="pl-10"
                              value={registerData.confirmPassword}
                              onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                              required
                              data-testid="input-register-confirm-password"
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={isLoading}
                          data-testid="button-register"
                        >
                          {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Right side - Hero section */}
            <div className="space-y-6 text-center md:text-left">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Discover Amazing Tech Deals
                </h2>
                <p className="text-gray-600 text-lg">
                  Join thousands of smart shoppers who save money on the latest technology, 
                  gadgets, and electronics with our exclusive deals and coupons.
                </p>
              </div>

              <div className="grid gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                  <span className="text-gray-700">Exclusive member-only deals</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                  <span className="text-gray-700">Personalized recommendations</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                  <span className="text-gray-700">Price drop alerts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">✓</span>
                  </div>
                  <span className="text-gray-700">Early access to sales</span>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Save up to 70% on Tech
                </h3>
                <p className="text-blue-700 text-sm">
                  Members save an average of $200 per month on electronics, 
                  software, and digital services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}