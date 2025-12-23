import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { GraduationCap, Plus, Trash2, Edit, X, Save, Loader2, Search, MapPin, Calendar, Clock } from "lucide-react";
import { internshipApi, recommendsApi } from "@shared/api";
import { toast } from "sonner";

export default function StudentAffairInternships({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [durationFilter, setDurationFilter] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    companyName: "",
    location: "",
    description: "",
    startDate: "",
    endDate: "",
    duration: "",
    durationUnit: "months",
  });

  // Fetch internships
  const { data: internshipsData, isLoading: internshipsLoading } = useQuery({
    queryKey: ['internships'],
    queryFn: async () => {
      const response = await internshipApi.list();
      return response.data || [];
    },
  });

  const internships = internshipsData || [];

  const calculateDuration = (start, end) => {
    if (!start || !end) return { duration: "", durationUnit: "months" };
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.round(diffDays / 7);
    const diffMonths = Math.round(diffDays / 30);
    
    if (diffMonths >= 1) {
      return { duration: diffMonths, durationUnit: "months" };
    } else if (diffWeeks >= 1) {
      return { duration: diffWeeks, durationUnit: "weeks" };
    }
    return { duration: diffDays, durationUnit: "weeks" };
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startDate" || name === "endDate") {
        const start = name === "startDate" ? value : prev.startDate;
        const end = name === "endDate" ? value : prev.endDate;
        const { duration, durationUnit } = calculateDuration(start, end);
        updated.duration = duration;
        updated.durationUnit = durationUnit;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.location) {
      toast.error("Company name and location are required");
      return;
    }

    try {
      if (editingInternship) {
        await internshipApi.update(editingInternship.internshipID, formData);
        toast.success("Internship updated successfully!");
      } else {
        await internshipApi.create(formData);
        toast.success("Internship created successfully!");
      }
      
      setFormData({
        companyName: "",
        location: "",
        description: "",
        startDate: "",
        endDate: "",
        duration: "",
        durationUnit: "months",
      });
      setShowForm(false);
      setEditingInternship(null);
      queryClient.invalidateQueries(['internships']);
      // Refresh officer stats (recommended internships count may change if professors recommend) - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save internship. Please try again.");
    }
  };

  const handleEdit = (internship) => {
    setEditingInternship(internship);
    setFormData({
      companyName: internship.companyName || "",
      location: internship.location || "",
      description: internship.description || "",
      startDate: internship.startDate ? new Date(internship.startDate).toISOString().split('T')[0] : "",
      endDate: internship.endDate ? new Date(internship.endDate).toISOString().split('T')[0] : "",
      duration: internship.duration || "",
      durationUnit: internship.durationUnit || "months",
    });
    setShowForm(true);
  };

  const handleDelete = async (internshipId) => {
    if (!window.confirm("Are you sure you want to delete this internship?")) return;
    try {
      setDeletingId(internshipId);
      await internshipApi.delete(internshipId);
      toast.success("Internship deleted successfully!");
      queryClient.invalidateQueries(['internships']);
      // Refresh officer stats (recommended internships count may change) - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error("Failed to delete internship. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingInternship(null);
    setFormData({
      companyName: "",
      location: "",
      startDate: "",
      endDate: "",
      duration: "",
      durationUnit: "months",
    });
  };

  const uniqueLocations = [...new Set(internships.map(i => i.location).filter(Boolean))];

  const filteredInternships = internships.filter((internship) => {
    const matchesSearch = internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = !locationFilter || internship.location === locationFilter;
    const matchesDuration = !durationFilter || 
      (durationFilter === "short" && internship.duration <= 3) ||
      (durationFilter === "medium" && internship.duration > 3 && internship.duration <= 6) ||
      (durationFilter === "long" && internship.duration > 6);
    return matchesSearch && matchesLocation && matchesDuration;
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Internships</h1>
                  <p className="text-primary-foreground opacity-90">
                    Create, edit, and manage internship opportunities for students
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingInternship(null);
                    setFormData({
                      companyName: "",
                      location: "",
                      startDate: "",
                      endDate: "",
                      duration: "",
                      durationUnit: "months",
                    });
                    setShowForm(true);
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-medium flex items-center gap-2 border border-white/30"
                >
                  <Plus className="w-5 h-5" />
                  Add Internship
                </button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-warm-200 p-4 mb-6 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search internships..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="pl-9 pr-8 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background appearance-none cursor-pointer min-w-[160px]"
                    >
                      <option value="">All Locations</option>
                      {uniqueLocations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <select
                      value={durationFilter}
                      onChange={(e) => setDurationFilter(e.target.value)}
                      className="pl-9 pr-8 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background appearance-none cursor-pointer min-w-[180px]"
                    >
                      <option value="">All Durations</option>
                      <option value="short">Short (≤3 months)</option>
                      <option value="medium">Medium (4-6 months)</option>
                      <option value="long">Long (6+ months)</option>
                    </select>
                  </div>
                </div>
              </div>
              {(locationFilter || durationFilter) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {locationFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      <MapPin className="w-3 h-3" />
                      {locationFilter}
                      <button onClick={() => setLocationFilter("")} className="ml-1 hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {durationFilter && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-sm rounded-full">
                      <Calendar className="w-3 h-3" />
                      {durationFilter === "short" ? "≤3 months" : durationFilter === "medium" ? "4-6 months" : "6+ months"}
                      <button onClick={() => setDurationFilter("")} className="ml-1 hover:text-primary/70">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button 
                    onClick={() => { setLocationFilter(""); setDurationFilter(""); }}
                    className="text-sm text-muted-foreground hover:text-foreground ml-auto"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {editingInternship ? "Edit Internship" : "Create New Internship"}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Company Name *
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Enter location"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter internship description (optional)"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Duration
                      </label>
                      <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="e.g., 3"
                        min="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Duration Unit
                      </label>
                      <select
                        name="durationUnit"
                        value={formData.durationUnit}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {editingInternship ? "Update Internship" : "Create Internship"}
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

            {/* Internships List */}
            {internshipsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInternships.map((internship) => (
                  <div
                    key={internship.internshipID}
                    className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-2">{internship.companyName}</h3>
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{internship.location}</span>
                        </div>
                        {internship.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                            {internship.description}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(internship)}
                          className="text-primary hover:text-warm-600"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(internship.internshipID)}
                          disabled={deletingId === internship.internshipID}
                          className="text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {deletingId === internship.internshipID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {(internship.startDate || internship.endDate || internship.duration) && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {internship.startDate && internship.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {internship.duration && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>
                              {internship.duration} {internship.durationUnit || "months"}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {filteredInternships.length === 0 && (
                  <div className="col-span-full p-12 text-center text-muted-foreground">
                    No internships found
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

