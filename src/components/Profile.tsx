import { useState, useEffect } from "react";
import {
  Mail,
  Calendar,
  Star,
  Edit,
  Save,
  X,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  authAPI,
  profileAPI,
  connectionsAPI,
  eventsAPI,
  studyGroupsAPI,
} from "../utils/api";
import { toast } from "sonner@2.0.3";

export function Profile() {
  const [user, setUser] = useState(authAPI.getStoredUser() || {});
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    fullName: user.fullName || "",
    email: user.email || "",
    university: user.university || "",
    department: user.department || "",
    year: user.year || "",
    skills: user.skills || "",
  });

  const [connections, setConnections] = useState<any[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<any[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<any[]>([]);

  // Fetch profile, connections, events, groups
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Fetch fresh user data
        const updatedUser = await authAPI.getCurrentUser();
        setUser(updatedUser);
        setEditedData({
          fullName: updatedUser.fullName || "",
          email: updatedUser.email || "",
          university: updatedUser.university || "",
          department: updatedUser.department || "",
          year: updatedUser.year || "",
          skills: updatedUser.skills || "",
        });
        localStorage.setItem("campusconnect_user", JSON.stringify(updatedUser));

        // Fetch connections, events, groups
        const [allConnections, events, groups] = await Promise.all([
          connectionsAPI.getConnections().catch(() => []),
          eventsAPI.getAll().catch(() => []),
          studyGroupsAPI.getAll().catch(() => []),
        ]);

        setConnections(allConnections || []);

        // Build connected user IDs
        const connectedUserIds = new Set<string>();
        (allConnections || []).forEach((c: any) => {
          if (c.userId) connectedUserIds.add(c.userId);
          if (c.connectedUserId) connectedUserIds.add(c.connectedUserId);
        });

        // Helper: include current user, connected users, or same university
        const includeItem = (item: any) => {
          if (!item) return false;
          const itemUserId = item.userId || item.ownerId || item.createdBy;
          const itemUniversity = item.university || item.school;
          return (
            itemUserId === updatedUser.id ||
            connectedUserIds.has(itemUserId) ||
            (itemUniversity && itemUniversity === updatedUser.university)
          );
        };

        setJoinedEvents(
          (events || []).filter(
            (e: any) =>
              e.participants?.includes(updatedUser.id) || includeItem(e)
          )
        );
        setJoinedGroups(
          (groups || []).filter(
            (g: any) => g.members?.includes(updatedUser.id) || includeItem(g)
          )
        );
      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, []);

  const handleSaveProfile = async () => {
    try {
      const updatedProfile = await profileAPI.update(editedData);
      setUser(updatedProfile);
      localStorage.setItem(
        "campusconnect_user",
        JSON.stringify(updatedProfile)
      );
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleCancelEdit = () => {
    setEditedData({
      fullName: user.fullName || "",
      email: user.email || "",
      university: user.university || "",
      department: user.department || "",
      year: user.year || "",
      skills: user.skills || "",
    });
    setIsEditing(false);
  };

  const achievements = [
    { name: "Early Adopter", description: "Joined Campus Connect", icon: "🌟" },
    { name: "Active Member", description: "Regular platform user", icon: "🎯" },
    {
      name: "Community Builder",
      description: "Contributing to campus life",
      icon: "🤝",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Profile Header */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[20px] p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl ring-4 ring-white/20">
              <span className="text-white text-5xl">
                {user.fullName ? user.fullName.charAt(0).toUpperCase() : "?"}
              </span>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-white/90">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={editedData.fullName}
                    onChange={(e) =>
                      setEditedData({ ...editedData, fullName: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                  />
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/90">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editedData.email}
                    disabled
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 opacity-70"
                  />
                </div>
                {/* University */}
                <div className="space-y-2">
                  <Label htmlFor="university" className="text-white/90">
                    University
                  </Label>
                  <Input
                    id="university"
                    value={editedData.university}
                    onChange={(e) =>
                      setEditedData({
                        ...editedData,
                        university: e.target.value,
                      })
                    }
                    placeholder="e.g., Haramaya University..."
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                  />
                </div>
                {/* Department & Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-white/90">
                      Department
                    </Label>
                    <Input
                      id="department"
                      value={editedData.department}
                      onChange={(e) =>
                        setEditedData({
                          ...editedData,
                          department: e.target.value,
                        })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-white/90">
                      Year
                    </Label>
                    <Input
                      id="year"
                      value={editedData.year}
                      onChange={(e) =>
                        setEditedData({ ...editedData, year: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                    />
                  </div>
                </div>
                {/* Skills */}
                <div className="space-y-2">
                  <Label htmlFor="skills" className="text-white/90">
                    Skills
                  </Label>
                  <Input
                    id="skills"
                    value={editedData.skills}
                    onChange={(e) =>
                      setEditedData({ ...editedData, skills: e.target.value })
                    }
                    placeholder="e.g., JavaScript, Python, React..."
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                  />
                </div>
                {/* Save / Cancel */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0 shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    className="bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-white mb-2">
                      {user.fullName || "Student"}
                    </h1>
                    <p className="text-white/70">
                      {user.department ? (
                        <span className="capitalize">
                          {user.department.replace("-", " ")}
                        </span>
                      ) : (
                        "Department not set"
                      )}{" "}
                      •{" "}
                      {user.year
                        ? `${user.year}${
                            user.year === "1"
                              ? "st"
                              : user.year === "2"
                              ? "nd"
                              : user.year === "3"
                              ? "rd"
                              : "th"
                          } Year`
                        : "Year not set"}
                    </p>
                  </div>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg"
                  >
                    <Edit className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-white/80">
                    <Mail className="w-5 h-5 text-indigo-300" />
                    <span>{user.email || "Email not set"}</span>
                  </div>
                  {user.university && (
                    <div className="flex items-center gap-2 text-white/80">
                      <GraduationCap className="w-5 h-5 text-emerald-300" />
                      <span className="capitalize">
                        {user.university.replace("-", " ")}
                      </span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center gap-2 text-white/80">
                      <Briefcase className="w-5 h-5 text-purple-300" />
                      <span className="capitalize">
                        {user.department.replace("-", " ")}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-white/80">
                    <Calendar className="w-5 h-5 text-pink-300" />
                    <span>
                      Joined{" "}
                      {new Date(
                        user.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {user.skills && (
                  <div className="mt-4">
                    <p className="text-white/70 mb-2">Skills & Interests</p>
                    <div className="flex flex-wrap gap-2">
                      {user.skills
                        .split(",")
                        .map((skill: string, idx: number) => (
                          <Badge
                            key={idx}
                            className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border-indigo-400/30 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
                          >
                            {skill.trim()}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl text-center hover:bg-white/15 hover:scale-105 transition-all">
          <div className="text-3xl mb-2">📅</div>
          <div className="text-white mb-1">{joinedEvents.length || 0}</div>
          <p className="text-white/70 text-sm">Events Joined</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl text-center hover:bg-white/15 hover:scale-105 transition-all">
          <div className="text-3xl mb-2">📚</div>
          <div className="text-white mb-1">{joinedGroups.length || 0}</div>
          <p className="text-white/70 text-sm">Study Groups</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl text-center hover:bg-white/15 hover:scale-105 transition-all">
          <div className="text-3xl mb-2">🏆</div>
          <div className="text-white mb-1">
            {user?.achievements?.length || 0}
          </div>
          <p className="text-white/70 text-sm">Achievements</p>
        </div>
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl text-center hover:bg-white/15 hover:scale-105 transition-all">
          <div className="text-3xl mb-2">🤝</div>
          <div className="text-white mb-1">{connections.length || 0}</div>
          <p className="text-white/70 text-sm">Connections</p>
        </div>
      </div>

      {/* Achievements */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
        <h2 className="text-white mb-6">🏆 Achievements</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {achievements.map((achievement, idx) => (
            <div
              key={idx}
              className="backdrop-blur-sm bg-gradient-to-br from-white/5 to-white/10 border border-white/10 rounded-xl p-6 hover:bg-white/15 hover:scale-105 transition-all text-center group"
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                {achievement.icon}
              </div>
              <h3 className="text-white mb-2">{achievement.name}</h3>
              <p className="text-white/60 text-sm">{achievement.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-[20px] p-8 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white mb-4">About Your Profile</h2>
            <p className="text-white/70">
              Welcome to your Campus Connect profile! Here you can manage your
              information, track your activities, and see your achievements
              across the platform. Connect with fellow students, join events,
              share exam resources, and make the most of your campus experience.
              Keep your profile updated to get better AI-powered
              recommendations!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
