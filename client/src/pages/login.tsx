import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, BookOpen } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Logo from "@assets/logo-removebg-preview_1757943248494.png";
export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone: "",
  });
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (loginMethod === 'phone') {
        // Send OTP for phone login
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phone: formData.phone }),
        });

        if (response.ok) {
          localStorage.setItem('otpPhone', formData.phone);
          localStorage.setItem('otpRedirect', '/');
          setLocation(`/otp-verification?phone=${encodeURIComponent(formData.phone)}`);
        } else {
          const data = await response.json();
          setError(data.error || "Failed to send OTP");
        }
      } else {
        const success = await login(formData.email, formData.password);

        if (success) {
          console.log("Login successful");
          setLocation("/"); // Redirect to home page
        } else {
          setError("Invalid email or password");
        }
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Link href="/">
                <img
                  src={Logo}
                  alt="BookLoop"
                  className="h-20 w-auto cursor-pointer"
                  data-testid="logo"
                />
              </Link>
            </div>
          </Link>
          <p className="text-muted-foreground">Welcome back! Please sign in to your account</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2 mb-4">
              <Button
                type="button"
                variant={loginMethod === 'email' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoginMethod('email')}
              >
                Email
              </Button>
              <Button
                type="button"
                variant={loginMethod === 'phone' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setLoginMethod('phone')}
              >
                Phone
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {loginMethod === 'email' ? (
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    required
                    className="h-11"
                  />
                </div>
              )}

              {loginMethod === 'email' && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : (loginMethod === 'phone' ? "Send OTP" : "Sign In")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {loginMethod === 'email' && (
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link href="/signup">
                    <Button variant="link" className="p-0 h-auto font-semibold">
                      Sign up
                    </Button>
                  </Link>
                </p>
              )}
            </div>

          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}