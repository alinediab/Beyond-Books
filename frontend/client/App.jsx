import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { getToken, getStoredUser, getUserFromToken, clearAuth } from "@shared/auth";

// General Pages
import Login from "./pages/general/Login";
import SignUp from "./pages/general/SignUp";
import Landing from "./pages/general/Landing";
import AboutUs from "./pages/general/AboutUs";
import Features from "./pages/general/Features";
import Contact from "./pages/general/Contact";
import NotFound from "./pages/general/NotFound";
import ForgotPassword from "./pages/general/ForgotPassword";
import VerifyCode from "./pages/general/VerifyCode";
import ResetPassword from "./pages/general/ResetPassword";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import Clubs from "./pages/student/Clubs";
import Events from "./pages/student/Events";
import ResearchProjects from "./pages/student/ResearchProjects";
import MyApplications from "./pages/student/MyApplications";
import LostAndFound from "./pages/student/LostAndFound";
import Internships from "./pages/student/Internships";

// Doctor Pages
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorMyProjects from "./pages/doctor/DoctorMyProjects";
import DoctorApplications from "./pages/doctor/DoctorApplications";
import DoctorAnalytics from "./pages/doctor/DoctorAnalytics";

// StudentAffair Pages
import StudentAffairDashboard from "./pages/studentAffair/StudentAffairDashboard";
import StudentAffairProfile from "./pages/studentAffair/StudentAffairProfile";
import StudentAffairInternships from "./pages/studentAffair/StudentAffairInternships";
import StudentAffairClubs from "./pages/studentAffair/StudentAffairClubs";
import StudentAffairLostAndFound from "./pages/studentAffair/StudentAffairLostAndFound";
import ClubDetail from "./pages/studentAffair/ClubDetail";


import ScrollToTop from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in using JWT token
    const checkAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          // Try to get user from token
          const userData = await getUserFromToken(token);
          if (userData) {
            setUser(userData);
          } else {
            // Token is invalid or expired
            clearAuth();
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          clearAuth();
        }
      } else {
        // Check for stored user as fallback
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // User and token are already saved by Login/SignUp components
  };

  const handleLogout = () => {
    setUser(null);
    clearAuth();
    window.location.href = "/home";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public routes - always accessible */}
            <Route path="/home" element={<Landing user={user} onLogout={handleLogout} />} />
            <Route path="/about" element={<AboutUs user={user} onLogout={handleLogout} />} />
            <Route path="/features" element={<Features user={user} onLogout={handleLogout} />} />
            <Route path="/contact" element={<Contact user={user} onLogout={handleLogout} />} />
            {/* <Route path="/admin" element={<AdminDashboard user={user} onLogout={handleLogout} />} /> */}
            
            {!user ? (
              <>
                <Route path="/" element={<Landing user={user} onLogout={handleLogout} />} />
                <Route path="/login" element={<Login onLogin={handleLogin} />} />
                <Route path="/signup" element={<SignUp onLogin={handleLogin} />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-code" element={<VerifyCode />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="*" element={<NotFound />} />
              </>
            ) : (
              <>
                {user.role === "student" && (
                  <>
                    <Route path="/" element={<StudentDashboard user={user} onLogout={handleLogout} />} />
                    <Route path="/profile" element={<StudentProfile user={user} onLogout={handleLogout} />} />
                    <Route path="/clubs" element={<Clubs user={user} onLogout={handleLogout} />} />
                    <Route path="/events" element={<Events user={user} onLogout={handleLogout} />} />
                    <Route path="/projects" element={<ResearchProjects user={user} onLogout={handleLogout} />} />
                    <Route path="/applications" element={<MyApplications user={user} onLogout={handleLogout} />} />
                    <Route path="/internships" element={<Internships user={user} onLogout={handleLogout} />} />
                    <Route path="/lost-and-found" element={<LostAndFound user={user} onLogout={handleLogout} />} />
                  </>
                )}
                {(user.role === "doctor" || user.role === "professor") && (
                  <>
                    <Route path="/" element={<DoctorDashboard user={user} onLogout={handleLogout} />} />
                    <Route path="/profile" element={<DoctorProfile user={user} onLogout={handleLogout} />} />
                    <Route path="/my-projects" element={<DoctorMyProjects user={user} onLogout={handleLogout} />} />
                    <Route path="/applications" element={<DoctorApplications user={user} onLogout={handleLogout} />} />
                    <Route path="/analytics" element={<DoctorAnalytics user={user} onLogout={handleLogout} />} />
                  </>
                )}
                {user.role === "studentAffair" && (
                  <>
                    <Route path="/" element={<StudentAffairDashboard user={user} onLogout={handleLogout} />} />
                    <Route path="/profile" element={<StudentAffairProfile user={user} onLogout={handleLogout} />} />
                    <Route path="/internships" element={<StudentAffairInternships user={user} onLogout={handleLogout} />} />
                    <Route path="/clubs-manage" element={<StudentAffairClubs user={user} onLogout={handleLogout} />} />
                    <Route path="/clubs-manage/:clubId" element={<ClubDetail user={user} onLogout={handleLogout} />} />
                    <Route path="/lost-found-manage" element={<StudentAffairLostAndFound user={user} onLogout={handleLogout} />} />
                  </>
                )}
                {user.role === "admin" && (
                  <>
                    {/* AdminDashboard component not yet implemented */}
                    {/* <Route path="/admin" element={<AdminDashboard user={user} onLogout={handleLogout} />} /> */}
                    {/* <Route path="/admin-dashboard" element={<AdminDashboard user={user} onLogout={handleLogout} />} /> */}
                    {/* <Route path="/" element={<AdminDashboard user={user} onLogout={handleLogout} />} /> */}
                    <Route path="/" element={<Landing user={user} onLogout={handleLogout} />} />
                  </>
                )}
                {/* Fallback for unknown roles - redirect to home */}
                {!["student", "doctor", "professor", "studentAffair", "admin"].includes(user.role) && (
                  <Route path="/" element={<Landing user={user} onLogout={handleLogout} />} />
                )}
                <Route path="*" element={<NotFound />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")).render(<App />);
