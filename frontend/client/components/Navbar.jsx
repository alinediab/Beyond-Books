import { Link } from "react-router-dom";
import { LogOut, Menu, X, User } from "lucide-react";
import { useState } from "react";

export default function Navbar({ user, onLogout, sidebarOpen, setSidebarOpen }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getRoleDisplay = (role) => {
    if (role === "doctor") return "Faculty";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <nav className="bg-white border-b border-warm-200 shadow-sm sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 hover:bg-warm-100 rounded-lg transition"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <Link to="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm">
              <img src="/logo.png" alt="BeyondBooks Logo" className="w-7 h-7" />
            </div>
            <span className="text-xl font-bold text-primary hidden sm:inline">BeyondBooks</span>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-warm-50 rounded-lg">
            <span className="text-xs font-medium text-muted-foreground">Role:</span>
            <span className="font-bold text-foreground">{getRoleDisplay(user.role)}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-2 hover:bg-warm-50 rounded-lg transition"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-warm-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-foreground">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-warm-200 overflow-hidden">
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-3 hover:bg-warm-50 text-foreground font-medium flex items-center gap-2 transition"
                >
                  <User className="w-4 h-4" />
                  View Profile
                </Link>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition border-t border-warm-200"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
