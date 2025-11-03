/**
 * Campus Connect - Student Portal
 *
 * Features:
 * - Real Authentication with Supabase (Login/Register)
 * - Dashboard with stats and activity feed
 * - Events Calendar (search, filter by category)
 * - Study Groups (join/create study sessions)
 * - Marketplace (buy/sell textbooks and items)
 * - Lost & Found Center (report/search lost items)
 * - Ride Sharing (find/offer rides)
 * - Student Profile with achievements
 *
 * Connected to MongoDB-style database via Supabase
 */

import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/LoginPage";
import { RegisterPage } from "./components/RegisterPage";
import { Dashboard } from "./components/Dashboard";
import { Events } from "./components/Events";
import { StudyGroups } from "./components/StudyGroups";
import { ExamShare } from "./components/ExamShare";
import { Connections } from "./components/Connections";
import { Marketplace } from "./components/Marketplace";
import { LostAndFound } from "./components/LostAndFound";
import { RideSharing } from "./components/RideSharing";
import { Profile } from "./components/Profile";
import { Sidebar } from "./components/Sidebar";
import { authAPI } from "./utils/api";
import { Toaster } from "sonner@2.0.3";

type AuthPage = "landing" | "login" | "register";
type AppPage =
  | "dashboard"
  | "events"
  | "study-groups"
  | "exam-share"
  | "connections"
  | "marketplace"
  | "lost-found"
  | "ride-sharing"
  | "profile";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    authAPI.isAuthenticated()
  );
  const [authPage, setAuthPage] = useState<AuthPage>("landing");
  const [currentPage, setCurrentPage] = useState<AppPage>("dashboard");

  // Check for existing session on mount
  useEffect(() => {
    if (authAPI.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle successful login/register
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  // Handle sign out
  const handleSignOut = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentPage("dashboard");
  };

  // Render auth pages
  if (!isAuthenticated) {
    return (
      <>
        <div className="size-full">
          {authPage === "landing" ? (
            <LandingPage
              onNavigateToLogin={() => setAuthPage("login")}
              onNavigateToRegister={() => setAuthPage("register")}
            />
          ) : authPage === "login" ? (
            <LoginPage
              onSwitchToRegister={() => setAuthPage("register")}
              onLogin={handleLogin}
              onBackToLanding={() => setAuthPage("landing")}
            />
          ) : (
            <RegisterPage
              onSwitchToLogin={() => setAuthPage("login")}
              onRegister={handleLogin}
              onBackToLanding={() => setAuthPage("landing")}
            />
          )}
        </div>
        <Toaster position="top-right" richColors />
      </>
    );
  }

  // Render main app with sidebar
  return (
    <div className="size-full relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#6366f1] to-[#9333EA]" />

      {/* Floating Shapes */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="fixed top-1/2 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as AppPage)}
        onSignOut={handleSignOut}
        currentUser={authAPI.getStoredUser()}
      />

      {/* Main Content */}
      <main className="lg:ml-64 relative z-10 h-full overflow-y-auto">
        {currentPage === "dashboard" && <Dashboard />}
        {currentPage === "events" && <Events />}
        {currentPage === "study-groups" && <StudyGroups />}
        {currentPage === "exam-share" && <ExamShare />}
        {currentPage === "connections" && <Connections />}
        {currentPage === "marketplace" && <Marketplace />}
        {currentPage === "lost-found" && <LostAndFound />}
        {currentPage === "ride-sharing" && <RideSharing />}
        {currentPage === "profile" && <Profile />}
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}
