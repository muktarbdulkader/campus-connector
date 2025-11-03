import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./mukt/ImageWithFallback";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

interface LoginPageProps {
  onSwitchToRegister: () => void;
  onLogin?: () => void;
  onBackToLanding?: () => void;
}

export function LoginPage({
  onSwitchToRegister,
  onLogin,
  onBackToLanding,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.login(email, password);
      toast.success("Login successful!");
      if (onLogin) {
        onLogin();
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to login";

      // Provide helpful messages with actions
      if (
        errorMessage.includes("Invalid") ||
        errorMessage.includes("credentials") ||
        errorMessage.includes("password")
      ) {
        toast.error("Invalid email or password. Please check and try again.", {
          action: {
            label: "Sign Up",
            onClick: () => onSwitchToRegister(),
          },
          duration: 5000,
        });
      } else if (
        errorMessage.includes("not found") ||
        errorMessage.includes("User")
      ) {
        toast.error("Account not found. Please sign up first.", {
          action: {
            label: "Create Account",
            onClick: () => onSwitchToRegister(),
          },
          duration: 5000,
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#6366f1] to-[#9333EA]" />

      {/* Floating Shapes */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/2 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Form */}
        <div className="w-full max-w-md mx-auto">
          {onBackToLanding && (
            <Button
              onClick={onBackToLanding}
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          )}
          <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[20px] p-8 shadow-2xl">
            <div className="mb-8">
              <h1 className="text-white mb-2">
                Welcome Back to Campus Connect
              </h1>
              <p className="text-white/70">
                Sign in to access your student portal
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={onSwitchToRegister}
                className="text-white/80 hover:text-white transition-colors"
              >
                Don't have an account?{" "}
                <span className="underline">Register here</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden lg:block">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-[20px] p-8 shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1708578200684-3aa944b73237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkZW50cyUyMGNhbXB1cyUyMGNvbW11bml0eXxlbnwxfHx8fDE3NjIwNjI1NzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Students connecting on campus"
              className="w-full h-auto rounded-xl"
            />
            <div className="mt-6 text-center">
              <h3 className="text-white mb-2">
                Connect. Collaborate. Succeed.
              </h3>
              <p className="text-white/70">
                Join thousands of students building their campus community
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
