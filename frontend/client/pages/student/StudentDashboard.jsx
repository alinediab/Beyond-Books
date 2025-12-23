import { useState } from "react";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { ArrowRight, Users, Calendar, BookOpen, AlertCircle } from "lucide-react";

export default function StudentDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />
      
      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome, {user.name}!</h1>
              <p className="text-primary-foreground opacity-90">
                Explore clubs, events, and research opportunities tailored for you
              </p>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                to="/clubs"
                className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-lg transition group"
              >
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Clubs</h3>
                <p className="text-muted-foreground mb-4">Discover and join clubs that match your interests</p>
                <div className="flex items-center gap-2 text-primary font-medium group-hover:gap-4 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                to="/events"
                className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-lg transition group"
              >
                <Calendar className="w-12 h-12 text-secondary mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Events</h3>
                <p className="text-muted-foreground mb-4">Register for upcoming university events</p>
                <div className="flex items-center gap-2 text-secondary font-medium group-hover:gap-4 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                to="/projects"
                className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-lg transition group"
              >
                <BookOpen className="w-12 h-12 text-accent mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Research Projects</h3>
                <p className="text-muted-foreground mb-4">Apply to research projects offered by faculty</p>
                <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-4 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>

              <Link
                to="/lost-and-found"
                className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-lg transition group"
              >
                <AlertCircle className="w-12 h-12 text-warm-600 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">Lost & Found</h3>
                <p className="text-muted-foreground mb-4">Report lost items or help others find belongings</p>
                <div className="flex items-center gap-2 text-warm-600 font-medium group-hover:gap-4 transition-all">
                  Explore <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
