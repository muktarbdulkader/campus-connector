import { useState, useEffect } from "react";
import { Calendar, Users, ShoppingBag, Car, TrendingUp } from "lucide-react";
import {
  authAPI,
  eventsAPI,
  studyGroupsAPI,
  marketplaceAPI,
  lostFoundAPI,
  connectionsAPI,
} from "../utils/api";

export function Dashboard() {
  const currentUser = authAPI.getStoredUser();
  const [stats, setStats] = useState({
    events: 0,
    studyGroups: 0,
    lostFound: 0,
    marketplace: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const [events, groups, items, listings, connections] = await Promise.all([
        eventsAPI.getAll().catch(() => []),
        studyGroupsAPI.getAll().catch(() => []),
        lostFoundAPI.getAll().catch(() => []),
        marketplaceAPI.getAll().catch(() => []),
        connectionsAPI.getConnections().catch(() => []),
      ]);

      // Build a set of connected user IDs
      const connectedUserIds = new Set<string>();
      if (Array.isArray(connections)) {
        connections.forEach((c: any) => {
          if (c.userId && c.connectedUserId) {
            connectedUserIds.add(c.userId);
            connectedUserIds.add(c.connectedUserId);
          }
        });
      }

      // Helper: include item if belongs to user, connection, or same university
      const includeItem = (item: any) => {
        if (!item) return false;
        const itemUserId = item.userId || item.ownerId || item.createdBy;
        const itemUniversity = item.university || item.school;

        return (
          (itemUserId && itemUserId === currentUser?.id) ||
          (itemUserId && connectedUserIds.has(itemUserId)) ||
          (itemUniversity &&
            currentUser?.university &&
            itemUniversity === currentUser.university)
        );
      };

      setStats({
        events: Array.isArray(events) ? events.filter(includeItem).length : 0,
        studyGroups: Array.isArray(groups)
          ? groups.filter(includeItem).length
          : 0,
        lostFound: Array.isArray(items)
          ? items.filter((i: any) => i.status === "active" && includeItem(i))
              .length
          : 0,
        marketplace: Array.isArray(listings)
          ? listings.filter(
              (l: any) => l.status === "available" && includeItem(l)
            ).length
          : 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: "Active Events",
      value: stats.events,
      icon: Calendar,
      color: "text-blue-500",
    },
    {
      label: "Study Groups",
      value: stats.studyGroups,
      icon: Users,
      color: "text-green-500",
    },
    {
      label: "Lost & Found",
      value: stats.lostFound,
      icon: TrendingUp,
      color: "text-purple-500",
    },
    {
      label: "Marketplace",
      value: stats.marketplace,
      icon: ShoppingBag,
      color: "text-orange-500",
    },
  ];

  const quickActions = [
    {
      label: "Join an Event",
      icon: Calendar,
      color: "bg-blue-500/20 text-blue-300",
    },
    {
      label: "Find Study Partner",
      icon: Users,
      color: "bg-green-500/20 text-green-300",
    },
    {
      label: "Browse Marketplace",
      icon: ShoppingBag,
      color: "bg-orange-500/20 text-orange-300",
    },
    {
      label: "Share a Ride",
      icon: Car,
      color: "bg-purple-500/20 text-purple-300",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-[20px] p-8 shadow-xl hover:shadow-2xl transition-all">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg ring-4 ring-white/10">
            <span className="text-white text-2xl">
              {currentUser?.fullName?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <h1 className="text-white mb-1">
              Welcome back, {currentUser?.fullName || "Student"}! 👋
            </h1>
            <p className="text-white/70">
              Here's what's happening on campus today
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="text-center text-white py-12">Loading stats...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <div
              key={stat.label}
              className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl hover:bg-white/15 hover:shadow-2xl transition-all hover:scale-105 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/70 mb-2 text-sm">{stat.label}</p>
                  <p className="text-white text-3xl group-hover:scale-110 transition-transform inline-block">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-xl ${stat.color} bg-white/10 group-hover:scale-110 transition-transform`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
          <h2 className="text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, idx) => (
              <div
                key={idx}
                className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all cursor-pointer group"
              >
                <div
                  className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <p className="text-white/90">{action.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* User Info */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-[20px] p-6 shadow-xl">
          <h2 className="text-white mb-4">📋 Your Profile</h2>
          <div className="space-y-3">
            {currentUser?.university && (
              <div className="backdrop-blur-sm bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-xl p-4 hover:bg-emerald-500/15 transition-all">
                <p className="text-emerald-300 mb-1 text-sm">🎓 University</p>
                <p className="text-white capitalize">
                  {currentUser.university.replace("-", " ")}
                </p>
              </div>
            )}
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <p className="text-white/70 mb-1 text-sm">📧 Email</p>
              <p className="text-white">{currentUser?.email || "Not set"}</p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <p className="text-white/70 mb-1 text-sm">💼 Department</p>
              <p className="text-white capitalize">
                {currentUser?.department?.replace("-", " ") || "Not set"}
              </p>
            </div>
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all">
              <p className="text-white/70 mb-1 text-sm">📚 Year</p>
              <p className="text-white">
                {currentUser?.year
                  ? `${currentUser.year}${
                      currentUser.year === "1"
                        ? "st"
                        : currentUser.year === "2"
                        ? "nd"
                        : currentUser.year === "3"
                        ? "rd"
                        : "th"
                    } Year`
                  : "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Getting Started */}
      <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl">
        <h2 className="text-white mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-400">1</span>
              </div>
              <h3 className="text-white">Join Events</h3>
            </div>
            <p className="text-white/70">
              Discover campus events and connect with students who share your
              interests
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <span className="text-green-400">2</span>
              </div>
              <h3 className="text-white">Study Together</h3>
            </div>
            <p className="text-white/70">
              Find study groups for your courses and improve your grades
            </p>
          </div>
          <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <span className="text-orange-400">3</span>
              </div>
              <h3 className="text-white">Buy & Sell</h3>
            </div>
            <p className="text-white/70">
              Browse the marketplace for textbooks, electronics, and more
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
