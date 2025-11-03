import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Plus,
  Car,
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
import { ridesAPI, authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

export function RideSharing() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const currentUser = authAPI.getStoredUser();

  const [newRide, setNewRide] = useState({
    from: "",
    to: "",
    date: "",
    time: "",
    seats: 1,
    price: 0,
    description: "",
  });

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const data = await ridesAPI.getAll();
      setRides(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch rides:", error);
      setRides([]);
      toast.error("Failed to load rides");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await ridesAPI.create(newRide);
      toast.success("Ride created successfully!");
      setDialogOpen(false);
      setNewRide({
        from: "",
        to: "",
        date: "",
        time: "",
        seats: 1,
        price: 0,
        description: "",
      });
      fetchRides();
    } catch (error) {
      console.error("Failed to create ride:", error);
      toast.error("Failed to create ride");
    }
  };

  const handleRequestRide = async (rideId: string) => {
    try {
      await ridesAPI.request(rideId);
      toast.success("Ride request sent successfully!");
      fetchRides();
    } catch (error) {
      console.error("Failed to request ride:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to request ride"
      );
    }
  };

  const filteredRides = rides.filter((ride) => {
    if (searchQuery === "") return true;
    return (
      ride.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ride.to.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-white mb-2">🚗 Ride Sharing</h1>
            <p className="text-white/70">
              Share rides with fellow students and save money
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Offer Ride
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-indigo-900/95 to-purple-900/95 backdrop-blur-xl border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Offer a Ride</DialogTitle>
                <DialogDescription className="text-white/70">
                  Share your ride with other students going the same direction
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateRide} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="from" className="text-white/90">
                      From
                    </Label>
                    <Input
                      id="from"
                      required
                      value={newRide.from}
                      onChange={(e) =>
                        setNewRide({ ...newRide, from: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Campus Main Gate"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to" className="text-white/90">
                      To
                    </Label>
                    <Input
                      id="to"
                      required
                      value={newRide.to}
                      onChange={(e) =>
                        setNewRide({ ...newRide, to: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="Downtown"
                    />
                  </div>
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
                      value={newRide.date}
                      onChange={(e) =>
                        setNewRide({ ...newRide, date: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <div>
                    <p>Phone Number</p>
                    <Input
                      id="phone"
                      required
                      value={newRide.phone}
                      onChange={(e) =>
                        setNewRide({ ...newRide, phone: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="123-456-7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-white/90">
                      Time
                    </Label>
                    <Input
                      id="time"
                      required
                      value={newRide.time}
                      onChange={(e) =>
                        setNewRide({ ...newRide, time: e.target.value })
                      }
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      placeholder="3:00 PM"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="seats" className="text-white/90">
                      Available Seats
                    </Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={newRide.seats}
                      onChange={(e) =>
                        setNewRide({
                          ...newRide,
                          seats: parseInt(e.target.value) || 1,
                        })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-white/90">
                      Price per Seat ($)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={newRide.price}
                      onChange={(e) =>
                        setNewRide({
                          ...newRide,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="bg-white/20 border-white/30 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/90">
                    Additional Details (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    value={newRide.description}
                    onChange={(e) =>
                      setNewRide({ ...newRide, description: e.target.value })
                    }
                    className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                    placeholder="Add any additional information..."
                    rows={3}
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
                    Offer Ride
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
          <Input
            placeholder="Search by location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30"
          />
        </div>
      </div>

      {/* Rides Grid */}
      {loading ? (
        <div className="text-center text-white py-12">Loading rides...</div>
      ) : filteredRides.length === 0 ? (
        <div className="text-center text-white/70 py-12">
          <p>No rides available. Offer a ride to get started!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filteredRides.map((ride) => {
            const isDriver = ride.driverId === currentUser?.id;
            const hasRequested = ride.passengers?.includes(currentUser?.id);
            const isFull = ride.passengers?.length >= ride.seats;
            const seatsLeft = ride.seats - (ride.passengers?.length || 0);

            return (
              <div
                key={ride.id}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl hover:bg-white/15 transition-all"
              >
                <div className="flex gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Car className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-white">
                        {ride.from} → {ride.to}
                      </h3>
                      <span className="text-green-400 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {ride.price}
                      </span>
                    </div>
                    {ride.description && (
                      <p className="text-white/70 mb-2">{ride.description}</p>
                    )}
                  </div>
                </div>
                <div>
                  <p>{ride.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-white/60">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{ride.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{ride.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      {seatsLeft} seat{seatsLeft !== 1 ? "s" : ""} left
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{ride.from.split(" ")[0]}</span>
                  </div>
                </div>

                {!isDriver && (
                  <Button
                    onClick={() => handleRequestRide(ride.id)}
                    disabled={hasRequested || isFull}
                    className={`w-full border-0 ${
                      hasRequested
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : isFull
                        ? "bg-gray-600 text-white cursor-not-allowed"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    }`}
                  >
                    {hasRequested
                      ? "✓ Requested"
                      : isFull
                      ? "Full"
                      : "Request Ride"}
                  </Button>
                )}
                {isDriver && (
                  <div className="bg-white/10 rounded-lg p-3 text-center text-white/70">
                    Your Ride - {ride.passengers?.length || 0} passenger
                    {ride.passengers?.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
