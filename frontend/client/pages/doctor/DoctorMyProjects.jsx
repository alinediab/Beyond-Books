import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  Users,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { researchApi } from "@shared/api";
import { toast } from "sonner";

export default function DoctorMyProjects({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

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

  const projects = projectsData || [];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!formData.title) {
      toast.error("Project title is required");
      return;
    }

    try {
      if (editingProject) {
        await researchApi.update(editingProject.projectID, formData);
        toast.success("Project updated successfully!");
      } else {
        console.log('Creating project with data:', {
          title: formData.title,
          description: formData.description,
          professorID: user.id,
          userObject: user
        });
        await researchApi.create({
          ...formData,
          professorID: user.id,
        });
        toast.success("Project created successfully!");
      }
      
      setFormData({ title: "", description: "" });
      setShowNewProjectForm(false);
      setEditingProject(null);
      queryClient.invalidateQueries(['professorProjects', user.id]);
      queryClient.invalidateQueries(['adminProjects']);
      queryClient.invalidateQueries(['researchProjects']);
    } catch (error) {
      console.error('Error saving project:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  const openEditProject = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || "",
      description: project.description || "",
    });
    setShowNewProjectForm(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      setDeletingId(id);
      await researchApi.delete(id);
      toast.success("Project deleted successfully!");
      queryClient.invalidateQueries(['professorProjects', user.id]);
      queryClient.invalidateQueries(['adminProjects']);
      queryClient.invalidateQueries(['researchProjects']);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowNewProjectForm(false);
    setEditingProject(null);
    setFormData({ title: "", description: "" });
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
              <h1 className="text-4xl font-bold mb-2">My Research Projects</h1>
              <p className="text-primary-foreground opacity-90">
                Create, manage, and track your research projects
              </p>
            </div>

            {/* Stats */}
            {projectsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-3">
                    <CheckCircle className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {projects.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                </div>
                <div className="bg-white rounded-xl p-6 border border-warm-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {projects.reduce((sum, p) => sum + (p.applicantCount || 0), 0)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Applicants</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 border border-green-200 shadow-sm hover:shadow-md transition">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-700 mb-1">
                    {projects.length > 0 ? `${projects.length}+` : '0'}
                  </div>
                  <p className="text-sm text-green-600">Open Positions</p>
                  <p className="text-xs text-green-600/70 mt-1">Research projects available</p>
                </div>
              </div>
            )}

            {/* New Project Form */}
            {showNewProjectForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {editingProject ? "Edit Project" : "Create New Project"}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmitForm} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter project title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      rows="4"
                      placeholder="Describe your research project"
                    ></textarea>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold"
                    >
                      {editingProject ? "Update Project" : "Create Project"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-warm-100 text-foreground py-3 rounded-lg hover:bg-warm-200 transition font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Add Project Button */}
            {!showNewProjectForm && (
              <div className="mb-8">
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setFormData({ title: "", description: "" });
                    setShowNewProjectForm(true);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-warm-600 transition font-bold"
                >
                  <Plus className="w-5 h-5" />
                  New Project
                </button>
              </div>
            )}

            {/* Projects List */}
            {projectsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : projects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.projectID}
                    className="bg-white rounded-2xl border border-warm-200 p-6 hover:shadow-lg transition-all shadow-sm group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition">
                          {project.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {project.description || "No description provided"}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => openEditProject(project)}
                          className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.projectID)}
                          disabled={deletingId === project.projectID}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === project.projectID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-warm-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-secondary" />
                        </div>
                        <span className="text-sm">
                          <span className="font-bold text-foreground">
                            {project.applicantCount || 0}
                          </span>
                          <span className="text-muted-foreground"> applicants</span>
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full font-bold">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-warm-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-warm-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">
                  No projects yet
                </p>
                <p className="text-muted-foreground mb-6">
                  Create your first research project to get started
                </p>
                <button
                  onClick={() => {
                    setEditingProject(null);
                    setFormData({ title: "", description: "" });
                    setShowNewProjectForm(true);
                  }}
                  className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-warm-600 transition font-medium inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}