import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { researchApi, professorApi } from "@shared/api";

export default function DoctorAnalytics({ user, onLogout }) {
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
  const isLoading = projectsLoading || applicationsLoading;

  const stats = {
    totalApplications: applications.length,
    acceptedStudents: applications.filter(a => a.status === "approved").length,
    rejectedApplications: applications.filter(a => a.status === "rejected").length,
    pendingReview: applications.filter(a => a.status === "pending" || !a.status).length,
    totalProjects: projects.length,
  };

  // Group applications by project
  const applicationsByProject = projects.map(project => {
    const projectApps = applications.filter(a => a.projectID === project.projectID);
    return {
      projectName: project.title,
      projectID: project.projectID,
      total: projectApps.length,
      accepted: projectApps.filter(a => a.status === "approved").length,
      rejected: projectApps.filter(a => a.status === "rejected").length,
      pending: projectApps.filter(a => a.status === "pending" || !a.status).length,
    };
  });

  // Get student details for table
  const studentApplications = applications.map(app => ({
    name: `${app.studentFirstName || ""} ${app.studentLastName || ""}`.trim(),
    email: app.studentEmail,
    major: app.major || "N/A",
    status: app.status || "pending",
    project: app.projectTitle,
  }));

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Analytics & Insights</h1>
              <p className="text-primary-foreground opacity-90">
                Track your project performance and student applications
              </p>
            </div>

            {/* Key Metrics */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.totalApplications}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Applications</div>
                </div>

                <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {stats.acceptedStudents}
                  </div>
                  <div className="text-sm text-green-600">Approved</div>
                </div>

                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-700 mb-1">
                    {stats.pendingReview}
                  </div>
                  <div className="text-sm text-yellow-600">Pending</div>
                </div>

                <div className="bg-red-50 rounded-xl p-6 border border-red-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="text-3xl font-bold text-red-700 mb-1">
                    {stats.rejectedApplications}
                  </div>
                  <div className="text-sm text-red-600">Rejected</div>
                </div>
              </div>
            )}

            {/* Secondary Metrics */}
            {!isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground">Project Overview</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-warm-50 rounded-lg">
                      <span className="text-muted-foreground">Active Projects</span>
                      <span className="font-bold text-foreground text-xl">
                        {stats.totalProjects}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-warm-50 rounded-lg">
                      <span className="text-muted-foreground">Total Applicants</span>
                      <span className="font-bold text-foreground text-xl">
                        {stats.totalApplications}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="font-bold text-foreground">Application Status</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span className="text-muted-foreground">Approved</span>
                      </div>
                      <span className="font-bold text-emerald-600 text-lg">
                        {stats.acceptedStudents}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span className="text-muted-foreground">Pending</span>
                      </div>
                      <span className="font-bold text-amber-600 text-lg">
                        {stats.pendingReview}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                        <span className="text-muted-foreground">Rejected</span>
                      </div>
                      <span className="font-bold text-rose-600 text-lg">
                        {stats.rejectedApplications}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h3 className="font-bold text-foreground">Approval Rate</h3>
                  </div>
                  <div className="text-center py-4">
                    <div className="text-5xl font-bold text-emerald-600 mb-2">
                      {stats.totalApplications > 0 
                        ? Math.round((stats.acceptedStudents / stats.totalApplications) * 100)
                        : 0}%
                    </div>
                    <div className="h-3 bg-warm-100 rounded-full overflow-hidden mt-4">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all"
                        style={{
                          width: `${stats.totalApplications > 0 
                            ? (stats.acceptedStudents / stats.totalApplications) * 100 
                            : 0}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      {stats.acceptedStudents} of {stats.totalApplications} approved
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Applications by Project */}
            {!isLoading && (
              <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground">
                    Applications by Project
                  </h2>
                </div>

                {applicationsByProject.length > 0 ? (
                  <div className="space-y-6">
                    {applicationsByProject.map((project) => (
                      <div key={project.projectID} className="bg-warm-50/50 rounded-xl p-5 border border-warm-100">
                        <h3 className="font-bold text-foreground mb-4 text-lg">
                          {project.projectName}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="bg-white rounded-xl p-4 text-center border border-warm-200 shadow-sm">
                            <div className="text-3xl font-bold text-foreground">
                              {project.total}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              Total
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center border border-emerald-200">
                            <div className="text-3xl font-bold text-emerald-600">
                              {project.accepted}
                            </div>
                            <p className="text-xs text-emerald-600 mt-1 font-medium">Approved</p>
                          </div>
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center border border-amber-200">
                            <div className="text-3xl font-bold text-amber-600">
                              {project.pending}
                            </div>
                            <p className="text-xs text-amber-600 mt-1 font-medium">Pending</p>
                          </div>
                          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl p-4 text-center border border-rose-200">
                            <div className="text-3xl font-bold text-rose-600">
                              {project.rejected}
                            </div>
                            <p className="text-xs text-rose-600 mt-1 font-medium">Rejected</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No projects yet. Create your first research project!</p>
                  </div>
                )}
              </div>
            )}

            {/* All Applications */}
            {!isLoading && (
              <div className="bg-white rounded-xl border border-warm-200 overflow-hidden">
                <div className="p-6 border-b border-warm-200">
                  <h2 className="text-xl font-bold text-foreground">
                    All Applications
                  </h2>
                </div>

                {studentApplications.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-warm-50 border-b border-warm-200">
                          <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                            Student
                          </th>
                          <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                            Major
                          </th>
                          <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                            Project
                          </th>
                          <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentApplications.map((student, idx) => (
                          <tr
                            key={idx}
                            className="border-b border-warm-100 hover:bg-warm-50 transition"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-foreground">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-muted-foreground">
                              {student.major}
                            </td>
                            <td className="py-4 px-6 text-muted-foreground text-sm">
                              {student.project}
                            </td>
                            <td className="py-4 px-6">
                              <span
                                className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                                  student.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : student.status === "rejected"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {student.status === "approved" ? "Approved" : student.status === "rejected" ? "Rejected" : "Pending"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    No applications yet
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
