import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { clearAuth, getToken, getUserFromToken } from "@shared/auth";
import { LogOut, User } from "lucide-react";

export default function UserAvatar({ user: userProp, onLogout }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(userProp);

  // Check for user from token if not provided as prop
  useEffect(() => {
    if (!user) {
      const checkUser = async () => {
        const token = getToken();
        if (token) {
          try {
            const userData = await getUserFromToken(token);
            if (userData) {
              setUser(userData);
            }
          } catch (error) {
            console.error("Error getting user:", error);
          }
        }
      };
      checkUser();
    }
  }, [user]);

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // If no user, show "?" and link to login
  if (!user) {
    return (
      <Link
        to="/login"
        className="w-10 h-10 rounded-full bg-[#8FABD4] hover:bg-[#8FABD4]/80 flex items-center justify-center transition text-white font-semibold text-lg"
      >
        ?
      </Link>
    );
  }

  // User is logged in, show initials with dropdown
  const userName = user.name || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split("@")[0] || "User");
  const initials = getInitials(userName);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="w-10 h-10 rounded-full bg-[#4A70A9] hover:bg-[#4A70A9]/90 flex items-center justify-center transition text-white font-semibold"
      >
        {initials}
      </button>

      {dropdownOpen && (
        <>
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="text-sm font-bold text-gray-900">{userName}</div>
              <div className="text-xs text-gray-500">{user.email || user.universityMail}</div>
            </div>
            <Link
              to="/profile"
              onClick={() => setDropdownOpen(false)}
              className="block px-4 py-3 hover:bg-gray-50 text-gray-900 font-medium flex items-center gap-2 transition"
            >
              <User className="w-4 h-4" />
              View Profile
            </Link>
            <button
              onClick={() => {
                setDropdownOpen(false);
                if (onLogout) {
                  onLogout();
                } else {
                  clearAuth();
                  window.location.href = "/home";
                }
              }}
              className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600 font-medium flex items-center gap-2 transition border-t border-gray-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Backdrop to close dropdown */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
        </>
      )}
    </div>
  );
}

