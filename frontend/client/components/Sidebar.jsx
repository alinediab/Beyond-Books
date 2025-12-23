import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Settings,
  BarChart3,
  Briefcase,
  Calendar,
  FileText,
  AlertCircle,
  X,
  GraduationCap,
} from "lucide-react";

function Sidebar({ user, sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path) => location.pathname === path;

  const getMenuItems = () => {
    const baseItems = [
      { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    ];

    if (!user?.role) {
      return baseItems;
    }

    if (user?.role === "student") {
      return [
        ...baseItems,
        { icon: Users, label: "Clubs", path: "/clubs" },
        { icon: Calendar, label: "Events", path: "/events" },
        { icon: BookOpen, label: "Research Projects", path: "/projects" },
        { icon: Briefcase, label: "Internships", path: "/internships" },
        { icon: FileText, label: "My Applications", path: "/applications" },
        { icon: AlertCircle, label: "Lost & Found", path: "/lost-and-found" },
        { icon: Settings, label: "Profile", path: "/profile" },
      ];
    } else if (user?.role === "doctor" || user?.role === "professor") {
      return [
        ...baseItems,
        { icon: Briefcase, label: "My Projects", path: "/my-projects" },
        { icon: Users, label: "Applications", path: "/applications" },
        { icon: BarChart3, label: "Analytics", path: "/analytics" },
        { icon: Settings, label: "Profile", path: "/profile" },
      ];
    } else if (user?.role === "studentAffair") {
      return [
        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
        { icon: GraduationCap, label: "Internships", path: "/internships" },
        { icon: Users, label: "Manage Clubs", path: "/clubs-manage" },
        { icon: AlertCircle, label: "Lost & Found", path: "/lost-found-manage" },
        { icon: Settings, label: "Profile", path: "/profile" },
      ];
    } else if (user?.role === "admin") {
      return [
        ...baseItems,
        { icon: Users, label: "Manage Users", path: "/admin" },
        { icon: BookOpen, label: "Manage Clubs", path: "/admin" },
        { icon: Calendar, label: "Manage Events", path: "/admin" },
        { icon: BookOpen, label: "Manage Projects", path: "/admin" },
        { icon: GraduationCap, label: "Manage Internships", path: "/admin" },
        { icon: AlertCircle, label: "Lost & Found", path: "/admin" },
        { icon: Settings, label: "Profile", path: "/profile" },
      ];
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-primary text-white overflow-y-auto z-30 lg:relative lg:top-0 lg:h-screen lg:min-h-full ${
          mounted ? "transition-transform duration-300" : ""
        } ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                  active
                    ? "bg-warm-600 text-white shadow-md"
                    : "text-white/90 hover:bg-warm-600/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}

export default Sidebar;
