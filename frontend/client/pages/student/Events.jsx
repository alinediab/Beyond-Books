import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { Calendar, MapPin, Users, Loader2, X } from "lucide-react";
import { eventApi, studentApi, attendApi, clubApi } from "@shared/api";
import { toast } from "sonner";

export default function Events({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClub, setSelectedClub] = useState("all");
  const queryClient = useQueryClient();

  // Fetch clubs for filter
  const { data: clubsData } = useQuery({
    queryKey: ['clubs'],
    queryFn: async () => {
      const response = await clubApi.list();
      return response.data || [];
    },
  });

  // Fetch events from database
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await eventApi.list();
      return response.data || [];
    },
  });

  // Fetch attended events
  const { data: attendedEventsData, isLoading: attendedEventsLoading } = useQuery({
    queryKey: ['studentAttendedEvents', user?.studentID || user?.id],
    queryFn: async () => {
      const studentID = user?.studentID || user?.id;
      if (!studentID) return [];
      const response = await studentApi.getAttendedEvents(studentID);
      return response.data || [];
    },
    enabled: !!(user?.studentID || user?.id),
  });

  const isLoading = eventsLoading || attendedEventsLoading;
  const clubs = clubsData || [];

  // Transform data for display
  const events = eventsData?.map((event) => {
    const eventDate = event.eventDate ? new Date(event.eventDate) : new Date();
    return {
      id: event.eventID,
      title: event.eventName,
      date: eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      location: event.location || "",
      attendees: event.attendeeCount || 0,
      description: event.eventDescription || "",
      clubID: event.clubID,
      clubName: event.clubName,
    };
  }) || [];

  // Filter events by club
  const filteredEvents = selectedClub === "all" 
    ? events 
    : events.filter(e => e.clubID === parseInt(selectedClub));

  // Check if student is registered for an event
  const isEventRegistered = (eventId) => {
    return attendedEventsData?.some(event => event.eventID === eventId) || false;
  };

  const handleRegisterEvent = async (eventId) => {
    try {
      const studentID = String(user?.studentID || user?.id);
      console.log('[Events] Registering with studentID:', studentID);
      await attendApi.attend({ studentID: studentID, eventID: eventId });
      toast.success("Successfully registered for event!");
      queryClient.invalidateQueries(['studentAttendedEvents', studentID]);
      queryClient.invalidateQueries(['events']);
      // Invalidate and refetch student stats to update achievements count (after event date passes)
      queryClient.invalidateQueries({ queryKey: ['studentStats', studentID] });
      await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      console.log('[Events] Stats query invalidated and refetched for studentID:', studentID);
    } catch (error) {
      console.error('[Events] Error registering:', error);
      toast.error("Failed to register for event. Please try again.");
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    try {
      const studentID = String(user?.studentID || user?.id);
      console.log('[Events] Unregistering with studentID:', studentID);
      await attendApi.unattend(studentID, eventId);
      toast.success("Unregistered from event successfully!");
      queryClient.invalidateQueries(['studentAttendedEvents', studentID]);
      queryClient.invalidateQueries(['events']);
      // Invalidate and refetch student stats to update achievements count
      queryClient.invalidateQueries({ queryKey: ['studentStats', studentID] });
      await queryClient.refetchQueries({ queryKey: ['studentStats', studentID] });
      console.log('[Events] Stats query invalidated and refetched for studentID:', studentID);
    } catch (error) {
      console.error('[Events] Error unregistering:', error);
      toast.error("Failed to unregister from event. Please try again.");
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
              <h1 className="text-4xl font-bold mb-2">Upcoming Events</h1>
              <p className="text-primary-foreground opacity-90">
                Explore and register for exciting university events
              </p>
            </div>

            {/* Club Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setSelectedClub("all")}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  selectedClub === "all"
                    ? "bg-primary text-white"
                    : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                }`}
              >
                All Events
              </button>
              {clubs.map((club) => (
                <button
                  key={club.clubID}
                  onClick={() => setSelectedClub(club.clubID.toString())}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedClub === club.clubID.toString()
                      ? "bg-primary text-white"
                      : "bg-white border border-warm-200 text-foreground hover:bg-warm-50"
                  }`}
                >
                  {club.clubName}
                </button>
              ))}
              {selectedClub !== "all" && (
                <button
                  onClick={() => setSelectedClub("all")}
                  className="px-3 py-2 text-muted-foreground hover:text-foreground transition flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>

            {/* Events List */}
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="bg-white rounded-xl border border-warm-200 p-12 text-center">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg text-muted-foreground">
                  {selectedClub !== "all" ? "No events for this club" : "No events available at the moment"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredEvents.map((event) => {
                  const isRegistered = isEventRegistered(event.id);
                  return (
                    <div
                      key={event.id}
                      className="bg-white rounded-xl border border-warm-200 overflow-hidden hover:shadow-lg transition"
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-foreground mb-1">{event.title}</h3>
                            {event.clubName && (
                              <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                                {event.clubName}
                              </span>
                            )}
                          </div>
                        </div>
                        {event.description && (
                          <p className="text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                        )}
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <p className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            {event.date}
                          </p>
                          {event.location && (
                            <p className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {event.location}
                            </p>
                          )}
                          <p className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            {event.attendees} interested
                          </p>
                        </div>
                        <button
                          onClick={() => isRegistered ? handleUnregisterEvent(event.id) : handleRegisterEvent(event.id)}
                          className={`w-full py-2.5 rounded-lg font-medium transition ${
                            isRegistered
                              ? "bg-primary text-white hover:bg-warm-600"
                              : "bg-warm-100 text-foreground hover:bg-warm-200"
                          }`}
                        >
                          {isRegistered ? "Registered" : "Register"}
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