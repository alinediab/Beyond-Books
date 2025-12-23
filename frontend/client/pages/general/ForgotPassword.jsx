import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { authApi } from "@shared/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const studentRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu$/;
    const professorRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu\.lb$/;
    return studentRegex.test(email) || professorRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.requestPasswordReset(email);
      if (response && response.success) {
        toast.success("Reset code sent to your email! 📧");
        // Navigate to verify code page with email in state
        navigate("/verify-code", { state: { email } });
      } else {
        throw new Error(response?.message || "Failed to send reset code");
      }
    } catch (error) {
      console.error("Request reset error:", error);
      const errorMessage = error.message || "Failed to send reset code. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Forgot Password Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#8FABD4]/30 p-8 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
              <p className="text-gray-600">Enter your email to receive a reset code</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                  Email Address
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className={`w-5 h-5 transition-colors ${errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                    placeholder="firstname.lastname@lau.edu"
                    className={`pl-12 h-12 text-base transition-all ${
                      errors.email 
                        ? "border-red-500 focus-visible:ring-red-500" 
                        : "border-gray-300 focus-visible:ring-[#4A70A9] focus-visible:border-[#4A70A9]"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
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
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#4A70A9] to-[#5A80B9] hover:from-[#3A60A9] hover:to-[#4A70A9] text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center space-y-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-[#4A70A9] hover:text-[#3A60A9] transition-colors font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Link>
              <p className="text-sm text-gray-600">
                Remember your password?{" "}
                <Link 
                  to="/login" 
                  className="font-semibold text-[#4A70A9] hover:text-[#3A60A9] transition-colors underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}

