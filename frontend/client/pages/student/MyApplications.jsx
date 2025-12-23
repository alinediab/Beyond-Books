import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Calendar, CheckCircle, Clock, AlertCircle, Trash2, Loader2, User, MapPin, FileText } from "lucide-react";
import { studentApi, conductsApi, researchApi } from "@shared/api";
import { toast } from "sonner";

export default function MyApplications({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const queryClient = useQueryClient();

  // Fetch research applications
  const { data: researchApplicationsData, isLoading: researchApplicationsLoading } = useQuery({
    queryKey: ['studentResearchApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await studentApi.getResearchApplications(user.id);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch all projects to get project details
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['researchProjects'],
    queryFn: async () => {
      const response = await researchApi.list();
      return response.data || [];
    },
  });

  const isLoading = researchApplicationsLoading || projectsLoading;

  // Transform applications data
  const applications = researchApplicationsData?.map((app) => {
    const project = projectsData?.find(p => p.projectID === app.projectID);
    return {
      id: app.projectID,
      projectID: app.projectID,
      projectTitle: project?.title || "Unknown Project",
      doctor: project ? `Dr. ${project.professorFirstName || ""} ${project.professorLastName || ""}`.trim() : "Professor",
      department: project?.facultyName || "",
      appliedDate: app.appliedDate ? new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "N/A",
      status: app.status || "pending",
      description: project?.description || "",
    };
  }) || [];

  const filteredApplications =
    filterStatus === "all"
      ? applications
      : applications.filter((app) => app.status === filterStatus);

  const handleWithdrawApplication = async (projectId) => {
    try {
      await conductsApi.delete(user.id, projectId);
      toast.success("Application withdrawn successfully!");
      queryClient.invalidateQueries(['studentResearchApplications', user.id]);
    } catch (error) {
      toast.error("Failed to withdraw application. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-lg">
            <Clock className="w-4 h-4" />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 text-sm font-bold rounded-lg">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 text-sm font-bold rounded-lg">
            <AlertCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg">
            <Clock className="w-4 h-4" />
            {status || "Pending"}
          </span>
        );
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">My Applications</h1>
              <p className="text-primary-foreground opacity-90">
                Track your research project applications and their status
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl p-4 border border-warm-200">
                <div className="text-2xl font-bold text-foreground">{stats.total}</div>
                <p className="text-xs text-muted-foreground">Total Applications</p>
              </div>
              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                <p className="text-xs text-yellow-600">Pending</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                <p className="text-xs text-green-600">Approved</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                <p className="text-xs text-red-600">Rejected</p>
              </div>
            </div>

            {/* Filter */}
            <div className="flex gap-3 mb-8 overflow-x-auto">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                    filterStatus === status
                      ? "bg-primary text-white"
                      : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Applications List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  {filterStatus !== "all" ? `No ${filterStatus} applications` : "No applications found"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                  >
                    <div className={`h-2 ${
                      app.status === "approved" ? "bg-green-500" :
                      app.status === "rejected" ? "bg-red-500" :
                      "bg-yellow-500"
                    }`} />
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {app.projectTitle}
                          </h3>
                          {app.department && (
                            <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                              {app.department}
                            </span>
                          )}
                        </div>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      {app.description && (
                        <p className="text-muted-foreground mb-4 line-clamp-2">{app.description}</p>
                      )}
                      
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <p className="flex items-center gap-2">
                          <User className="w-4 h-4 text-primary" />
                          {app.doctor}
                        </p>
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          Applied on {app.appliedDate}
                        </p>
                      </div>

                      {app.status === "pending" && (
                        <button
                          onClick={() => handleWithdrawApplication(app.projectID)}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm border border-red-200"
                        >
                          <Trash2 className="w-4 h-4" />
                          Withdraw Application
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
