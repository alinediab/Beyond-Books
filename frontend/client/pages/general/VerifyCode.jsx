import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "@shared/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  useEffect(() => {
    if (!email) {
      // Redirect to forgot password if no email in state
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!code) {
      newErrors.code = "Reset code is required";
    } else if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      newErrors.code = "Code must be 6 digits";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.verifyResetCode(email, code);
      if (response && response.success) {
        setIsVerified(true);
        toast.success("Code verified successfully! ✓");
        // Navigate to reset password page after a short delay
        setTimeout(() => {
          navigate("/reset-password", { state: { email, code } });
        }, 1000);
      } else {
        throw new Error(response?.message || "Invalid or expired code");
      }
    } catch (error) {
      console.error("Verify code error:", error);
      const errorMessage = error.message || "Invalid or expired code. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFECE3] via-[#F5F3EE] to-[#EFECE3] flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#8FABD4]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#4A70A9]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Navbar */}
      <PublicNavbar />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Verify Code Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#8FABD4]/30 p-8 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Reset Code</h1>
              <p className="text-gray-600">Enter the 6-digit code sent to</p>
              <p className="text-sm font-medium text-[#4A70A9] mt-1">{email}</p>
            </div>

            {isVerified ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-fade-in" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Code Verified!</p>
                <p className="text-sm text-gray-600">Redirecting to reset password...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Code Field */}
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-semibold text-gray-700">
                    Reset Code
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 transition-colors ${errors.code ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => {
                        // Only allow digits and limit to 6 characters
                        const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                        setCode(value);
                        if (errors.code) {
                          setErrors((prev) => ({ ...prev, code: "" }));
                        }
                      }}
                      placeholder="000000"
                      maxLength={6}
                      className={`pl-12 h-12 text-base text-center text-2xl tracking-widest font-mono transition-all ${
                        errors.code 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : "border-gray-300 focus-visible:ring-[#4A70A9] focus-visible:border-[#4A70A9]"
                      }`}
                    />
                  </div>
                  {errors.code && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
                      <AlertCircle className="w-4 h-4" /> {errors.code}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Check your email for the 6-digit code. It expires in 15 minutes.
                  </p>
                </div>

                {/* Error Message */}
                {errors.general && (
                  <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 flex-1">{errors.general}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || code.length !== 6}
                  className="w-full h-12 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] hover:from-[#3A60A9] hover:to-[#4A70A9] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>
            )}

            {/* Footer */}
            {!isVerified && (
              <div className="mt-6 text-center space-y-2">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center gap-2 text-sm text-[#4A70A9] hover:text-[#3A60A9] transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Link>
                <p className="text-sm text-gray-600">
                  Didn't receive the code?{" "}
                  <Link 
                    to="/forgot-password" 
                    className="font-semibold text-[#4A70A9] hover:text-[#3A60A9] transition-colors underline-offset-4 hover:underline"
                  >
                    Request a new one
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}


