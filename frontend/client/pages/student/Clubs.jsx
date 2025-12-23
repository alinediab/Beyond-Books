import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Users, Check, Loader2, Target } from "lucide-react";
import { clubApi, studentApi, joinApi } from "@shared/api";
import { toast } from "sonner";

export default function Clubs({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch clubs from database
  const { data: clubsData, isLoading: clubsLoading } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await clubApi.list();
      return response.data || [];
    },
  });

  // Fetch joined clubs
  const { data: joinedClubsData, isLoading: joinedClubsLoading } = useQuery({
    queryKey: ['studentJoinedClubs', user?.studentID || user?.id],
    queryFn: async () => {
      const studentID = user?.studentID || user?.id;
      if (!studentID) return [];
      const response = await studentApi.getJoinedClubs(studentID);
      return response.data || [];
    },
    enabled: !!(user?.studentID || user?.id),
  });

  const isLoading = clubsLoading || joinedClubsLoading;

  // Transform data for display
  const clubs = clubsData?.map((club) => ({
    id: club.clubID,
    name: club.clubName,
    members: club.memberCount || 0,
    description: club.description || "",
    image: null, // Will use icon instead
  })) || [];

  // Check if student is member of a club
  const isClubMember = (clubId) => {
    return joinedClubsData?.some(club => club.clubID === clubId) || false;
  };

  const handleJoinClub = async (clubId) => {
    try {
      const studentID = String(user?.studentID || user?.id);
      console.log('[Clubs] Joining club with studentID:', studentID);
      await joinApi.join({ studentID: studentID, clubID: clubId });
      toast.success("Successfully joined club!");
      
      // Invalidate queries to mark them as stale
      queryClient.invalidateQueries(['studentJoinedClubs', studentID]);
      queryClient.invalidateQueries(['clubs']);
      
      // Invalidate and refetch student stats to update "Clubs Joined" count
      queryClient.invalidateQueries({ queryKey: ['studentStats', studentID] });
      await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      
      console.log('[Clubs] Stats query invalidated and refetched for studentID:', studentID);
    } catch (error) {
      console.error('[Clubs] Error joining club:', error);
      toast.error("Failed to join club. Please try again.");
    }
  };

  const handleLeaveClub = async (clubId) => {
    try {
      const studentID = String(user?.studentID || user?.id);
      console.log('[Clubs] Leaving club with studentID:', studentID);
      await joinApi.leave(studentID, clubId);
      toast.success("Left club successfully");
      
      // Invalidate queries to mark them as stale
      queryClient.invalidateQueries(['studentJoinedClubs', studentID]);
      queryClient.invalidateQueries(['clubs']);
      
      // Invalidate and refetch student stats to update "Clubs Joined" count
      queryClient.invalidateQueries({ queryKey: ['studentStats', studentID] });
      await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      
      console.log('[Clubs] Stats query invalidated and refetched for studentID:', studentID);
    } catch (error) {
      console.error('[Clubs] Error leaving club:', error);
      toast.error("Failed to leave club. Please try again.");
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
              <h1 className="text-4xl font-bold mb-2">Clubs & Organizations</h1>
              <p className="text-primary-foreground opacity-90">
                Discover and join clubs that match your interests
              </p>
            </div>

            {/* Clubs Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : clubs.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">No clubs available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => {
                  const isMember = isClubMember(club.id);
                  return (
                    <div
                      key={club.id}
                      className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center mb-4">
                          <Target className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-foreground mb-2">{club.name}</h3>
                        <p className="text-muted-foreground mb-4">{club.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Users className="w-4 h-4 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {club.members} members
                          </span>
                        </div>
                        <button
                          onClick={() => isMember ? handleLeaveClub(club.id) : handleJoinClub(club.id)}
                          className={`w-full py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                            isMember
                              ? "bg-primary text-white hover:bg-warm-600"
                              : "bg-warm-100 text-foreground hover:bg-warm-200"
                          }`}
                        >
                          {isMember && <Check className="w-4 h-4" />}
                          {isMember ? "Joined" : "Join Club"}
                        </button>
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