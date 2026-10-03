import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL + "/api";

const Signup = ({ onSignup }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/user/register`,
        { name, email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      const { token, user } = res.data;
      onSignup(user || { name, email }, rememberMe, token);
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else if (err.response?.data?.message) {
        setErrors({ api: err.response.data.message });
      } else {
        setErrors({ api: err.message || "Registration failed" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 px-4 py-8 sm:py-12">
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-slate-100 shadow-xl rounded-3xl p-7 sm:p-9 transition-all duration-300">
        {/* Header */}
        <div className="text-center space-y-2 relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-0 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
              <User className="w-7 h-7" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            Create Account
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Join ExpenseTracker to start managing your personal finances
          </p>
        </div>

        {/* API Error */}
        {errors.api && (
          <p className="mt-4 text-red-600 text-xs sm:text-sm bg-red-50 border border-red-200 p-3.5 rounded-2xl text-center">
            {errors.api}
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Full Name
            </label>
            <div className="flex items-center px-4 py-3 rounded-2xl bg-slate-50 focus-within:bg-white border border-slate-200/80 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-medium"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

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
                placeholder="john@example.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
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
                placeholder="•••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-teal-600 rounded cursor-pointer"
            />
            <label className="text-slate-600 font-medium cursor-pointer select-none">
              Remember Me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white 
            bg-gradient-to-r from-teal-600 to-cyan-600 
            hover:from-teal-700 hover:to-cyan-700 
            shadow-md shadow-teal-500/25 hover:shadow-lg transition-all cursor-pointer 
            ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="text-center mt-6 text-xs sm:text-sm text-slate-500">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-teal-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;