import { useState, useEffect } from "react";
import { Search, MapPin, Calendar, Plus, Phone } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { lostFoundAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function LostAndFound() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentUser = authAPI.getStoredUser();

  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    type: "lost" as "lost" | "found",
  });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await lostFoundAPI.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch lost & found items:", error);
      setItems([]);
      toast.error("Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  const handleReportItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await lostFoundAPI.create({
        ...newItem,
        university: currentUser?.university,
        reporterName: currentUser?.name,
      });
      toast.success("Item reported successfully!");
      setDialogOpen(false);
      setNewItem({
        title: "",
        description: "",
        category: "",
        location: "",
        date: "",
        type: "lost",
      });
      fetchItems();
    } catch (error) {
      console.error("Failed to report item:", error);
      toast.error("Failed to report item");
    }
  };

  const handleMarkAsResolved = async (itemId: string) => {
    try {
      await lostFoundAPI.updateStatus(itemId, "resolved");
      toast.success("Item marked as resolved!");
      fetchItems();
    } catch (error) {
      console.error("Failed to update item status:", error);
      toast.error("Failed to update item");
    }
  };

  const categories = [
    { value: "all", label: "All Items", icon: "🔍" },
    { value: "electronics", label: "Electronics", icon: "💻" },
    { value: "clothing", label: "Clothing", icon: "👕" },
    { value: "books", label: "Books", icon: "📚" },
    { value: "id", label: "ID Cards", icon: "🎓" },
    { value: "accessories", label: "Accessories", icon: "👜" },
    { value: "other", label: "Other", icon: "📦" },
  ];

  const filteredItems = items.filter((item) => {
    const matchesUniversity = item.university === currentUser?.university;
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return (
      matchesUniversity &&
      matchesCategory &&
      matchesSearch &&
      item.status === "active"
    );
  });

  const getItemIcon = (category: string) => {
    const icons: Record<string, string> = {
      electronics: "💻",
      clothing: "👕",
      books: "📚",
      id: "🎓",
      accessories: "👜",
      other: "📦",
    };
    return icons[category] || "📦";
  };

  return (
    <div className="p-6">
      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Header */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className="text-white mb-2">🔍 Lost & Found Center</h1>
                <p className="text-white/70">
                  Report and search for lost items on campus
                </p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white border-0 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Report Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-white">
                      Report Lost/Found Item
                    </DialogTitle>
                    <DialogDescription className="text-white/70">
                      Fill in the details about the lost or found item
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleReportItem} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-white/90">
                        Type
                      </Label>
                      <Select
                        value={newItem.type}
                        onValueChange={(value: "lost" | "found") =>
                          setNewItem({ ...newItem, type: value })
                        }
                      >
                        <SelectTrigger className="bg-white/20 border-white/30 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lost">Lost Item</SelectItem>
                          <SelectItem value="found">Found Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-white/90">
                        Item Name
                      </Label>
                      <Input
                        id="title"
                        required
                        value={newItem.title}
                        onChange={(e) =>
                          setNewItem({ ...newItem, title: e.target.value })
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="HP Laptop"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white/90">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        required
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="Silver HP Pavilion laptop..."
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-white/90">
                          Category
                        </Label>
                        <Select
                          value={newItem.category}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, category: value })
                          }
                        >
                          <SelectTrigger className="bg-white/20 border-white/30 text-white">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                {category.icon} {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date" className="text-white/90">
                          Date
                        </Label>
                        <Input
                          id="date"
                          type="date"
                          required
                          value={newItem.date}
                          onChange={(e) =>
                            setNewItem({ ...newItem, date: e.target.value })
                          }
                          className="bg-white/20 border-white/30 text-white"
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
                        value={newItem.location}
                        onChange={(e) =>
                          setNewItem({ ...newItem, location: e.target.value })
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="Main Library - 2nd Floor"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white/90">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        required
                        value={newItem.phone}
                        onChange={(e) =>
                          setNewItem({ ...newItem, phone: e.target.value })
                        }
                        className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                        placeholder="123-456-7890"
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
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white border-0"
                      >
                        Report Item
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                <Input
                  placeholder="Search lost & found items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-[200px] bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Items List */}
          {loading ? (
            <div className="text-center text-white py-12">Loading items...</div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center text-white/70 py-12">
              <p>No items found. Report an item to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => {
                const isReporter = item.reporterId === currentUser?.id;

                return (
                  <div
                    key={item.id}
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl hover:bg-white/15 transition-all"
                  >
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-3xl">
                          {getItemIcon(item.category)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-white">{item.title}</h3>
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs ${
                                item.type === "lost"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {item.type === "lost" ? "Lost" : "Found"}
                            </span>
                          </div>
                          <div className="text-white/60 text-sm mt-1">
                            Reported by: {currentUser?.user_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{item.phone}</span>
                        </div>
                        <p className="text-white/70 mb-3">{item.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-white/60">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{item.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{item.date}</span>
                          </div>
                        </div>
                        {isReporter && (
                          <div className="mt-4">
                            <Button
                              onClick={() => handleMarkAsResolved(item.id)}
                              className="bg-green-600 hover:bg-green-700 text-white border-0"
                            >
                              Mark as Resolved
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar - Tips */}
        <div className="space-y-6">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl sticky top-6">
            <h3 className="text-white mb-4">💡 Tips for Finding Lost Items</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-400">1</span>
                </div>
                <div>
                  <p className="text-white/90">Check regularly</p>
                  <p className="text-white/60">New items are added daily</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-400">2</span>
                </div>
                <div>
                  <p className="text-white/90">Be specific</p>
                  <p className="text-white/60">Include detailed descriptions</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-teal-400">3</span>
                </div>
                <div>
                  <p className="text-white/90">Add contact info</p>
                  <p className="text-white/60">Help others reach you</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
