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
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 backdrop-blur-xl bg-white/10 border border-white/20 rounded-xl p-3 shadow-xl text-white hover:bg-white/20 transition-all"
      >
        {isMobileOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 backdrop-blur-2xl bg-white/10 border-r border-white/20 z-40 transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo */}
          <div className="mb-8">
            <h2 className="text-white mb-1">Campus Connect</h2>
            <p className="text-white/60">Student Portal</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isActive
                      ? "bg-white/20 text-white shadow-lg"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="pt-6 border-t border-white/10">
            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <span className="text-white">
                    {currentUser?.fullName
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-white">
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
                className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
