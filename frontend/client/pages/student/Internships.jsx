import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Briefcase, MapPin, Clock, Calendar, Building2, Loader2, X, ChevronDown, ChevronUp } from "lucide-react";
import { internshipApi, appliesApi } from "@shared/api";
import { toast } from "sonner";

export default function Internships({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const queryClient = useQueryClient();

  // Fetch internships from database
  const { data: internshipsData, isLoading } = useQuery({
    queryKey: ['internships'],
    queryFn: async () => {
      const response = await internshipApi.list();
      return response.data || [];
    },
  });

  // Fetch student's applications
  const { data: applicationsData } = useQuery({
    queryKey: ['studentInternshipApplications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await appliesApi.getByStudent(user.id);
      return response.data || [];
    },
    enabled: !!user?.id,
  });

  // Transform data for display
  const internships = internshipsData?.map((internship) => ({
    id: internship.internshipID,
    companyName: internship.companyName || "Company",
    location: internship.location || "",
    duration: internship.duration ? `${internship.duration} ${internship.durationUnit || 'months'}` : "N/A",
    description: internship.description || "",
    startDate: internship.startDate ? new Date(internship.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
    endDate: internship.endDate ? new Date(internship.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
  })) || [];

  // Check if student has applied
  const hasApplied = (internshipId) => {
    return applicationsData?.some(app => app.internshipID === internshipId) || false;
  };

  const handleApply = async (internshipId) => {
    try {
      await appliesApi.apply({ studentID: user.id, internshipID: internshipId });
      toast.success("Application submitted successfully!");
      queryClient.invalidateQueries(['studentInternshipApplications', user.id]);
    } catch (error) {
      toast.error("Failed to apply. Please try again.");
    }
  };

  const handleWithdraw = async (internshipId) => {
    try {
      await appliesApi.withdraw(user.id, internshipId);
      toast.success("Application withdrawn successfully!");
      queryClient.invalidateQueries(['studentInternshipApplications', user.id]);
    } catch (error) {
      toast.error("Failed to withdraw. Please try again.");
    }
  };

  // Get unique locations for filtering
  const locations = [...new Set(internships.map(i => i.location).filter(Boolean))];

  // Filter internships
  const filteredInternships = internships.filter(internship => {
    const matchesLocation = selectedLocation === "all" || internship.location === selectedLocation;
    const matchesSearch = !searchTerm || 
      internship.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      internship.location?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLocation && matchesSearch;
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
              <h1 className="text-4xl font-bold mb-2">Internship Opportunities</h1>
              <p className="text-primary-foreground opacity-90">
                Discover internship opportunities to gain real-world experience
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search internships..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-warm-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary bg-white shadow-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLocation("all")}
                  className={`px-4 py-2.5 rounded-lg font-medium transition ${
                    selectedLocation === "all"
                      ? "bg-primary text-white"
                      : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                  }`}
                >
                  All Locations
                </button>
                {locations.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc)}
                    className={`px-4 py-2.5 rounded-lg font-medium transition ${
                      selectedLocation === loc
                        ? "bg-primary text-white"
                        : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
                {selectedLocation !== "all" && (
                  <button
                    onClick={() => setSelectedLocation("all")}
                    className="px-3 py-2 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Internships Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  {searchTerm || selectedLocation !== "all" ? "No internships match your search" : "No internships available at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredInternships.map((internship) => {
                  const applied = hasApplied(internship.id);
                  const isExpanded = expandedId === internship.id;
                  return (
                    <div
                      key={internship.id}
                      className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-warm-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">{internship.companyName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Building2 className="w-4 h-4 text-primary" />
                              <span className="text-primary font-medium">Internship Opportunity</span>
                            </div>
                          </div>
                          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                            <Briefcase className="w-6 h-6 text-primary" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-5">
                        <div className="space-y-2 mb-4">
                          {internship.location && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-muted-foreground">{internship.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-muted-foreground">{internship.duration}</span>
                          </div>
                          {(internship.startDate || internship.endDate) && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-muted-foreground">
                                {internship.startDate} {internship.endDate && `- ${internship.endDate}`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Expandable Details */}
                        {isExpanded && (
                          <div className="mb-4 p-4 bg-warm-50 rounded-lg border border-warm-100">
                            <h4 className="font-medium text-foreground mb-2">Internship Details</h4>
                            <p className="text-sm text-muted-foreground">
                              This internship at <strong>{internship.companyName}</strong> is located in {internship.location || "N/A"}.
                              Duration: {internship.duration}.
                              {internship.startDate && ` Starting ${internship.startDate}`}
                              {internship.endDate && ` until ${internship.endDate}`}.
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : internship.id)}
                            className="flex-1 py-2.5 rounded-lg font-medium transition bg-warm-100 text-foreground hover:bg-warm-200 flex items-center justify-center gap-2"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {isExpanded ? "Hide Details" : "View Details"}
                          </button>
                          <button
                            onClick={() => applied ? handleWithdraw(internship.id) : handleApply(internship.id)}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                              applied
                                ? "bg-green-100 text-green-700 hover:bg-green-200"
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

