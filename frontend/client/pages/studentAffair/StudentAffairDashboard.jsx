import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import {
  GraduationCap,
  Users,
  AlertCircle,
  ArrowRight,
  Loader2,
  BookOpen,
  Calendar,
} from "lucide-react";
import { clubApi, internshipApi, lostFoundApi, recommendsApi } from "@shared/api";

export default function StudentAffairDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch data for stats
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await clubApi.list();
      return response.data || [];
    },
  });

  const { data: internshipsData, isLoading: internshipsLoading } = useQuery({
    queryKey: ['internships'],
    queryFn: async () => {
      const response = await internshipApi.list();
      return response.data || [];
    },
  });

  const { data: lostFoundData, isLoading: lostFoundLoading } = useQuery({
    queryKey: ['lostFound'],
    queryFn: async () => {
      const response = await lostFoundApi.list();
      return response.data || [];
    },
  });

  const { data: recommendationsData, isLoading: recommendationsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: async () => {
      const response = await recommendsApi.list();
      return response.data || [];
    },
  });

  const clubs = clubsData || [];
  const internships = internshipsData || [];
  const lostFoundItems = lostFoundData || [];
  const recommendations = recommendationsData || [];

  const stats = [
    {
      label: "Managed Clubs",
      value: clubs.length,
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Internships",
      value: internships.length,
      icon: BookOpen,
      color: "text-accent",
      bg: "bg-accent/10"
    },
    {
      label: "Lost & Found Items",
      value: lostFoundItems.filter(item => item.status !== "resolved").length,
      icon: AlertCircle,
      color: "text-warm-600",
      bg: "bg-warm-100"
    }
    
  ];

  const isLoading = clubsLoading || internshipsLoading || lostFoundLoading || recommendationsLoading;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome, {user?.name || 'Student Affairs Officer'}!</h1>
              <p className="text-primary-foreground opacity-90">
                Manage internships, clubs, and lost & found items
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link
                to="/internships"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">Manage Internships</h3>
                  <p className="text-sm text-muted-foreground">Add and manage internships</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
              <Link
                to="/clubs-manage"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">Manage Clubs</h3>
                  <p className="text-sm text-muted-foreground">Create and manage student clubs</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
              <Link
                to="/lost-found-manage"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">Lost & Found</h3>
                  <p className="text-sm text-muted-foreground">Manage lost and found items</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
            </div>

            {/* Stats */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition"
                    >
                      <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      <div className="text-3xl font-bold text-foreground mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground mb-6">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {clubs.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-warm-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <span className="text-foreground font-medium">{clubs.length} clubs managed</span>
                    </div>
                    <Link
                      to="/clubs-manage"
                      className="text-primary hover:text-warm-600 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {recommendations.length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-warm-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-5 h-5 text-secondary" />
                      <span className="text-foreground font-medium">{recommendations.length} internship recommendations</span>
                    </div>
                    <Link
                      to="/internships"
                      className="text-secondary hover:text-warm-600 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {lostFoundItems.filter(item => item.status !== "resolved").length > 0 && (
                  <div className="flex items-center justify-between p-4 bg-warm-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-warm-600" />
                      <span className="text-foreground font-medium">
                        {lostFoundItems.filter(item => item.status !== "resolved").length} pending lost & found items
                      </span>
                    </div>
                    <Link
                      to="/lost-found-manage"
                      className="text-warm-600 hover:text-warm-700 text-sm font-medium flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
                {clubs.length === 0 && recommendations.length === 0 && lostFoundItems.filter(item => item.status !== "resolved").length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

