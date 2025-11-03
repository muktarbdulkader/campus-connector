import { useState, useEffect } from "react";
import { Calendar, MapPin, Users, Clock, Search, Plus } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { eventsAPI, authAPI, connectionsAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [connections, setConnections] = useState<string[]>([]);
  const currentUser = authAPI.getStoredUser();

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    category: "",
    phone: "",
    organizer: currentUser?.fullName || "",
    attendees: [] as string[],
    university: currentUser?.university || "",
  });

  useEffect(() => {
    fetchConnections();
    fetchEvents();
  }, []);

  const fetchConnections = async () => {
    try {
      const data = await connectionsAPI.getConnections();
      // Ensure data is an array before mapping
      const connections = Array.isArray(data)
        ? data.map((c: any) => c.id || c) // Handle both object with id and direct id
        : [];
      setConnections(connections);
    } catch (error) {
      console.error("Failed to fetch connections:", error);
      setConnections([]);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsAPI.getAll();
      setEvents(
        Array.isArray(data)
          ? data.map((ev) => ({ ...ev, attendees: ev.attendees || [] }))
          : []
      );
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setEvents([]);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventsAPI.create({ ...newEvent, attendees: [] });
      toast.success("Event created successfully!");
      setDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        date: "",
        time: "",
        location: "",
        category: "",
        phone: "",
        organizer: currentUser?.fullName || "",
        attendees: [],
        university: currentUser?.university || "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Failed to create event:", error);
      toast.error("Failed to create event");
    }
  };

  const handleJoinEvent = async (eventId: string) => {
    try {
      const eventToJoin = events.find((ev) => ev.id === eventId);
      if (!eventToJoin) return;

      if (!eventToJoin.attendees.includes(currentUser?.id)) {
        // Use the join endpoint instead of update
        await eventsAPI.join(eventId);
        toast.success("Joined event successfully!");
        // Refresh the events list to show the updated attendees
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to join event:", error);
      toast.error("Failed to join event");
    }
  };

  const categories = [
    { value: "all", label: "All Events" },
    { value: "academic", label: "Academic" },
    { value: "sports", label: "Sports" },
    { value: "social", label: "Social" },
    { value: "career", label: "Career" },
  ];

  const filteredEvents = events.filter((event) => {
    const isRelevant =
      event.university === currentUser?.university ||
      connections.includes(event.organizerId);

    const matchesCategory =
      selectedFilter === "all" || event.category === selectedFilter;

    const matchesSearch =
      searchQuery === "" ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());

    return isRelevant && matchesCategory && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      academic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      sports: "bg-green-500/20 text-green-300 border-green-500/30",
      social: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      career: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    };
    return (
      colors[category] || "bg-gray-500/20 text-gray-300 border-gray-500/30"
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-white mb-2">📅 Campus Events</h1>
            <p className="text-white/70">
              Discover and join events happening around campus
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create New Event
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  Fill in the details to create a new campus event
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateEvent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/90">
                    Event Title
                  </Label>
                  <Input
                    id="title"
                    required
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Tech Talk: AI in Education"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/90">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    required
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Describe your event..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-white/90">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    required
                    value={newEvent.phone}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, phone: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="123-456-7890"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-white/90">
                      Date
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      required
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white/90">
                      Time
                    </Label>
                    <Input
                      id="time"
                      required
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="3:00 PM - 5:00 PM"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-white/90">
                    Location
                  </Label>
                  <Input
                    id="location"
                    required
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Tech Hub 101"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/90">
                    Category
                  </Label>
                  <Select
                    value={newEvent.category}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, category: value })
                    }
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                  >
                    Create Event
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                onClick={() => setSelectedFilter(category.value)}
                className={`border-0 ${
                  selectedFilter === category.value
                    ? "bg-white/30 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="text-center text-white py-12">Loading events...</div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          <p>No relevant events found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isJoined = event.attendees?.includes(currentUser?.id);
            return (
              <div
                key={event.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] overflow-hidden shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white/30" />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full border ${getCategoryColor(
                        event.category
                      )}`}
                    >
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white mb-3">{event.title}</h3>
                  <p className="text-white/70 mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <Calendar className="w-4 h-4" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees?.length || 0} attending</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleJoinEvent(event.id)}
                    disabled={isJoined}
                    className={`w-full border-0 ${
                      isJoined
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {isJoined ? "✓ Registered" : "Register Now"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
