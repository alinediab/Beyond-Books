import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import PublicNavbar from "@/components/PublicNavbar";
import Sidebar from "@/components/Sidebar";
import { 
  ArrowLeft, Calendar, MapPin, Clock, Users, Plus, Trash2, Edit, X, Save, 
  Loader2, Building2, FileText
} from "lucide-react";
import { clubApi, eventApi, attendApi } from "@shared/api";
import { toast } from "sonner";

export default function ClubDetail({ user, onLogout }) {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEventId, setDeletingEventId] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const queryClient = useQueryClient();

  const [eventFormData, setEventFormData] = useState({
    eventName: "",
    eventDescription: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    duration: "",
    durationUnit: "hours",
  });

  // Fetch club details
  const { data: clubData, isLoading: clubLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: async () => {
      const response = await clubApi.get(clubId);
      return response.data;
    },
    enabled: !!clubId,
  });

  // Fetch events for this club
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ['clubEvents', clubId],
    queryFn: async () => {
      const response = await eventApi.getByClub(clubId);
      return response.data || [];
    },
    enabled: !!clubId,
  });

  // Fetch attendees for selected event
  const { data: attendeesData, isLoading: attendeesLoading } = useQuery({
    queryKey: ['eventAttendees', selectedEventId],
    queryFn: async () => {
      const response = await attendApi.getEventAttendees(selectedEventId);
      return response.data || [];
    },
    enabled: !!selectedEventId,
  });

  const club = clubData;
  const events = eventsData || [];
  const attendees = attendeesData || [];

  const calculateDuration = (start, end) => {
    if (!start || !end) return { duration: "", durationUnit: "hours" };
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffMinutes < 0) diffMinutes += 24 * 60; // handle overnight
    if (diffMinutes >= 60 && diffMinutes % 60 === 0) {
      return { duration: diffMinutes / 60, durationUnit: "hours" };
    }
    return { duration: diffMinutes, durationUnit: "minutes" };
  };

  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "startTime" || name === "endTime") {
        const start = name === "startTime" ? value : prev.startTime;
        const end = name === "endTime" ? value : prev.endTime;
        const { duration, durationUnit } = calculateDuration(start, end);
        updated.duration = duration;
        updated.durationUnit = durationUnit;
      }
      return updated;
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();

    if (!eventFormData.eventName || !eventFormData.eventDate) {
      toast.error("Event name and date are required");
      return;
    }

    try {
      const submitData = {
        ...eventFormData,
        clubID: parseInt(clubId),
        semesterID: null, // Can be added later if needed
      };

      if (editingEvent) {
        await eventApi.update(editingEvent.eventID, submitData);
        toast.success("Event updated successfully!");
      } else {
        await eventApi.create(submitData);
        toast.success("Event created successfully!");
      }

      setEventFormData({
        eventName: "",
        eventDescription: "",
        eventDate: "",
        startTime: "",
        endTime: "",
        location: "",
        duration: "",
        durationUnit: "hours",
      });
      setShowEventForm(false);
      setEditingEvent(null);
      queryClient.invalidateQueries(['clubEvents', clubId]);
    } catch (error) {
      toast.error(error?.message || "Failed to save event. Please try again.");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventFormData({
      eventName: event.eventName || "",
      eventDescription: event.eventDescription || "",
      eventDate: event.eventDate ? new Date(event.eventDate).toISOString().split('T')[0] : "",
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      duration: event.duration || "",
      durationUnit: event.durationUnit || "hours",
    });
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      setDeletingEventId(eventId);
      await eventApi.delete(eventId);
      toast.success("Event deleted successfully!");
      queryClient.invalidateQueries(['clubEvents', clubId]);
    } catch (error) {
      toast.error("Failed to delete event. Please try again.");
    } finally {
      setDeletingEventId(null);
    }
  };

  const handleCancelEventForm = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    setEventFormData({
      eventName: "",
      eventDescription: "",
      eventDate: "",
      startTime: "",
      endTime: "",
      location: "",
      duration: "",
      durationUnit: "hours",
    });
  };

  if (clubLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Club not found</p>
          <button
            onClick={() => navigate("/clubs-manage")}
            className="text-primary hover:text-warm-600"
          >
            Go back to clubs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <PublicNavbar user={user} onLogout={onLogout} />

      <div className="flex flex-1 overflow-hidden min-h-0">
        <Sidebar user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 overflow-auto min-h-0">
          <div className="p-4 sm:p-8 max-w-7xl">
            {/* Header */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/clubs-manage")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Clubs
              </button>
              <div className="bg-gradient-to-r from-primary to-warm-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-bold mb-2">{club.clubName}</h1>
                    {club.description && (
                      <p className="text-primary-foreground opacity-90">{club.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all font-medium flex items-center gap-2 border border-white/30"
                  >
                    <Plus className="w-5 h-5" />
                    Add Event
                  </button>
                </div>
              </div>
            </div>

            {/* Club Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {club.meetingLocation && (
                <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Meeting Location</h3>
                  </div>
                  <p className="text-muted-foreground">{club.meetingLocation}</p>
                </div>
              )}
              {club.memberCount !== undefined && (
                <div className="bg-white rounded-xl border border-warm-200 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-foreground">Members</h3>
                  </div>
                  <p className="text-muted-foreground">{club.memberCount || 0} members</p>
                </div>
              )}
            </div>

            {/* Event Form */}
            {showEventForm && (
              <div className="bg-white rounded-xl border border-warm-200 p-6 mb-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-foreground">
                    {editingEvent ? "Edit Event" : "Create New Event"}
                  </h3>
                  <button
                    onClick={handleCancelEventForm}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleEventSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      name="eventName"
                      value={eventFormData.eventName}
                      onChange={handleEventFormChange}
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      name="eventDescription"
                      value={eventFormData.eventDescription}
                      onChange={handleEventFormChange}
                      rows="4"
                      className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Event Date *
                      </label>
                      <input
                        type="date"
                        name="eventDate"
                        value={eventFormData.eventDate}
                        onChange={handleEventFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={eventFormData.location}
                        onChange={handleEventFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={eventFormData.startTime}
                        onChange={handleEventFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={eventFormData.endTime}
                        onChange={handleEventFormChange}
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
                        value={eventFormData.duration}
                        onChange={handleEventFormChange}
                        min="1"
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Duration Unit
                      </label>
                      <select
                        name="durationUnit"
                        value={eventFormData.durationUnit}
                        onChange={handleEventFormChange}
                        className="w-full px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="minutes">Minutes</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-warm-600 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Save className="w-5 h-5" />
                      {editingEvent ? "Update Event" : "Create Event"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEventForm}
                      className="flex-1 bg-warm-100 text-foreground py-3 rounded-lg hover:bg-warm-200 transition font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Events List */}
            <div className="bg-white rounded-xl border border-warm-200 shadow-sm">
              <div className="p-6 border-b border-warm-200">
                <h3 className="text-2xl font-bold text-foreground">Club Events</h3>
              </div>
              {eventsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : events.length > 0 ? (
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {events.map((event) => (
                    <div
                      key={event.eventID}
                      className={`bg-white border rounded-xl overflow-hidden transition-all ${
                        selectedEventId === event.eventID 
                          ? "border-primary ring-2 ring-primary/20 shadow-lg" 
                          : "border-warm-200 hover:shadow-lg hover:border-warm-300"
                      }`}
                    >
                      {/* Event Header with gradient */}
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b border-warm-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-foreground">{event.eventName}</h4>
                            {event.eventDate && (
                              <p className="text-sm text-primary font-medium mt-1">
                                {new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }}
                              className="p-2 text-primary hover:bg-primary/10 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.eventID); }}
                              disabled={deletingEventId === event.eventID}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            >
                              {deletingEventId === event.eventID ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Event Body */}
                      <div className="p-4">
                        {event.eventDescription && (
                          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{event.eventDescription}</p>
                        )}
                        
                        <div className="space-y-2">
                          {(event.startTime || event.endTime) && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <Clock className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-muted-foreground">
                                {event.startTime} {event.endTime && `- ${event.endTime}`}
                              </span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-primary" />
                              </div>
                              <span className="text-muted-foreground">{event.location}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Attendees Button */}
                        <button
                          className={`w-full mt-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                            selectedEventId === event.eventID
                              ? "bg-primary text-white"
                              : "bg-warm-100 text-foreground hover:bg-warm-200"
                          }`}
                          onClick={() => setSelectedEventId(selectedEventId === event.eventID ? null : event.eventID)}
                        >
                          <Users className="w-4 h-4" />
                          <span>{event.attendeeCount || 0} Attendees</span>
                        </button>
                      </div>
                      
                      {/* Attendees Panel */}
                      {selectedEventId === event.eventID && (
                        <div className="border-t border-warm-200 bg-warm-50 p-4">
                          <h5 className="font-bold text-foreground mb-3 text-sm">
                            Registered Attendees
                          </h5>
                          {attendeesLoading ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="w-6 h-6 animate-spin text-primary" />
                            </div>
                          ) : attendees.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {attendees.map((attendee) => (
                                <div
                                  key={attendee.studentID}
                                  className="bg-white rounded-lg p-3 border border-warm-200 flex items-center gap-3"
                                >
                                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                    <span className="text-primary font-bold text-sm">
                                      {attendee.name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground text-sm truncate">{attendee.name}</p>
                                    <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-center py-4 text-sm">No attendees yet</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No events yet. Create the first event for this club!</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

