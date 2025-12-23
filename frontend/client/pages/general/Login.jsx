import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2, Sparkles
} from "lucide-react";
import { authApi } from "@shared/api";
import { saveAuth, getUserFromToken } from "@shared/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const detectRoleFromEmail = (email) => {
    const studentRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu$/;
    const professorRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu\.lb$/;

    if (studentRegex.test(email)) {
      return "student";
    } else if (professorRegex.test(email)) {
      return "professor";
    }
    return null;
  };

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

    if (!password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const detectedRole = detectRoleFromEmail(email);
      
      if (!detectedRole) {
        throw new Error("Invalid email format. Please use firstname.lastname@lau.edu or firstname.lastname@lau.edu.lb");
      }

      const rolesToTry = detectedRole === "student" 
        ? ["student"] 
        : ["professor", "studentAffair"];

      let lastError = null;
      let successfulResponse = null;
      let successfulRole = null;

      for (const backendRole of rolesToTry) {
        try {
          const response = await authApi.login(backendRole, email, password);
          if (response && response.success && response.token) {
            successfulResponse = response;
            successfulRole = backendRole;
            break;
          }
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (successfulResponse && successfulResponse.token) {
        saveAuth(successfulResponse.token);
        const user = await getUserFromToken(successfulResponse.token);
        
        if (user) {
          const frontendRole = successfulRole === "professor" ? "doctor" : successfulRole === "studentAffair" ? "studentAffair" : successfulRole;
          const userData = {
            ...user,
            role: frontendRole,
          };
          
          onLogin(userData);
          toast.success("Welcome back! 🎉");
          navigate("/");
        } else {
          throw new Error("Failed to load user profile");
        }
      } else {
        throw new Error(lastError?.message || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.message || "Invalid credentials. Please try again.";
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
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="BeyondBooks Logo" className="w-12 h-12" />
              </div>
              <span className="text-3xl font-bold text-[#4A70A9]">BeyondBooks</span>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#8FABD4]/30 p-8 animate-fade-in-up">
            {/* Logo Section - Desktop */}
            {/* <div className="hidden lg:flex flex-col items-center mb-8">
              <div className="relative mb-4">
                <img src="/logo.png" alt="BeyondBooks Logo" className="w-20 h-20 object-contain" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-[#4A70A9] animate-pulse" />
                </div>
              </div>
            </div> */}

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-gray-600">Sign in to continue your journey</p>
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

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-[#4A70A9] hover:text-[#3A60A9] transition-colors font-medium"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className={`w-5 h-5 transition-colors ${errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }
                    }}
                    placeholder="Enter your password"
                    className={`pl-12 pr-12 h-12 text-base transition-all ${
                      errors.password 
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
                {errors.password && (
                  <p className="text-sm text-red-600 flex items-center gap-1.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4" /> {errors.password}
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <Link 
                  to="/signup" 
                  className="font-semibold text-[#4A70A9] hover:text-[#3A60A9] transition-colors underline-offset-4 hover:underline"
                >
                  Create one now
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