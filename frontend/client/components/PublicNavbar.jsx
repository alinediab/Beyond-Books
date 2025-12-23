import { Link, useLocation } from "react-router-dom";
import { Info, Sparkles, Mail, Home, GraduationCap, UserCog, Users, Shield } from "lucide-react";
import UserAvatar from "./UserAvatar";

function PublicNavbar({ user, onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: "/about", label: "About Us", icon: Info },
    { path: "/features", label: "Features", icon: Sparkles },
    { path: "/contact", label: "Contact", icon: Mail },
  ];

  // Add role-specific tab when user is logged in
  const getRoleTab = () => {
    if (!user) return null;
    
    if (user.role === "student") {
      return { path: "/", label: "Student", icon: GraduationCap };
    } else if (user.role === "doctor" || user.role === "professor") {
      return { path: "/", label: "Professor", icon: UserCog };
    } else if (user.role === "studentAffair") {
      return { path: "/", label: "Student Affair", icon: Users };
    } else if (user.role === "admin") {
      return { path: "/admin", label: "Admin", icon: Shield };
    }
    return null;
  };

  const roleTab = getRoleTab();
  const allNavItems = roleTab 
    ? [...navItems.slice(0, -1), roleTab, navItems[navItems.length - 1]]
    : navItems;

  // Check if current path is a student affair route
  const isStudentAffairRoute = () => {
    if (!user || user.role !== "studentAffair") return false;
    const studentAffairRoutes = ["/", "/internships", "/clubs-admin", "/lost-and-found-admin", "/profile"];
    return studentAffairRoutes.includes(location.pathname);
  };

  // Check if current path is an admin route
  const isAdminRoute = () => {
    if (!user || user.role !== "admin") return false;
    return location.pathname === "/admin" || location.pathname.startsWith("/admin");
  };

  const isActive = (path) => {
    // Special handling for admin route
    if (path === "/admin" && user?.role === "admin") {
      return isAdminRoute();
    }
    // Special handling for role tabs - keep active when on any role-specific route
    if (path === "/" && roleTab && roleTab.path === "/") {
      if (user?.role === "studentAffair") {
        return isStudentAffairRoute();
      } else if (user?.role === "student") {
        return location.pathname === "/" || location.pathname.startsWith("/") && 
               ["/clubs", "/events", "/projects", "/applications", "/lost-and-found", "/profile"].includes(location.pathname);
      } else if (user?.role === "doctor" || user?.role === "professor") {
        return location.pathname === "/" || location.pathname.startsWith("/") && 
               ["/my-projects", "/applications", "/analytics", "/profile"].includes(location.pathname);
      }
    }
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-[#8FABD4]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/home" 
            className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                <img 
                  src="/logo.png" 
                  alt="BeyondBooks Logo" 
                  className="w-8 h-8 transition-transform group-hover:scale-110" 
                />
              </div>
            </div>
            <span className="text-xl font-bold text-[#4A70A9]">BeyondBooks</span>
          </Link>
          
          {/* Navigation Links - Centered */}
          <div className="hidden md:flex gap-2 items-center flex-1 justify-center">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
                    ${
                      isActive(item.path)
                        ? "bg-[#4A70A9] text-white shadow-md"
                        : "text-[#000000] hover:text-[#4A70A9] hover:bg-[#8FABD4]/10"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive(item.path) ? "text-white" : "text-[#4A70A9]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          
          {/* User Avatar */}
          <div className="hidden md:block">
            <UserAvatar user={user} onLogout={onLogout} />
          </div>
          
          {/* Mobile Menu */}
          <div className="md:hidden flex items-center gap-3">
            <UserAvatar user={user} onLogout={onLogout} />
            <Link
              to="/home"
              className="p-2 rounded-lg hover:bg-[#8FABD4]/10 transition"
              aria-label="Home"
            >
              <Home className="w-5 h-5 text-[#4A70A9]" />
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div className="md:hidden mt-4 pt-4 border-t border-[#8FABD4]/20">
          <div className="flex flex-wrap gap-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all
                    ${
                      isActive(item.path)
                        ? "bg-[#4A70A9] text-white"
                        : "text-[#000000] hover:text-[#4A70A9] hover:bg-[#8FABD4]/10"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive(item.path) ? "text-white" : "text-[#4A70A9]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
