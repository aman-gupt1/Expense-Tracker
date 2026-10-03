import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });

      const { token, user } = res.data;
      if (!token) {
        setError("Login failed: No token received");
        return;
      }

      onLogin(user, rememberMe, token);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err?.response || err);
      setError(
        err.response?.data?.message || err.message || "Invalid email or password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl rounded-3xl p-7 sm:p-9 transition-all duration-300">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
              <Lock className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Welcome Back
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Sign in to access your ExpenseTracker account
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 p-3.5 rounded-2xl mt-5 border border-red-200 text-red-600 text-xs sm:text-sm animate-pulse">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-6">
          {/* Email */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Email Address
            </label>

            <div className="flex items-center px-4 py-3 rounded-2xl bg-slate-50 focus-within:bg-white border border-slate-200/80 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-medium"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Password
            </label>

            <div className="flex items-center px-4 py-3 rounded-2xl bg-slate-50 focus-within:bg-white border border-slate-200/80 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
              <Lock className="w-4 h-4 text-slate-400 shrink-0" />

              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-medium"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-teal-600 rounded cursor-pointer"
              />
              <span className="text-slate-600 font-medium">Remember Me</span>
            </label>

            <span className="text-teal-600 font-semibold cursor-pointer hover:underline">
              Forgot?
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white 
            bg-gradient-to-r from-teal-600 to-cyan-600 
            hover:from-teal-700 hover:to-cyan-700 
            shadow-md shadow-teal-500/25 hover:shadow-lg transition-all cursor-pointer 
            ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Signing in..." : "Sign in to Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 text-xs sm:text-sm text-slate-500">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="font-bold text-teal-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
