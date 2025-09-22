
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import Logo from "@assets/logo-removebg-preview_1757943248494.png";

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState("");
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Get phone number from URL params or localStorage
  const phoneNumber = new URLSearchParams(window.location.search).get('phone') || 
                     localStorage.getItem('otpPhone') || '';

  useEffect(() => {
    if (!phoneNumber) {
      setLocation('/login');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phoneNumber, setLocation]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError("");
    
    // Auto-submit when OTP is complete
    if (value.length === 6) {
      handleVerifyOTP(value);
    }
  };

  const handleVerifyOTP = async (otpValue: string = otp) => {
    if (otpValue.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otpValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "Phone number verified successfully!",
        });
        
        // Clear stored phone number
        localStorage.removeItem('otpPhone');
        
        // Redirect based on context (login/signup)
        const redirectTo = localStorage.getItem('otpRedirect') || '/';
        localStorage.removeItem('otpRedirect');
        setLocation(redirectTo);
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "OTP Sent",
          description: "A new OTP has been sent to your phone number.",
        });
        
        // Reset countdown
        setCountdown(30);
        setCanResend(false);
      } else {
        setError(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedPhone = phoneNumber.replace(/(\d{2})(\d{4})(\d{4})/, '$1****$3');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/">
            <img
              src={Logo}
              alt="BookLoop"
              className="h-20 w-auto cursor-pointer mx-auto"
            />
          </Link>
          <p className="text-muted-foreground mt-4">
            Verify your phone number
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">
              Enter OTP
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              We've sent a 6-digit code to {maskedPhone}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={handleOTPChange}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200 w-full text-center">
                  {error}
                </div>
              )}

              <Button
                onClick={() => handleVerifyOTP()}
                className="w-full"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                
                {canResend ? (
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="p-0 h-auto"
                  >
                    {isResending ? "Sending..." : "Resend OTP"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Resend in {countdown}s
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/login">
            <Button variant="ghost" className="text-muted-foreground">
              ← Back to Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
