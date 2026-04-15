import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, LogIn, BookOpen, Users, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { login as loginAPI } from "../lib/api.js";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});

  // Enable dark mode on mount
  useEffect(() => {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) {
      setErrors((err) => ({ ...err, [k]: "" }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await loginAPI({
        email: form.email,
        password: form.password,
      });
      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back, ${user.name}!`);
      navigate("/dashboard");
    } catch (e) {
      toast.error(
        e.message === "Request failed"
          ? "Invalid email or password"
          : e.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex dark"
      style={{ backgroundColor: "#0f0f0f" }}
    >
      {/* Left Section - Content & Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12"
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        }}
      >
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">LMS</h2>
              <p className="text-sm text-gray-400">Library System</p>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4">
                Manage Your Library
              </h1>
              <p className="text-lg text-gray-300">
                Streamlined book management, member tracking, and borrowing
                system all in one place.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Book Catalogue
                  </h3>
                  <p className="text-sm text-gray-400">
                    Organize and manage your entire book collection with
                    advanced search and filtering.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Member Management
                  </h3>
                  <p className="text-sm text-gray-400">
                    Track members, borrowing history, fines, and reservations
                    efficiently.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    Real-time Analytics
                  </h3>
                  <p className="text-sm text-gray-400">
                    Get insights into library usage, popular books, and member
                    activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="border rounded-lg p-2 border-gray-700 w-fit" style={{ padding: "0.5rem" }}>
          <p className="text-sm text-white m-2">Komal Gupta (25MCAR101)</p>
          <p className="text-sm text-white m-2">
            Kondikire Shubham Shivaji (25MCR0102)
          </p>
          <p className="text-sm text-white m-2">Lathika K (25MCAR0103)</p>
          <p className="text-sm text-white m-2">
            Maheep Singh Saluja (25MCAR0105)
          </p>
          <p className="text-sm text-white m-2">
            Malviya Hetal Laxman (25MCAR0106)
          </p>
          <p className="text-sm text-white m-2">
            MD Atiullah Ansari (25MCAR0108)
          </p>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center p-6"
        style={{ backgroundColor: "#0f0f0f" }}
      >
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">LMS</h1>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-gray-400">
              Sign in to your staff account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="admin@library.com"
                value={form.email}
                onChange={set("email")}
                disabled={loading}
                style={errors.email ? { borderColor: "#ef4444" } : {}}
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-500" />
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
                placeholder="••••••••"
                value={form.password}
                onChange={set("password")}
                disabled={loading}
                style={errors.password ? { borderColor: "#ef4444" } : {}}
              />
              {errors.password && (
                <p className="text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>


          {/* Footer Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              New to LMS?{" "}
              <Link
                to="/signup"
                className="text-blue-400 font-semibold hover:text-blue-300 transition"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
