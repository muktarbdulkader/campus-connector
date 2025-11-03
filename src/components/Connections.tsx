import { useState, useEffect } from "react";
import { Users, Search, UserPlus, UserCheck, UserX, Mail, Briefcase, GraduationCap, Award, X, Check } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { connectionsAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function Connections() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<string[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authAPI.getStoredUser();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, connectionsData] = await Promise.all([
        connectionsAPI.getAllUsers(),
        connectionsAPI.getConnections(),
      ]);
      
      setAllUsers(usersData);
      setConnections(connectionsData.connections);
      setPendingRequests(connectionsData.pending);
      setReceivedRequests(connectionsData.received);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await connectionsAPI.sendRequest(userId);
      toast.success("Connection request sent!");
      fetchData();
    } catch (error) {
      console.error("Failed to send request:", error);
      toast.error("Failed to send connection request");
    }
  };

  const handleAcceptRequest = async (requesterId: string) => {
    try {
      await connectionsAPI.acceptRequest(requesterId);
      toast.success("Connection accepted!");
      fetchData();
    } catch (error) {
      console.error("Failed to accept request:", error);
      toast.error("Failed to accept connection");
    }
  };

  const handleRejectRequest = async (requesterId: string) => {
    try {
      await connectionsAPI.rejectRequest(requesterId);
      toast.success("Connection request rejected");
      fetchData();
    } catch (error) {
      console.error("Failed to reject request:", error);
      toast.error("Failed to reject connection");
    }
  };

  const handleRemoveConnection = async (userId: string) => {
    try {
      await connectionsAPI.removeConnection(userId);
      toast.success("Connection removed");
      fetchData();
    } catch (error) {
      console.error("Failed to remove connection:", error);
      toast.error("Failed to remove connection");
    }
  };

  // Calculate recommendation score
  const getRecommendationScore = (user: any) => {
    let score = 0;
    
    // HIGHEST PRIORITY: Same university
    if (user.university && user.university === currentUser?.university) score += 50;
    
    // High priority: Same department
    if (user.department === currentUser?.department) score += 30;
    
    // Medium priority: Same year
    if (user.year === currentUser?.year) score += 20;
    
    // Skills matching
    const userSkills = user.skills?.toLowerCase().split(',').map((s: string) => s.trim()) || [];
    const currentSkills = currentUser?.skills?.toLowerCase().split(',').map((s: string) => s.trim()) || [];
    const commonSkills = userSkills.filter((skill: string) => currentSkills.includes(skill));
    score += commonSkills.length * 10;
    
    return score;
  };

  // Filter and sort users
  const connectedUserIds = new Set(connections.map((c: any) => c.id));
  const availableUsers = allUsers.filter((user) => {
    if (connectedUserIds.has(user.id)) return false;
    if (pendingRequests.includes(user.id)) return false;
    if (receivedRequests.includes(user.id)) return false;
    
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Sort by recommendation score
  const recommendedUsers = [...availableUsers]
    .sort((a, b) => getRecommendationScore(b) - getRecommendationScore(a))
    .slice(0, 20);

  const requestUsers = allUsers.filter((user) => receivedRequests.includes(user.id));

  const UserCard = ({ user, action }: { user: any; action: React.ReactNode }) => {
    const matchScore = getRecommendationScore(user);
    
    return (
      <div className={`backdrop-blur-xl ${matchScore >= 70 ? 'bg-gradient-to-br from-emerald-500/15 to-teal-500/15 border-emerald-400/40' : 'bg-white/10 border-white/20'} border rounded-[20px] p-6 shadow-xl hover:${matchScore >= 70 ? 'shadow-emerald-500/20' : 'shadow-indigo-500/20'} hover:scale-[1.02] transition-all duration-300`}>
        {matchScore >= 70 && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full px-3 py-1 text-xs shadow-lg animate-pulse">
            ⭐ Perfect Match
          </div>
        )}
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg ring-4 ring-white/10">
              <span className="text-2xl">{user.fullName?.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="text-white mb-1">{user.fullName}</h3>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Mail className="w-3 h-3" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {user.university && (
            <div className="flex items-center gap-2 text-white/80">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span className="capitalize">{user.university.replace('-', ' ')}</span>
            </div>
          )}
          {user.department && (
            <div className="flex items-center gap-2 text-white/70">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{user.department.replace('-', ' ')}</span>
            </div>
          )}
          {user.year && (
            <div className="flex items-center gap-2 text-white/70">
              <Award className="w-4 h-4" />
              <span>Year {user.year}</span>
            </div>
          )}
        </div>

        {user.skills && (
          <div className="flex flex-wrap gap-2 mb-4">
            {user.skills.split(',').slice(0, 3).map((skill: string, index: number) => (
              <Badge
                key={index}
                className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-200 border-indigo-400/30 hover:from-indigo-500/30 hover:to-purple-500/30 transition-all"
              >
                {skill.trim()}
              </Badge>
            ))}
          </div>
        )}

        {/* Recommendation badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {user.university === currentUser?.university && (
            <Badge className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-400/30 animate-pulse">
              🎓 Same University
            </Badge>
          )}
          {user.department === currentUser?.department && (
            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
              💼 Same Department
            </Badge>
          )}
          {user.year === currentUser?.year && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              📚 Same Year
            </Badge>
          )}
        </div>

        <div className="mt-4">{action}</div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-400/30 rounded-[20px] p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-white mb-1">🤝 Campus Network</h1>
              <p className="text-white/70">Connect with students from your university</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-white">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-center hover:bg-white/20 transition-all">
              <div className="text-2xl">{connections.length}</div>
              <div className="text-sm text-white/60">Connections</div>
            </div>
            {receivedRequests.length > 0 && (
              <div className="backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-xl px-6 py-3 text-center hover:scale-105 transition-all animate-pulse">
                <div className="text-2xl text-yellow-300">{receivedRequests.length}</div>
                <div className="text-sm text-white/60">Requests</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            placeholder="Search by name, department, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
          />
        </div>
      </div>

      <Tabs defaultValue="discover" className="space-y-6">
        <TabsList className="bg-white/10 border border-white/20 backdrop-blur-xl">
          <TabsTrigger value="discover" className="data-[state=active]:bg-white/20 text-white">
            Discover
          </TabsTrigger>
          <TabsTrigger value="connections" className="data-[state=active]:bg-white/20 text-white">
            My Connections ({connections.length})
          </TabsTrigger>
          {receivedRequests.length > 0 && (
            <TabsTrigger value="requests" className="data-[state=active]:bg-white/20 text-white">
              Requests ({receivedRequests.length})
            </TabsTrigger>
          )}
        </TabsList>

        {/* Discover Tab */}
        <TabsContent value="discover" className="space-y-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-[20px] p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white mb-1">✨ Recommended For You</h2>
                <p className="text-white/60 text-sm">
                  Based on your university, department, year, and shared interests
                </p>
              </div>
            </div>

            {loading ? (
              <div className="text-center text-white py-12">Loading...</div>
            ) : recommendedUsers.length === 0 ? (
              <div className="text-center text-white/70 py-12">
                <p>No recommendations available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    action={
                      <Button
                        onClick={() => handleSendRequest(user.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* My Connections Tab */}
        <TabsContent value="connections" className="space-y-6">
          {loading ? (
            <div className="text-center text-white py-12">Loading...</div>
          ) : connections.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-12 shadow-xl text-center">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-white mb-2">No connections yet</h3>
              <p className="text-white/60">
                Start building your network by connecting with other students
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  action={
                    <Button
                      onClick={() => handleRemoveConnection(user.id)}
                      variant="outline"
                      className="w-full bg-white/10 hover:bg-red-600/20 text-white border-white/30"
                    >
                      <UserX className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        {receivedRequests.length > 0 && (
          <TabsContent value="requests" className="space-y-6">
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
              <h2 className="text-white mb-4">📬 Connection Requests</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requestUsers.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    action={
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleAcceptRequest(user.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0"
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(user.id)}
                          variant="outline"
                          className="flex-1 bg-white/10 hover:bg-red-600/20 text-white border-white/30"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
