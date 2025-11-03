import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Clock,
  MapPin,
  Plus,
  BookOpen,
  Award,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { studyGroupsAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function StudyGroups() {
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const currentUser = authAPI.getStoredUser();
  const [newGroup, setNewGroup] = useState({
    subject: "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxMembers: 10,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setLoadingRecommendations(true);

        const allGroups = await studyGroupsAPI.getAll();
        const allRecommendations = await studyGroupsAPI.getRecommendations();

        // filter groups by user's university
        const universityGroups = (allGroups || []).filter(
          (g) => g.university === currentUser.university
        );

        // filter recommendations where connections are members
        const connectionIds = currentUser.connections || [];
        const recommendedGroups = (allRecommendations || []).filter((g) =>
          g.members?.some((memberId: string) =>
            connectionIds.includes(memberId)
          )
        );

        setGroups(universityGroups);
        setRecommendations(recommendedGroups);
        setShowRecommendations(recommendedGroups.length > 0);
      } catch (error) {
        console.error("Failed to fetch study groups:", error);
        toast.error("Failed to load study groups");
        setGroups([]);
        setRecommendations([]);
      } finally {
        setLoading(false);
        setLoadingRecommendations(false);
      }
    };

    if (authAPI.isAuthenticated()) fetchData();
  }, []);

  const handleAIRecommendations = async () => {
    if (!authAPI.isAuthenticated()) {
      toast.error("Please log in to get personalized recommendations");
      return;
    }
    try {
      setLoadingRecommendations(true);
      const data = await studyGroupsAPI.getRecommendations();
      const connectionIds = currentUser.connections || [];
      const recommendedGroups = (data || []).filter((g) =>
        g.members?.some((id: string) => connectionIds.includes(id))
      );
      setRecommendations(recommendedGroups);
      setShowRecommendations(recommendedGroups.length > 0);
      toast.success("AI recommendations updated!");
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast.error("Failed to fetch recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studyGroupsAPI.create({
        ...newGroup,
        university: currentUser.university,
      });
      toast.success("Study group created successfully!");
      setDialogOpen(false);
      setNewGroup({
        subject: "",
        description: "",
        date: "",
        time: "",
        location: "",
        maxMembers: 10,
      });
      // refresh groups
      const allGroups = await studyGroupsAPI.getAll();
      setGroups(
        allGroups.filter((g) => g.university === currentUser.university)
      );
    } catch (error) {
      console.error("Failed to create study group:", error);
      toast.error("Failed to create study group");
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      await studyGroupsAPI.join(groupId);
      toast.success("Joined study group successfully!");
      const updatedGroups = groups.map((g) =>
        g.id === groupId
          ? { ...g, members: [...(g.members || []), currentUser.id] }
          : g
      );
      setGroups(updatedGroups);
    } catch (error) {
      console.error("Failed to join study group:", error);
      toast.error("Failed to join study group");
    }
  };

  const filteredGroups = groups.filter((group) => {
    if (!searchQuery) return true;
    return (
      group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-white mb-2">📚 Study Groups</h1>
            <p className="text-white/70">
              Find study partners and collaborative learning sessions
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleAIRecommendations}
              disabled={loadingRecommendations}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loadingRecommendations ? "Loading..." : "AI Recommendations"}
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Study Group</DialogTitle>
                  <DialogDescription>
                    Start a new study group and invite other students
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-white/90">
                      Subject/Course
                    </Label>
                    <Input
                      id="subject"
                      required
                      value={newGroup.subject}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, subject: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Calculus II (MATH 2414)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white/90">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      required
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          description: e.target.value,
                        })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Describe your study group..."
                      rows={3}
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
                        value={newGroup.date}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, date: e.target.value })
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
                        value={newGroup.time}
                        onChange={(e) =>
                          setNewGroup({ ...newGroup, time: e.target.value })
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="6:00 PM"
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
                      value={newGroup.location}
                      onChange={(e) =>
                        setNewGroup({ ...newGroup, location: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Library Study Room B"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxMembers" className="text-white/90">
                      Max Members
                    </Label>
                    <Input
                      id="maxMembers"
                      type="number"
                      min="2"
                      max="50"
                      required
                      value={newGroup.maxMembers}
                      onChange={(e) =>
                        setNewGroup({
                          ...newGroup,
                          maxMembers: parseInt(e.target.value),
                        })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
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
                      Create Group
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            placeholder="Search study groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
          />
        </div>
      </div>

      {/* AI Recommendations */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 backdrop-blur-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-400/30 rounded-full px-4 py-2">
              <Sparkles className="w-5 h-5 text-purple-300" />
              <span className="text-white">AI-Powered Recommendations</span>
            </div>
            <Button
              onClick={() => setShowRecommendations(false)}
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              Hide
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((group) => {
              const isMember = group.members?.includes(currentUser?.id);
              const isFull = group.members?.length >= group.maxMembers;
              const score = group.recommendationScore || 0;

              return (
                <div
                  key={group.id}
                  className="backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-[20px] p-6 shadow-xl hover:bg-purple-500/15 transition-all hover:scale-[1.02] relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full px-3 py-1 text-xs text-white shadow-lg">
                    <TrendingUp className="w-3 h-3" />
                    {score > 80
                      ? "Perfect Match"
                      : score > 50
                      ? "Great Match"
                      : "Good Match"}
                  </div>
                  <div className="flex items-start justify-between mb-4 mt-6">
                    <div className="flex-1">
                      <h3 className="text-white mb-2">{group.subject}</h3>
                      <p className="text-white/70 mb-3 line-clamp-2">
                        {group.description}
                      </p>
                    </div>
                    <div className="ml-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span>
                        {group.date} at {group.time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <MapPin className="w-4 h-4" />
                      <span>{group.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60">
                      <Users className="w-4 h-4" />
                      <span>
                        {group.members?.length || 0}/{group.maxMembers} members
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleJoinGroup(group.id)}
                    disabled={isMember || isFull}
                    className={`w-full border-0 ${
                      isMember
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : isFull
                        ? "bg-gray-600 text-white cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    }`}
                  >
                    {isMember ? "✓ Joined" : isFull ? "Full" : "Join Group"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center text-white py-12">
          Loading study groups...
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          <p>No study groups found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const isMember = group.members?.includes(currentUser?.id);
            const isFull = group.members?.length >= group.maxMembers;

            return (
              <div
                key={group.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white mb-2">{group.subject}</h3>
                    <p className="text-white/70 mb-3 line-clamp-2">
                      {group.description}
                    </p>
                  </div>
                  <div className="ml-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-white/60">
                    <Clock className="w-4 h-4" />
                    <span>
                      {group.date} at {group.time}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    <span>{group.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Users className="w-4 h-4" />
                    <span>
                      {group.members?.length || 0}/{group.maxMembers} members
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={isMember || isFull}
                  className={`w-full border-0 ${
                    isMember
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : isFull
                      ? "bg-gray-600 text-white cursor-not-allowed"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white"
                  }`}
                >
                  {isMember ? "✓ Joined" : isFull ? "Full" : "Join Group"}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
