import {
  Home,
  Calendar,
  Users,
  ShoppingBag,
  Car,
  Search,
  User,
  LogOut,
  Menu,
  X,
  UserPlus,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onSignOut?: () => void;
  currentUser: {
    fullName: string;
    department?: string;
    email?: string;
  } | null;
}

export function Sidebar({
  currentPage,
  onNavigate,
  onSignOut,
  currentUser,
}: SidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "events", label: "Events", icon: Calendar },
    { id: "study-groups", label: "Study Groups", icon: Users },
    { id: "exam-share", label: "Exam Resources", icon: BookOpen },
    { id: "connections", label: "Connections", icon: UserPlus },
    { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
    { id: "lost-found", label: "Lost & Found", icon: Search },
    { id: "ride-sharing", label: "Ride Sharing", icon: Car },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* 📱 Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-3 shadow-xl text-white hover:bg-white/20 transition-all"
      >
        {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* 🔲 Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 🧊 Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 backdrop-blur-2xl bg-gradient-to-b from-indigo-900/70 via-purple-900/40 to-black/30 border-r border-white/20 z-40 shadow-2xl transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* 🏫 Logo */}
          <div className="p-6 border-b border-white/10">
            <h2 className="text-white text-xl font-semibold mb-1 tracking-wide">
              Campus Connect
            </h2>
            <p className="text-white/60 text-sm">Student Portal</p>
          </div>

          {/* 🧭 Scrollable Navigation */}
          <nav
            className="flex-1 overflow-y-auto p-4 space-y-2"
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE + Edge
            }}
          >
            <style>{`
              /* Hide scrollbar for Chrome, Safari, Edge */
              nav::-webkit-scrollbar {
                display: none;
              }
            `}</style>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg backdrop-blur-md"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 👤 User Section */}
          <div className="p-6 border-t border-white/10 backdrop-blur-sm bg-white/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                <span className="text-white font-semibold">
                  {currentUser?.fullName
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">
                  {currentUser?.fullName || "User"}
                </p>
                <p className="text-white/60 text-xs">
                  {currentUser?.department ||
                    currentUser?.email?.split("@")[0] ||
                    "Student"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={onSignOut}
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
