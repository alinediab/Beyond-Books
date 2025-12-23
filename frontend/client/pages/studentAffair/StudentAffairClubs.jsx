import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Users, Plus, Trash2, Edit, X, Save, Loader2, Search, Calendar, ArrowRight } from "lucide-react";
import { clubApi, joinApi } from "@shared/api";
import { toast } from "sonner";

export default function StudentAffairClubs({ user, onLogout }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClub, setEditingClub] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [membersLoading, setMembersLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    clubName: "",
    description: "",
    meetingLocation: "",
    boardMemberID: "",
  });

  // Fetch clubs
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await clubApi.list();
      return response.data || [];
    },
  });

  const clubs = clubsData || [];

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.clubName) {
      toast.error("Club name is required");
      return;
    }

    try {
      // Prepare data - convert empty strings to null for optional fields
      const submitData = {
        clubName: formData.clubName,
        description: formData.description || null,
        meetingLocation: formData.meetingLocation || null,
        boardMemberID: formData.boardMemberID && formData.boardMemberID.trim() !== "" 
          ? parseInt(formData.boardMemberID) || null 
          : null,
      };

      if (editingClub) {
        await clubApi.update(editingClub.clubID, submitData);
        toast.success("Club updated successfully!");
      } else {
        await clubApi.create(submitData);
        toast.success("Club created successfully!");
      }
      
      setFormData({
        clubName: "",
        description: "",
        meetingLocation: "",
        boardMemberID: "",
      });
      setShowForm(false);
      setEditingClub(null);
      queryClient.invalidateQueries(['clubs']);
      // Refresh officer stats to update "Managed Clubs" count - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save club. Please try again.");
    }
  };

  const handleEdit = (club) => {
    setEditingClub(club);
    setFormData({
      clubName: club.clubName || "",
      description: club.description || "",
      meetingLocation: club.meetingLocation || "",
      boardMemberID: club.boardMemberID || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (clubId) => {
    if (!window.confirm("Are you sure you want to delete this club?")) return;
    try {
      setDeletingId(clubId);
      await clubApi.delete(clubId);
      toast.success("Club deleted successfully!");
      queryClient.invalidateQueries(['clubs']);
      // Refresh officer stats to update "Managed Clubs" count - force refetch
      const officerID = user?.studentAffairsOfficerID || user?.id;
      if (officerID) {
        await queryClient.refetchQueries({ queryKey: ['officerStats', officerID] });
      }
    } catch (error) {
      toast.error("Failed to delete club. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClub(null);
    setFormData({
      clubName: "",
      description: "",
      meetingLocation: "",
      boardMemberID: "",
    });
  };

  const filteredClubs = clubs.filter((club) =>
    club.clubName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    club.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClubClick = async (club) => {
    if (selectedClub?.clubID === club.clubID) {
      setSelectedClub(null);
      setMembers([]);
      return;
    }
    setSelectedClub(club);
    setMembersLoading(true);
    try {
      const response = await joinApi.getClubMembers(club.clubID);
      setMembers(response.data || []);
    } catch (error) {
      toast.error("Failed to load members");
      setMembers([]);
    } finally {
      setMembersLoading(false);
    }
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-2">Manage Clubs</h1>
                  <p className="text-primary-foreground opacity-90">
                    Create, edit, and manage student clubs
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingClub(null);
                    setFormData({
                      clubName: "",
                      description: "",
                      meetingLocation: "",
                      boardMemberID: "",
                    });
                    setShowForm(true);
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-medium flex items-center gap-2 border border-white/30"
                >
                  <Plus className="w-5 h-5" />
                  Add Club
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-warm-200 p-4 mb-6 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clubs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                />
              </div>
            </div>

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {editingClub ? "Edit Club" : "Create New Club"}
                  </h3>
                  <button
                    onClick={handleCancel}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Club Name *
                    </label>
                    <input
                      type="text"
                      name="clubName"
                      value={formData.clubName}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      placeholder="Enter club name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      rows="4"
                      placeholder="Enter club description"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Meeting Location
                      </label>
                      <input
                        type="text"
                        name="meetingLocation"
                        value={formData.meetingLocation}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="e.g., Room 301, Block A"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Board Member ID
                      </label>
                      <input
                        type="text"
                        name="boardMemberID"
                        value={formData.boardMemberID}
                        onChange={handleFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        placeholder="Student ID of board member"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {editingClub ? "Update Club" : "Create Club"}
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

            {/* Clubs List */}
            {clubsLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center text-muted-foreground shadow-sm">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No clubs found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClubs.map((club) => (
                  <div
                    key={club.clubID}
                    onClick={() => handleClubClick(club)}
                    className={`bg-white rounded-xl border-2 p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer ${
                      selectedClub?.clubID === club.clubID 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-warm-200 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground mb-1">{club.clubName}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {club.description || "No description"}
                        </p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEdit(club); }}
                          className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                          title="Edit Club"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(club.clubID); }}
                          disabled={deletingId === club.clubID}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          title="Delete Club"
                        >
                          {deletingId === club.clubID ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span>{club.memberCount || 0} members</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/clubs-manage/${club.clubID}`); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-warm-600 transition text-sm font-medium"
                    >
                      <Calendar className="w-4 h-4" />
                      Manage Events
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Members Panel */}
            {selectedClub && (
              <div className="mt-6 bg-white rounded-xl border border-warm-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-foreground">
                    Members of {selectedClub.clubName}
                  </h3>
                  <button
                    onClick={() => { setSelectedClub(null); setMembers([]); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {membersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No members in this club
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-warm-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground uppercase">Name</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground uppercase">Email</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground uppercase">Role</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-foreground uppercase">Join Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-warm-200">
                        {members.map((member) => (
                          <tr key={member.studentID} className="hover:bg-warm-50">
                            <td className="px-4 py-3 text-sm text-foreground">{member.name}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{member.email}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{member.role || 'Member'}</td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
