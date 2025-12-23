import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Mail, Lock, User, Eye, EyeOff, AlertCircle, 
  Loader2, Phone, GraduationCap, Building2, Clock, MapPin, Sparkles
} from "lucide-react";
import { authApi } from "@shared/api";
import { saveAuth, getUserFromToken } from "@shared/auth";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import PublicNavbar from "@/components/PublicNavbar";
import Footer from "@/components/Footer";


const REGISTRATION_CODES = {
  professor: "PROF2025",
  studentAffair: "STAFF2025",
};

export default function SignUp({ onLogin }) {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    id: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: location.state?.role || "student",
    phoneNumber: "",
    major: "",
    departmentName: "",
    facultyName: "",
    officeHours: "",
    officeLocation: "",
    staffDepartment: "",
    registrationCode: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.role) {
      setFormData((prev) => ({ ...prev, role: location.state.role }));
    }
  }, [location.state]);

  const validateEmail = (email, role) => {
    const studentRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu$/;
    const professorRegex = /^[a-zA-Z0-9]+\.[a-zA-Z0-9]+@lau\.edu\.lb$/;

    if (role === "student") {
      return studentRegex.test(email);
    } else if (role === "doctor" || role === "studentAffair") {
      return professorRegex.test(email);
    }
    return false;
  };

  const getEmailHint = (role) => {
    if (role === "student") {
      return "firstname.lastname@lau.edu";
    }
    return "firstname.lastname@lau.edu.lb";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convert registration code to uppercase
    const processedValue = name === "registrationCode" ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      phoneNumber: "",
      major: "",
      departmentName: "",
      facultyName: "",
      officeHours: "",
      officeLocation: "",
      staffDepartment: "",
      registrationCode: "",
      }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id) {
      newErrors.id = "University ID is required";
    } else if (!/^\d{9}$/.test(formData.id)) {
      newErrors.id = "ID must be exactly 9 digits";
    }

    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email, formData.role)) {
      newErrors.email = `Email must be in format: ${getEmailHint(formData.role)}`;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.role === "doctor" && !formData.facultyName) {
      newErrors.facultyName = "Faculty name is required";
    }

    if (formData.role === "studentAffair" && !formData.staffDepartment) {
      newErrors.staffDepartment = "Department is required";
    }

    // Validate registration code for Professor and Student Affair
    if (formData.role === "doctor") {
      if (!formData.registrationCode) {
        newErrors.registrationCode = "Registration code is required";
      } else if (formData.registrationCode.toUpperCase() !== REGISTRATION_CODES.professor) {
        newErrors.registrationCode = "Invalid registration code";
      }
    }

    if (formData.role === "studentAffair") {
      if (!formData.registrationCode) {
        newErrors.registrationCode = "Registration code is required";
      } else if (formData.registrationCode.toUpperCase() !== REGISTRATION_CODES.studentAffair) {
        newErrors.registrationCode = "Invalid registration code";
      }
    }


      setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const backendRole = formData.role === "doctor" ? "professor" : formData.role === "studentAffair" ? "studentAffair" : formData.role;
      
      let requestBody = {};
      
      if (backendRole === "student") {
        requestBody = {
          studentID: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          universityMail: formData.email,
          password: formData.password,
          phoneNumber: formData.phoneNumber || null,
          major: formData.major || null,
          departmentName: formData.departmentName || null,
        };
      } else if (backendRole === "professor") {
        requestBody = {
          professorID: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          facultyName: formData.facultyName,
          password: formData.password,
          officeHours: formData.officeHours || null,
          officeLocation: formData.officeLocation || null,
        };
      } else if (backendRole === "studentAffair") {
        requestBody = {
          studentAffairsOfficerID: formData.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          staffDepartment: formData.staffDepartment,
          password: formData.password,
        };
      }

      const response = await authApi.register(backendRole, requestBody);
      
      if (response.success && response.token) {
        saveAuth(response.token);
        const user = await getUserFromToken(response.token);
        
        if (user) {
          const frontendRole = backendRole === "professor" ? "doctor" : backendRole === "studentAffair" ? "studentAffair" : backendRole;
          const userData = { ...user, role: frontendRole };

    onLogin(userData);
          toast.success("Account created successfully! 🎉");
    navigate("/");
        } else {
          throw new Error("Failed to load user profile");
        }
      } else {
        throw new Error(response.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error.message || "Registration failed. Please try again.";
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
      <div className="flex-1 flex overflow-auto p-4 relative z-10">
        <div className="w-full max-w-4xl mx-auto my-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6 animate-fade-in">
            <Link to="/" className="inline-flex items-center gap-3 mb-4 hover:opacity-80 transition-opacity">
              <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md">
                <img src="/logo.png" alt="BeyondBooks Logo" className="w-12 h-12" />
              </div>
              <span className="text-3xl font-bold text-[#4A70A9]">BeyondBooks</span>
            </Link>
          </div>

          {/* Signup Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-[#8FABD4]/30 p-8 animate-fade-in-up">
            {/* Logo Section - Desktop */}
            {/* <div className="hidden lg:flex flex-col items-center mb-6">
              <div className="relative mb-2">
                <img src="/logo.png" alt="BeyondBooks Logo" className="w-16 h-16 object-contain" />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-[#4A70A9] animate-pulse" />
                </div>
              </div>
            </div> */}

        {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
              <p className="text-gray-600">Join BeyondBooks and start your journey</p>
        </div>

            {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {[
                    { value: "student", label: "Student", icon: GraduationCap },
                    { value: "doctor", label: "Faculty", icon: User },
                    { value: "studentAffair", label: "Student Affair", icon: Building2 }
                  ].map(({ value, label, icon: Icon }) => (
                  <button
                      key={value}
                    type="button"
                      onClick={() => handleRoleChange(value)}
                      className={`relative flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg font-medium transition-all border ${
                        formData.role === value
                          ? "bg-gradient-to-br from-[#4A70A9] to-[#5A80B9] text-white border-[#4A70A9] shadow-md"
                          : "bg-white text-[#4A70A9] border-[#8FABD4] hover:bg-[#8FABD4]/20 hover:border-[#4A70A9]"
                    }`}
                  >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id" className="text-sm font-semibold text-gray-700">
                    University ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className={`w-5 h-5 transition-colors ${errors.id ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="id"
                      name="id"
                  type="text"
                      value={formData.id}
                  onChange={handleChange}
                      placeholder="123456789"
                      maxLength={9}
                      className={`pl-12 h-12 text-base ${errors.id ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
                  {errors.id && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.id}
                </p>
              )}
            </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className={`w-5 h-5 transition-colors ${errors.email ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="email"
                      name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={getEmailHint(formData.role)}
                      className={`pl-12 h-12 text-base ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {errors.email}
                </p>
              )}
            </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    className={`h-12 text-base ${errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    className={`h-12 text-base ${errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Student Specific Fields */}
              {formData.role === "student" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">Phone Number</Label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="w-5 h-5 text-gray-400 group-focus-within:text-[#4A70A9] transition-colors" />
                      </div>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+961 3 123456"
                        className="h-12 pl-12 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="major" className="text-sm font-semibold text-gray-700">Major</Label>
                    <Input
                      id="major"
                      name="major"
                      type="text"
                      value={formData.major}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className="h-12 text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departmentName" className="text-sm font-semibold text-gray-700">Department</Label>
                    <Input
                      id="departmentName"
                      name="departmentName"
                      type="text"
                      value={formData.departmentName}
                      onChange={handleChange}
                      placeholder="Engineering"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
              )}

              {/* Registration Code for Professor and Student Affair */}
              {(formData.role === "doctor" || formData.role === "studentAffair") && (
                <div className="space-y-2">
                  <Label htmlFor="registrationCode" className="text-sm font-semibold text-gray-700">
                    Registration Code <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.registrationCode ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="registrationCode"
                      name="registrationCode"
                      type="text"
                      value={formData.registrationCode}
                      onChange={handleChange}
                      placeholder={formData.role === "doctor" ? "Enter Professor code" : "Enter Student Affair code"}
                      className={`pl-12 h-12 text-base uppercase ${errors.registrationCode ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  {errors.registrationCode && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.registrationCode}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.role === "doctor" 
                      ? "Contact your administrator to obtain the Professor registration code."
                      : "Contact your administrator to obtain the Student Affair registration code."}
                  </p>
                </div>
              )}

              {/* Professor Specific Fields */}
              {formData.role === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="facultyName" className="text-sm font-semibold text-gray-700">
                      Faculty Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="facultyName"
                      name="facultyName"
                      type="text"
                      value={formData.facultyName}
                      onChange={handleChange}
                      placeholder="Computer Science"
                      className={`h-12 text-base ${errors.facultyName ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.facultyName && (
                      <p className="text-sm text-red-600 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> {errors.facultyName}
                      </p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="officeHours" className="text-sm font-semibold text-gray-700">Office Hours</Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 text-gray-400 group-focus-within:text-[#4A70A9] transition-colors" />
                        </div>
                        <Input
                          id="officeHours"
                          name="officeHours"
                          type="text"
                          value={formData.officeHours}
                          onChange={handleChange}
                          placeholder="Mon-Wed 10:00 AM - 12:00 PM"
                          className="h-12 pl-12 text-base"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="officeLocation" className="text-sm font-semibold text-gray-700">Office Location</Label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <MapPin className="w-5 h-5 text-gray-400 group-focus-within:text-[#4A70A9] transition-colors" />
                        </div>
                        <Input
                          id="officeLocation"
                          name="officeLocation"
                          type="text"
                          value={formData.officeLocation}
                          onChange={handleChange}
                          placeholder="Block A, Room 301"
                          className="h-12 pl-12 text-base"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Student Affair Specific Fields */}
              {formData.role === "studentAffair" && (
                <div className="space-y-2">
                  <Label htmlFor="staffDepartment" className="text-sm font-semibold text-gray-700">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="staffDepartment"
                    name="staffDepartment"
                    type="text"
                    value={formData.staffDepartment}
                    onChange={handleChange}
                    placeholder="Student Affairs"
                    className={`h-12 text-base ${errors.staffDepartment ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                  />
                  {errors.staffDepartment && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" /> {errors.staffDepartment}
                    </p>
                  )}
                </div>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.password ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                      className={`pl-12 pr-12 h-12 text-base ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {errors.password}
                </p>
              )}
            </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className={`w-5 h-5 transition-colors ${errors.confirmPassword ? "text-red-500" : "text-gray-400 group-focus-within:text-[#4A70A9]"}`} />
                    </div>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                      className={`pl-12 h-12 text-base ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                />
              </div>
              {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> {errors.confirmPassword}
                </p>
              )}
                </div>
              </div>

              {/* Error Message */}
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-start gap-3">
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
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
          </form>

            {/* Footer */}
          <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
              Already have an account?{" "}
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