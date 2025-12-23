import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { BookOpen, User, Loader2, X, ChevronDown, ChevronUp, GraduationCap } from "lucide-react";
import { researchApi, studentApi, conductsApi } from "@shared/api";
import { toast } from "sonner";

export default function ResearchProjects({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch research projects from database
  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['researchProjects'],
    queryFn: async () => {
      const response = await researchApi.list();
      return response.data || [];
    },
  });

  // Fetch student's applications
  const { data: applicationsData } = useQuery({
    queryKey: ['studentResearchApplications', user?.studentID || user?.id],
    queryFn: async () => {
      const studentID = user?.studentID || user?.id;
      if (!studentID) return [];
      const response = await studentApi.getResearchApplications(studentID);
      return response.data || [];
    },
    enabled: !!(user?.studentID || user?.id),
  });

  // Transform data for display
  const projects = projectsData?.map((project) => ({
    id: project.projectID,
    title: project.title || "Untitled Project",
    description: project.description || "",
    professorName: project.professorFirstName && project.professorLastName
      ? `Dr. ${project.professorFirstName} ${project.professorLastName}`
      : "Professor",
    facultyName: project.facultyName || "",
    professorID: project.professorID,
  })) || [];

  // Check if student has applied
  const hasApplied = (projectId) => {
    return applicationsData?.some(app => app.projectID === projectId) || false;
  };

  const handleApply = async (projectId) => {
    try {
      const studentID = String(user?.studentID || user?.id);
      console.log('[ResearchProjects] Applying with studentID:', studentID);
      await conductsApi.create({ studentID: studentID, projectID: projectId });
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries(['studentResearchApplications', studentID]);
      // Invalidate and refetch student stats
      queryClient.invalidateQueries({ queryKey: ['studentStats', studentID] });
      await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      console.log('[ResearchProjects] Stats query invalidated and refetched for studentID:', studentID);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to apply. Please try again.";
      toast.error(errorMessage);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = !searchTerm || 
      project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.professorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.facultyName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white mb-8">
              <h1 className="text-4xl font-bold mb-2">Research Projects</h1>
              <p className="text-primary-foreground opacity-90">
                Discover and apply to cutting-edge research projects led by experienced faculty members
              </p>
            </div>

            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search projects by title, description, or professor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                />
              </div>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-3 text-muted-foreground hover:text-foreground transition flex items-center gap-2 bg-white border border-warm-200 rounded-xl"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Projects Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  {searchTerm ? "No projects match your search" : "No research projects available at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredProjects.map((project) => {
                  const applied = hasApplied(project.id);
                  const isExpanded = expandedId === project.id;
                  return (
                    <div
                      key={project.id}
                      className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-warm-100">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground mb-1">{project.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <GraduationCap className="w-4 h-4 text-primary" />
                              <span className="text-primary font-medium text-sm">Research Project</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <BookOpen className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground">
                              <strong>{project.professorName}</strong>
                              {project.facultyName && ` • ${project.facultyName}`}
                            </span>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="mb-4 p-4 bg-warm-50 rounded-lg border border-warm-100">
                            <h4 className="font-medium text-foreground mb-2">Project Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {project.description || "No description provided for this project."}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : project.id)}
                            className="flex-1 py-2.5 rounded-lg font-medium transition bg-warm-100 text-foreground hover:bg-warm-200 flex items-center justify-center gap-2"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                          <button
                            onClick={() => handleApply(project.id)}
                            disabled={applied}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                              applied
                                ? "bg-green-100 text-green-700 cursor-not-allowed"
                                : "bg-primary text-white hover:bg-warm-600"
                            }`}
                          >
                            {applied ? "Applied ✓" : "Apply Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}