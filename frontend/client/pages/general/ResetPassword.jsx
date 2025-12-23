import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { authApi } from "@shared/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};

  useEffect(() => {
    if (!email || !code) {
      // Redirect to forgot password if no email or code in state
      navigate("/forgot-password");
    }
  }, [email, code, navigate]);

  const validatePassword = (password) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      newErrors.newPassword = passwordError;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.resetPassword(email, code, newPassword);
      if (response && response.success) {
        setIsSuccess(true);
        toast.success("Password reset successfully! 🎉");
        // Navigate to login page after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        throw new Error(response?.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      const errorMessage = error.message || "Failed to reset password. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email || !code) {
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
          {/* Reset Password Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#8FABD4]/30 p-8 animate-fade-in-up">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-600">Enter your new password</p>
            </div>

            {isSuccess ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4 animate-fade-in" />
                <p className="text-lg font-semibold text-gray-900 mb-2">Password Reset Successful!</p>
                <p className="text-sm text-gray-600">Redirecting to login...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-700">
                    New Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.newPassword ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (errors.newPassword) {
                          setErrors((prev) => ({ ...prev, newPassword: "" }));
                        }
                      }}
                      placeholder="Enter new password"
                      className={`pl-12 pr-12 h-12 text-base transition-all ${
                        errors.newPassword 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : "border-gray-300 focus-visible:ring-[#4A70A9] focus-visible:border-[#4A70A9]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#4A70A9] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
                      <AlertCircle className="w-4 h-4" /> {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.confirmPassword ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                        }
                      }}
                      placeholder="Confirm new password"
                      className={`pl-12 pr-12 h-12 text-base transition-all ${
                        errors.confirmPassword 
                          ? "border-red-500 focus-visible:ring-red-500" 
                          : "border-gray-300 focus-visible:ring-[#4A70A9] focus-visible:border-[#4A70A9]"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-[#4A70A9] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
                      <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
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
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {/* Footer */}
            {!isSuccess && (
              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-[#4A70A9] hover:text-[#3A60A9] transition-colors font-medium"
                >
                  Back to Login
                </Link>
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


