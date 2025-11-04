import {
  Calendar,
  Users,
  BookOpen,
  ShoppingBag,
  Search,
  Car,
  UserPlus,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "./ui/button";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export function LandingPage({
  onNavigateToLogin,
  onNavigateToRegister,
}: LandingPageProps) {
  const features = [
    {
      icon: Calendar,
      title: "Campus Events",
      description:
        "Stay updated with all campus events, workshops, and activities in one place",
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: Users,
      title: "Study Groups",
      description:
        "Join or create study groups with AI-powered recommendations based on your courses",
      color: "from-purple-500 to-pink-600",
    },
    {
      icon: BookOpen,
      title: "Exam Resources",
      description:
        "Access and share past papers, notes, and study materials with fellow students",
      color: "from-emerald-500 to-teal-600",
    },
    {
      icon: UserPlus,
      title: "Smart Connections",
      description:
        "Connect with students in your department with intelligent matching",
      color: "from-orange-500 to-red-600",
    },
    {
      icon: ShoppingBag,
      title: "Marketplace",
      description:
        "Buy and sell textbooks, supplies, and other items within the campus community",
      color: "from-cyan-500 to-blue-600",
    },
    {
      icon: Search,
      title: "Lost & Found",
      description:
        "Report and search for lost items with location tracking and notifications",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Car,
      title: "Ride Sharing",
      description:
        "Find or offer rides to campus, events, or around the city safely",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: Sparkles,
      title: "AI Recommendations",
      description:
        "Get personalized content recommendations based on your connections and interests",
      color: "from-violet-500 to-purple-600",
    },
  ];

  const stats = [
    { value: "8+", label: "Features" },
    { value: "100%", label: "Connected" },
    { value: "AI", label: "Powered" },
    { value: "24/7", label: "Available" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#6366f1] to-[#9333EA]" />

      {/* Animated Floating Shapes */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="fixed bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="fixed top-1/2 right-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="fixed bottom-1/3 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="backdrop-blur-xl bg-white/5 border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-white text-xl">Campus Connect</h1>
                  <p className="text-white/60 text-xs">
                    Your Complete Student Portal
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={onNavigateToLogin}
                  variant="outline"
                  className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={onNavigateToRegister}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-2 shadow-xl">
              <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span className="text-white/90">AI-Powered Campus Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-white text-5xl md:text-7xl max-w-4xl mx-auto leading-tight">
                Your Complete
                <span className="block bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  Campus Experience
                </span>
                All in One Place
              </h1>
              <p className="text-white/80 text-xl md:text-2xl max-w-3xl mx-auto">
                Connect, collaborate, and thrive with an intelligent platform
                designed for modern students. From study groups to ride sharing,
                everything you need is here.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={onNavigateToRegister}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-2xl hover:shadow-purple-500/50 transition-all hover:scale-105 text-lg px-8 py-6"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                onClick={onNavigateToLogin}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-xl text-lg px-8 py-6"
              >
                Sign In
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto pt-12">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[20px] p-6 shadow-xl hover:bg-white/15 transition-all hover:scale-105"
                >
                  <div className="text-3xl md:text-4xl text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-white/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 backdrop-blur-xl bg-white/10 border border-white/20 rounded-full px-6 py-2 shadow-xl mb-6">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span className="text-white/90">Everything You Need</span>
            </div>
            <h2 className="text-white text-4xl md:text-5xl mb-4">
              Powerful Features
            </h2>
            <p className="text-white/70 text-xl max-w-2xl mx-auto">
              A comprehensive suite of tools designed to enhance your campus
              life
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[24px] p-6 shadow-xl hover:bg-white/15 transition-all hover:scale-105 group"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-white text-xl mb-2">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How It Works */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-[32px] p-12 shadow-2xl">
            <div className="text-center mb-12">
              <h2 className="text-white text-4xl md:text-5xl mb-4">
                How It Works
              </h2>
              <p className="text-white/70 text-xl">
                Get started in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto shadow-xl text-white text-2xl">
                  1
                </div>
                <h3 className="text-white text-xl">Create Account</h3>
                <p className="text-white/70">
                  Sign up with your student email and complete your profile with
                  interests and courses
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto shadow-xl text-white text-2xl">
                  2
                </div>
                <h3 className="text-white text-xl">Connect & Explore</h3>
                <p className="text-white/70">
                  Find study groups, connect with classmates, and access exam
                  resources
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center mx-auto shadow-xl text-white text-2xl">
                  3
                </div>
                <h3 className="text-white text-xl">Thrive Together</h3>
                <p className="text-white/70">
                  Get AI-powered recommendations and build your campus community
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <div className="backdrop-blur-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-white/20 rounded-[32px] p-12 shadow-2xl text-center">
            <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6 animate-pulse" />
            <h2 className="text-white text-4xl md:text-5xl mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/80 text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of students already using Campus Connect to enhance
              their college experience
            </p>
            <Button
              onClick={onNavigateToRegister}
              className="bg-white text-indigo-600 hover:bg-white/90 border-0 shadow-2xl hover:shadow-white/50 transition-all hover:scale-105 text-lg px-10 py-6"
            >
              Create Free Account
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto px-6 py-8 mt-16">
          <div className="backdrop-blur-xl bg-white/5 border-t border-white/10 rounded-t-[32px] pt-8 pb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-white">Campus Connect</span>
            </div>

            <p className="text-white/60 text-sm">
              Built for students,by students. Powered by AI. 🚀
              <br />
              <span className="text-white/60 text-sm">
                © {new Date().getFullYear()} Campus Connect. All rights
                reserved.
              </span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
