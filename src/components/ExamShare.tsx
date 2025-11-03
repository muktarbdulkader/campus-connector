import { useState, useEffect } from "react";
import { Search, Upload, Download, ThumbsUp, FileText, Calendar, BookOpen, Sparkles, TrendingUp, Users } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { examResourcesAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function ExamShare() {
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("all");
  const currentUser = authAPI.getStoredUser();

  const [newResource, setNewResource] = useState({
    course: "",
    title: "",
    description: "",
    type: "",
    year: "",
    semester: "",
    fileUrl: "",
  });

  useEffect(() => {
    fetchResources();
    if (authAPI.isAuthenticated()) {
      fetchRecommendations();
    }
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await examResourcesAPI.getAll();
      setResources(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch exam resources:", error);
      setResources([]);
      toast.error("Failed to load exam resources");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const data = await examResourcesAPI.getRecommendations();
      setRecommendations(Array.isArray(data) ? data : []);
      if (data && data.length > 0) {
        setShowRecommendations(true);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleAIRecommendations = async () => {
    if (!authAPI.isAuthenticated()) {
      toast.error("Please log in to get personalized recommendations");
      return;
    }
    await fetchRecommendations();
    toast.success("AI recommendations updated!");
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await examResourcesAPI.create(newResource);
      toast.success("Exam resource shared successfully!");
      setDialogOpen(false);
      setNewResource({
        course: "",
        title: "",
        description: "",
        type: "",
        year: "",
        semester: "",
        fileUrl: "",
      });
      fetchResources();
    } catch (error) {
      console.error("Failed to share exam resource:", error);
      toast.error("Failed to share exam resource");
    }
  };

  const handleDownload = async (resourceId: string, fileUrl: string) => {
    try {
      await examResourcesAPI.download(resourceId);
      if (fileUrl) {
        window.open(fileUrl, '_blank');
      }
      toast.success("Resource accessed!");
      fetchResources();
    } catch (error) {
      console.error("Failed to download resource:", error);
      toast.error("Failed to access resource");
    }
  };

  const handleMarkHelpful = async (resourceId: string) => {
    try {
      await examResourcesAPI.markHelpful(resourceId);
      toast.success("Marked as helpful!");
      fetchResources();
      if (showRecommendations) {
        fetchRecommendations();
      }
    } catch (error) {
      console.error("Failed to mark as helpful:", error);
      toast.error("Failed to mark as helpful");
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = searchQuery === "" || 
      resource.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === "all" || resource.type === selectedType;
    
    return matchesSearch && matchesType;
  });

  const resourceTypes = [
    { value: "past-papers", label: "Past Exam Papers", icon: "📝" },
    { value: "notes", label: "Study Notes", icon: "📓" },
    { value: "cheatsheet", label: "Cheat Sheets", icon: "📋" },
    { value: "solutions", label: "Solutions", icon: "✅" },
    { value: "summary", label: "Summary", icon: "📄" },
    { value: "flashcards", label: "Flashcards", icon: "🎴" },
  ];

  const getTypeIcon = (type: string) => {
    const typeObj = resourceTypes.find(t => t.value === type);
    return typeObj?.icon || "📚";
  };

  const ResourceCard = ({ resource, isRecommended = false }: { resource: any; isRecommended?: boolean }) => {
    const isMyResource = resource.uploaderId === currentUser?.id;
    const score = resource.recommendationScore || 0;
    const isConnectionResource = score > 150;

    return (
      <div
        className={`backdrop-blur-xl ${
          isRecommended
            ? isConnectionResource
              ? "bg-gradient-to-br from-pink-500/15 via-purple-500/15 to-indigo-500/15 border-pink-400/40 ring-2 ring-pink-400/20"
              : "bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-400/30"
            : "bg-white/10 border border-white/20"
        } rounded-[20px] p-6 shadow-xl hover:shadow-2xl hover:${
          isRecommended ? "scale-[1.03]" : "scale-[1.02]"
        } transition-all duration-300 relative overflow-hidden group`}
      >
        {/* Animated background gradient */}
        {isRecommended && (
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* AI Badge for recommendations */}
        {isRecommended && (
          <div className={`absolute -top-2 -right-2 flex items-center gap-1 ${
            isConnectionResource 
              ? 'bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 animate-pulse' 
              : 'bg-gradient-to-r from-emerald-600 to-teal-600'
          } rounded-full px-3 py-1 text-xs text-white shadow-lg z-10`}>
            <TrendingUp className="w-3 h-3" />
            {isConnectionResource ? "🤝 From Connection" : score > 100 ? "⭐ Top Match" : "✨ For You"}
          </div>
        )}

        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl drop-shadow-lg">{getTypeIcon(resource.type)}</span>
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 shadow-lg">
                {resourceTypes.find(t => t.value === resource.type)?.label || resource.type}
              </Badge>
            </div>
            <h3 className="text-white mb-2 group-hover:text-indigo-200 transition-colors">{resource.title}</h3>
            <p className="text-white/90 mb-1">{resource.course}</p>
            <p className="text-white/70 text-sm line-clamp-2">{resource.description}</p>
          </div>
        </div>

        <div className="space-y-2 mb-4 relative z-10">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>{resource.year} • <span className="capitalize">{resource.semester}</span></span>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Users className="w-4 h-4 text-purple-300" />
            <span>Shared by <span className="text-white/90">{resource.uploaderName}</span></span>
          </div>
          <div className="flex items-center gap-4 text-white/70 text-sm">
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
              <Download className="w-4 h-4 text-teal-300" />
              <span className="text-white">{resource.downloads || 0}</span>
            </div>
            <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
              <ThumbsUp className="w-4 h-4 text-emerald-300" />
              <span className="text-white">{resource.helpful || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 relative z-10">
          <Button
            onClick={() => handleDownload(resource.id, resource.fileUrl)}
            className={`flex-1 ${
              isRecommended
                ? isConnectionResource
                  ? "bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-700 hover:via-purple-700 hover:to-indigo-700 shadow-lg"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg"
                : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            } text-white border-0 shadow-md hover:shadow-xl transition-all`}
          >
            <Download className="w-4 h-4 mr-2" />
            View Resource
          </Button>
          {!isMyResource && (
            <Button
              onClick={() => handleMarkHelpful(resource.id)}
              variant="outline"
              className="bg-white/10 hover:bg-emerald-500/20 text-white border-white/30 hover:border-emerald-400/50 transition-all"
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-white mb-2">📚 Exam Resources</h1>
            <p className="text-white/70">Share and access study materials, past papers, and notes</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleAIRecommendations}
              disabled={loadingRecommendations}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {loadingRecommendations ? "Loading..." : "AI Recommendations"}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Share Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-white">Share Exam Resource</DialogTitle>
                  <DialogDescription className="text-white/70">
                    Help fellow students by sharing study materials
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateResource} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="course" className="text-white/90">Course Code & Name</Label>
                    <Input
                      id="course"
                      required
                      value={newResource.course}
                      onChange={(e) => setNewResource({ ...newResource, course: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="CS 101 - Introduction to Computer Science"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white/90">Title</Label>
                    <Input
                      id="title"
                      required
                      value={newResource.title}
                      onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Midterm Exam 2024 with Solutions"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white/90">Description</Label>
                    <Textarea
                      id="description"
                      required
                      value={newResource.description}
                      onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Describe the resource..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white/90">Resource Type</Label>
                      <Select
                        value={newResource.type}
                        onValueChange={(value) => setNewResource({ ...newResource, type: value })}
                      >
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-indigo-900 border-white/20 text-white">
                          {resourceTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">
                              {type.icon} {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year" className="text-white/90">Academic Year</Label>
                      <Input
                        id="year"
                        required
                        value={newResource.year}
                        onChange={(e) => setNewResource({ ...newResource, year: e.target.value })}
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="2024"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester" className="text-white/90">Semester</Label>
                    <Select
                      value={newResource.semester}
                      onValueChange={(value) => setNewResource({ ...newResource, semester: value })}
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent className="bg-indigo-900 border-white/20 text-white">
                        <SelectItem value="fall" className="text-white hover:bg-white/10">Fall</SelectItem>
                        <SelectItem value="spring" className="text-white hover:bg-white/10">Spring</SelectItem>
                        <SelectItem value="summer" className="text-white hover:bg-white/10">Summer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fileUrl" className="text-white/90">File URL (Optional)</Label>
                    <Input
                      id="fileUrl"
                      value={newResource.fileUrl}
                      onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="https://drive.google.com/..."
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
                      Share Resource
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
            <Input
              placeholder="Search exam resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-[200px] bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-indigo-900 border-white/20 text-white">
              <SelectItem value="all" className="text-white hover:bg-white/10">All Types</SelectItem>
              {resourceTypes.map((type) => (
                <SelectItem key={type.value} value={type.value} className="text-white hover:bg-white/10">
                  {type.icon} {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* AI Recommendations Section */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border border-emerald-400/30 rounded-[20px] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white mb-1">✨ AI-Powered Recommendations</h2>
                  <p className="text-white/70 text-sm">
                    Personalized for you based on your connections, university, and interests
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowRecommendations(false)}
                variant="ghost"
                className="text-white/60 hover:text-white hover:bg-white/20"
              >
                Hide
              </Button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} isRecommended={true} />
            ))}
          </div>
          
          {recommendations.length === 0 && (
            <div className="text-center text-white/70 py-8">
              <p>No personalized recommendations available yet. Connect with more students!</p>
            </div>
          )}
        </div>
      )}

      {/* Resources Grid */}
      {loading ? (
        <div className="text-center text-white py-12">Loading exam resources...</div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          <p>No exam resources found. Be the first to share!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </div>
      )}
    </div>
  );
}
