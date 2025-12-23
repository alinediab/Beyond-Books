import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Filter, Clock, CheckCircle, X, Loader2, Search, XCircle, UserCheck, Trash2 } from "lucide-react";
import { professorApi, conductsApi } from "@shared/api";
import { toast } from "sonner";

export default function DoctorApplications({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const queryClient = useQueryClient();

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

  const applications = applicationsData?.map((app) => ({
    id: `${app.studentID}-${app.projectID}`,
    studentID: app.studentID,
    studentName: `${app.studentFirstName || ""} ${app.studentLastName || ""}`.trim(),
    studentEmail: app.studentEmail,
    projectTitle: app.projectTitle,
    projectID: app.projectID,
    major: app.major || "N/A",
    departmentName: app.departmentName || "",
    status: app.status || "pending",
  })) || [];

  const handleUpdateStatus = async (studentID, projectID, status) => {
    const id = `${studentID}-${projectID}`;
    setUpdatingId(id);
    try {
      await conductsApi.updateStatus(studentID, projectID, status);
      toast.success(`Application ${status === 'approved' ? 'approved' : 'rejected'} successfully!`);
      queryClient.invalidateQueries(['professorApplications', user?.id]);
      // Refresh student stats when project is approved (so student sees updated count)
      if (status === 'approved') {
        await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      }
    } catch (error) {
      toast.error("Failed to update application status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (studentID, projectID) => {
    if (!window.confirm("Are you sure you want to remove this application?")) return;
    const id = `${studentID}-${projectID}`;
    setUpdatingId(id);
    try {
      await conductsApi.delete(studentID, projectID);
      toast.success("Application removed successfully!");
      queryClient.invalidateQueries(['professorApplications', user?.id]);
    } catch (error) {
      toast.error("Failed to remove application");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.projectTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || app.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Student Applications</h1>
              <p className="text-primary-foreground opacity-90">
                Review and manage student applications to your projects
              </p>
            </div>

            {/* Stats */}
            {applicationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-xl p-5 border border-warm-200 shadow-sm">
                  <div className="text-3xl font-bold text-foreground">
                    {stats.total}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Applications</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-5 border border-yellow-200 shadow-sm">
                  <div className="text-3xl font-bold text-yellow-700">
                    {stats.pending}
                  </div>
                  <p className="text-sm text-yellow-600">Pending Review</p>
                </div>
                <div className="bg-green-50 rounded-xl p-5 border border-green-200 shadow-sm">
                  <div className="text-3xl font-bold text-green-700">
                    {stats.approved}
                  </div>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
                <div className="bg-red-50 rounded-xl p-5 border border-red-200 shadow-sm">
                  <div className="text-3xl font-bold text-red-700">
                    {stats.rejected}
                  </div>
                  <p className="text-sm text-red-600">Rejected</p>
                </div>
              </div>
            )}

            {/* Search and Filter */}
            <div className="bg-white rounded-xl border border-warm-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by student name or project..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterStatus("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filterStatus === "all" 
                        ? "bg-primary text-white" 
                        : "bg-warm-100 text-foreground hover:bg-warm-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilterStatus("pending")}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      filterStatus === "pending" 
                        ? "bg-yellow-500 text-white" 
                        : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    Pending
                  </button>
                  <button
                    onClick={() => setFilterStatus("approved")}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      filterStatus === "approved" 
                        ? "bg-green-500 text-white" 
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approved
                  </button>
                  <button
                    onClick={() => setFilterStatus("rejected")}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      filterStatus === "rejected" 
                        ? "bg-red-500 text-white" 
                        : "bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    Rejected
                  </button>
                </div>
              </div>
            </div>

            {/* Applications Table */}
            {applicationsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-warm-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-warm-50 border-b border-warm-200">
                        <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                          Student
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                          Project
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                          Major
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                          Status
                        </th>
                        <th className="text-left py-4 px-6 font-bold text-foreground text-sm uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredApplications.length > 0 ? (
                        filteredApplications.map((app) => (
                          <tr
                            key={app.id}
                            className="border-b border-warm-100 hover:bg-warm-50 transition"
                          >
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-bold text-foreground">
                                  {app.studentName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {app.studentEmail}
                                </p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-muted-foreground text-sm font-medium">
                              {app.projectTitle}
                            </td>
                            <td className="py-4 px-6 text-muted-foreground">
                              {app.major}
                            </td>
                            <td className="py-4 px-6">
                              {getStatusBadge(app.status)}
                            </td>
                            <td className="py-4 px-6">
                              {updatingId === app.id ? (
                                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                              ) : (
                                <div className="flex items-center gap-2">
                                  {app.status === "pending" && (
                                    <>
                                      <button
                                        onClick={() => handleUpdateStatus(app.studentID, app.projectID, "approved")}
                                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                                        title="Approve"
                                      >
                                        <CheckCircle className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleUpdateStatus(app.studentID, app.projectID, "rejected")}
                                        className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                                        title="Reject"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleDelete(app.studentID, app.projectID)}
                                    className="p-2 bg-warm-100 text-muted-foreground rounded-lg hover:bg-warm-200 transition"
                                    title="Remove"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-muted-foreground">
                            <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            No applications found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}