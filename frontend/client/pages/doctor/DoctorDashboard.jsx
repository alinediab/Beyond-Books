import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import {
  BookOpen,
  Users,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { researchApi, professorApi } from "@shared/api";

export default function DoctorDashboard({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch professor's projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['professorProjects', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await researchApi.getByProfessor(user.id);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch applications for professor's projects
  const { data: applicationsData, isLoading: applicationsLoading } = useQuery({
    queryKey: ['professorApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await professorApi.getProjectApplications(user.id);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  const projects = projectsData || [];
  const applications = applicationsData || [];

  const stats = [
    {
      label: "Active Projects",
      value: projects.length,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10"
    },
    {
      label: "Total Applicants",
      value: applications.length,
      icon: Users,
      color: "text-secondary",
      bg: "bg-secondary/10"
    },
    {
      label: "Approved Students",
      value: applications.filter((a) => a.status === "approved").length,
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-100"
    },
    {
      label: "Pending Reviews",
      value: applications.filter((a) => a.status === "pending" || !a.status).length,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-100"
    },
  ];

  const isLoading = projectsLoading || applicationsLoading;

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Welcome, Dr. {user?.name || 'Professor'}!</h1>
              <p className="text-primary-foreground opacity-90">
                Supervise your research projects and review student applications
              </p>
            </div>

            {/* Quick Navigation Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Link
                to="/my-projects"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">My Projects</h3>
                  <p className="text-sm text-muted-foreground">Manage your research projects</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
              <Link
                to="/applications"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">Applications</h3>
                  <p className="text-sm text-muted-foreground">Review student applications</p>
                </div>
                <ArrowRight className="w-5 h-5 text-primary" />
              </Link>
              <Link
                to="/analytics"
                className="flex items-center justify-between p-4 bg-white border border-warm-200 rounded-lg hover:shadow-lg hover:border-primary transition"
              >
                <div>
                  <h3 className="font-bold text-foreground">Analytics</h3>
                  <p className="text-sm text-muted-foreground">View project insights</p>
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

            {/* Recent Applications */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-foreground">
                    Recent Applications
                  </h3>
                  <Link
                    to="/applications"
                    className="text-primary hover:text-warm-600 text-sm font-medium flex items-center gap-1"
                  >
                    View All
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                {applications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-warm-200">
                          <th className="text-left py-3 px-4 font-bold text-foreground">
                            Student
                          </th>
                          <th className="text-left py-3 px-4 font-bold text-foreground">
                            Project
                          </th>
                          <th className="text-left py-3 px-4 font-bold text-foreground">
                            Major
                          </th>
                          <th className="text-left py-3 px-4 font-bold text-foreground">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {applications.slice(0, 5).map((app, idx) => (
                          <tr
                            key={`${app.studentID}-${app.projectID}-${idx}`}
                            className="border-b border-warm-100 hover:bg-warm-50 transition"
                          >
                            <td className="py-3 px-4 font-medium text-foreground">
                              {app.studentFirstName} {app.studentLastName}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-sm">
                              {app.projectTitle?.substring(0, 25) || "N/A"}...
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {app.major || "N/A"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${
                                  app.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {app.status === "approved" ? "Approved" : app.status === "rejected" ? "Rejected" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No applications yet</p>
                    <Link
                      to="/my-projects"
                      className="text-primary hover:text-warm-600 text-sm font-medium mt-2 inline-block"
                    >
                      Create your first project →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
