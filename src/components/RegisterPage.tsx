import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { ArrowLeft } from "lucide-react";
import { authAPI } from "../utils/api";
import { toast } from "sonner@2.0.3";

interface RegisterPageProps {
  onSwitchToLogin: () => void;
  onRegister?: () => void;
  onBackToLanding?: () => void;
}

export function RegisterPage({
  onSwitchToLogin,
  onRegister,
  onBackToLanding,
}: RegisterPageProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    university: "",
    department: "",
    year: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAPI.signup(formData);
      toast.success("Account created successfully! Please login.");
      setTimeout(() => {
        onSwitchToLogin();
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create account";

      // Handle specific errors with helpful messages
      if (
        errorMessage.includes("already been registered") ||
        errorMessage.includes("already exists")
      ) {
        toast.error("This email is already registered. Please login instead.", {
          action: {
            label: "Go to Login",
            onClick: () => onSwitchToLogin(),
          },
          duration: 5000,
        });
      } else if (errorMessage.includes("Invalid email")) {
        toast.error("Please enter a valid email address.");
      } else if (errorMessage.includes("Password")) {
        toast.error("Password must be at least 6 characters long.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] via-[#6366f1] to-[#9333EA]" />

      {/* Floating Shapes */}
      <div className="absolute top-10 right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-32 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1.5s" }}
      />
      <div
        className="absolute top-1/3 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "3s" }}
      />
      <div
        className="absolute bottom-10 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2.5s" }}
      />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl">
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
        <div className="backdrop-blur-2xl bg-white/10 border border-white/20 rounded-[20px] p-8 md:p-12 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-white mb-2">Create Your Account</h1>
            <p className="text-white/70">Join the Campus Connect community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/90">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder=" your.email@university.edu"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
              />
            </div>

            {/* University */}
            <div className="space-y-2">
              <Label htmlFor="university" className="text-white/90">
                University
              </Label>
              <Select
                value={formData.university}
                onValueChange={(value) =>
                  handleInputChange("university", value)
                }
                required
              >
                <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50 transition-all">
                  <SelectValue placeholder="Select university" />
                </SelectTrigger>
                <SelectContent className="bg-indigo-900 border-white/20 max-h-[300px]">
                  <SelectItem
                    value="haramaya"
                    className="text-white hover:bg-white/10"
                  >
                    Haramaya University
                  </SelectItem>
                  <SelectItem
                    value="addis ababa"
                    className="text-white hover:bg-white/10"
                  >
                    Addis Ababa University
                  </SelectItem>
                  <SelectItem
                    value="dire dawa"
                    className="text-white hover:bg-white/10"
                  >
                    dire dawa University
                  </SelectItem>
                  <SelectItem
                    value="asosa"
                    className="text-white hover:bg-white/10"
                  >
                    asosa University
                  </SelectItem>
                  <SelectItem
                    value="borana"
                    className="text-white hover:bg-white/10"
                  >
                    borana University
                  </SelectItem>
                  <SelectItem
                    value="mattu"
                    className="text-white hover:bg-white/10"
                  >
                    mattu University
                  </SelectItem>
                  <SelectItem
                    value="makele"
                    className="text-white hover:bg-white/10"
                  >
                    makele University
                  </SelectItem>
                  <SelectItem
                    value="wachamo"
                    className="text-white hover:bg-white/10"
                  >
                    wachamo University
                  </SelectItem>
                  <SelectItem
                    value="mada walabu"
                    className="text-white hover:bg-white/10"
                  >
                    mada walabu university
                  </SelectItem>
                  <SelectItem
                    value="koteb"
                    className="text-white hover:bg-white/10"
                  >
                    koteb University
                  </SelectItem>
                  <SelectItem
                    value="adama science and technology"
                    className="text-white hover:bg-white/10"
                  >
                    adama science and technology University
                  </SelectItem>
                  <SelectItem
                    value="bahdar"
                    className="text-white hover:bg-white/10"
                  >
                    bahdar university
                  </SelectItem>
                  <SelectItem
                    value="gonder"
                    className="text-white hover:bg-white/10"
                  >
                    gonder university
                  </SelectItem>
                  <SelectItem
                    value="arsi"
                    className="text-white hover:bg-white/10"
                  >
                    arsi university
                  </SelectItem>
                  <SelectItem
                    value="jimma"
                    className="text-white hover:bg-white/10"
                  >
                    jimma university
                  </SelectItem>
                  <SelectItem
                    value=" addis ababa technlogy"
                    className="text-white hover:bg-white/10"
                  >
                    Addis Ababa technlogy university
                  </SelectItem>
                  <SelectItem
                    value="other"
                    className="text-white hover:bg-white/10"
                  >
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Department and Year - Side by Side */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department" className="text-white/90">
                  Department
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50 transition-all">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-900 border-white/20 text-white">
                    <SelectItem
                      value="computer-science"
                      className="text-white hover:bg-white/10"
                    >
                      Computer Science
                    </SelectItem>
                    <SelectItem
                      value="engineering"
                      className="text-white hover:bg-white/10"
                    >
                      Engineering
                    </SelectItem>
                    <SelectItem
                      value="information-technology"
                      className="text-white hover:bg-white/10"
                    >
                      Information Technology
                    </SelectItem>
                    
                    <SelectItem
                      value="business"
                      className="text-white hover:bg-white/10"
                    >
                      Business
                    </SelectItem>
                    <SelectItem
                      value="arts"
                      className="text-white hover:bg-white/10"
                    >
                      Arts & Humanities
                    </SelectItem>
                    <SelectItem
                      value="sciences"
                      className="text-white hover:bg-white/10"
                    >
                      Natural Sciences
                    </SelectItem>
                    <SelectItem
                      value="medicine"
                      className="text-white hover:bg-white/10"
                    >
                      Medicine
                    </SelectItem>
                   <SelectItem
                      value="business"
                      className="text-white hover:bg-white/10"
                    >
                      business
                    </SelectItem>
                    <SelectItem
                      value="accounting"
                      className="text-white hover:bg-white/10"
                    > accounting
                      
                    </SelectItem>
                    <SelectItem
                      value="business management"
                      className="text-white hover:bg-white/10"
                    >
                      business management
                    </SelectItem>
                    <SelectItem
                      value="law"
                      className="text-white hover:bg-white/10"
                    >
                      Law
                    </SelectItem>
                    <SelectItem
                      value="other"
                      className="text-white hover:bg-white/10"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="text-white/90">
                  Year
                </Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange("year", value)}
                >
                  <SelectTrigger className="bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50 transition-all">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent className="bg-indigo-900 border-white/20 text-white">
                    <SelectItem
                      value="1"
                      className="text-white hover:bg-white/10"
                    >
                      1st Year
                    </SelectItem>
                    <SelectItem
                      value="2"
                      className="text-white hover:bg-white/10"
                    >
                      2nd Year
                    </SelectItem>
                    <SelectItem
                      value="3"
                      className="text-white hover:bg-white/10"
                    >
                      3rd Year
                    </SelectItem>
                    <SelectItem
                      value="4"
                      className="text-white hover:bg-white/10"
                    >
                      4th Year
                    </SelectItem>
                    <SelectItem
                      value="graduate"
                      className="text-white hover:bg-white/10"
                    >
                      Graduate
                    </SelectItem>
                    <SelectItem
                      value="phd"
                      className="text-white hover:bg-white/10"
                    >
                      PhD
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-2">
              <Label htmlFor="skills" className="text-white/90">
                Skills
              </Label>
              <Input
                id="skills"
                type="text"
                placeholder="e.g., JavaScript, Design, Photography (comma-separated)"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                className="bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:bg-white/30 focus:border-white/50 transition-all"
              />
              <p className="text-white/50 mt-1">
                Enter your skills separated by commas
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg hover:shadow-indigo-500/50 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onSwitchToLogin}
              className="text-white/80 hover:text-white transition-colors"
            >
              Already have an account?{" "}
              <span className="underline">Login here</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
