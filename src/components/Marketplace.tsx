import { useState, useEffect } from "react";
import {
  Search,
  DollarSign,
  BookOpen,
  Laptop,
  ShoppingBag,
  Plus,
  Trash2,
  Mail,
  Phone,
} from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import { marketplaceAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);

  const currentUser = authAPI.getStoredUser();

  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    price: 0,
    category: "",
    condition: "",
  });

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await marketplaceAPI.getAll();
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setListings([]);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await marketplaceAPI.create(newListing);
      toast.success("Listing created successfully!");
      setDialogOpen(false);
      setNewListing({
        title: "",
        description: "",
        price: 0,
        category: "",
        condition: "",
      });
      fetchListings();
    } catch (error) {
      console.error("Failed to create listing:", error);
      toast.error("Failed to create listing");
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await marketplaceAPI.delete(listingId);
      toast.success("Listing deleted successfully!");
      fetchListings();
    } catch (error) {
      console.error("Failed to delete listing:", error);
      toast.error("Failed to delete listing");
    }
  };

  // Fetch seller info and open contact dialog
  const openContactDialog = async (listing: any) => {
    try {
      const seller = await authAPI.getUserById(listing.sellerId);
      setSelectedListing({
        ...listing,
        sellerEmail: seller.email,
        sellerPhone: seller.phone,
      });
      setContactDialogOpen(true);
    } catch {
      toast.error("Failed to fetch seller info");
    }
  };

  const categories = [
    { value: "all", label: "All Items", icon: ShoppingBag },
    { value: "books", label: "Books", icon: BookOpen },
    { value: "electronics", label: "Electronics", icon: Laptop },
    { value: "furniture", label: "Furniture", icon: ShoppingBag },
    { value: "other", label: "Other", icon: ShoppingBag },
  ];

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "all" || listing.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && listing.status === "available";
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      books: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      electronics: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      furniture: "bg-green-500/20 text-green-300 border-green-500/30",
      other: "bg-orange-500/20 text-orange-300 border-orange-500/30",
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
            <h1 className="text-white mb-2">🛒 Student Marketplace</h1>
            <p className="text-white/70">
              Buy and sell textbooks, electronics, and more
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  Create New Listing
                </DialogTitle>
                <DialogDescription className="text-white/70">
                  Add a new item to the marketplace
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateListing} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white/90">
                    Title
                  </Label>
                  <Input
                    id="title"
                    required
                    value={newListing.title}
                    onChange={(e) =>
                      setNewListing({ ...newListing, title: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Organic Chemistry Textbook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/90">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    required
                    value={newListing.description}
                    onChange={(e) =>
                      setNewListing({
                        ...newListing,
                        description: e.target.value,
                      })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Describe the item..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white/90">
                      Price ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={newListing.price}
                      onChange={(e) =>
                        setNewListing({
                          ...newListing,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-white/90">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={newListing.phone}
                      onChange={(e) =>
                        setNewListing({ ...newListing, phone: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condition" className="text-white/90">
                      Condition
                    </Label>
                    <Select
                      value={newListing.condition}
                      onValueChange={(value) =>
                        setNewListing({ ...newListing, condition: value })
                      }
                    >
                      <SelectTrigger className="bg-white/20 border-white/30 text-white">
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Like New">Like New</SelectItem>
                        <SelectItem value="Excellent">Excellent</SelectItem>
                        <SelectItem value="Good">Good</SelectItem>
                        <SelectItem value="Fair">Fair</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white/90">
                    Category
                  </Label>
                  <Select
                    value={newListing.category}
                    onValueChange={(value) =>
                      setNewListing({ ...newListing, category: value })
                    }
                  >
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="electronics">Electronics</SelectItem>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
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
                    Create Listing
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
              placeholder="Search marketplace..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`border-0 ${
                  selectedCategory === category.value
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

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center text-white py-12">Loading listings...</div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          <p>No listings found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredListings.map((listing) => {
            const isOwner = listing.sellerId === currentUser?.id;

            return (
              <div
                key={listing.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] overflow-hidden shadow-xl hover:bg-white/15 transition-all hover:scale-[1.02]"
              >
                <div className="relative h-48 bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
                  <ShoppingBag className="w-16 h-16 text-white/30" />
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 rounded-full border ${getCategoryColor(
                        listing.category
                      )}`}
                    >
                      {listing.category}
                    </span>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => handleDeleteListing(listing.id)}
                      className="absolute top-4 left-4 p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white flex-1">{listing.title}</h3>
                    <span className="text-green-400 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {listing.price}
                    </span>
                  </div>
                  <div className="mb-4">
                    <p className="text-white/70 mb-4 line-clamp-2">
                      {listing.description}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-white/70 mb-4 line-clamp-2">
                      {listing.phone}
                    </p>
                  </div>
                  <div className="space-y-2 mb-4">
                    <Badge className={getCategoryColor(listing.condition)}>
                      {listing.condition}
                    </Badge>
                  </div>

                  {/* Contact Seller */}
                  <Dialog
                    open={contactDialogOpen}
                    onOpenChange={setContactDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0"
                        onClick={() => openContactDialog(listing)}
                      >
                        Contact Seller
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-md">
                      <DialogHeader>
                        <DialogTitle>Seller Contact Info</DialogTitle>
                      </DialogHeader>
                      {selectedListing ? (
                        <div className="space-y-2">
                          <p className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />{" "}
                            {selectedListing.phone}
                          </p>
                        </div>
                      ) : (
                        <p>Loading contact info...</p>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
