import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, User, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] px-4 py-8 sm:py-12 relative overflow-hidden select-none">
      {/* Ambient background glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar: Quick Option to Return to Dashboard */}
      <div className="flex items-center justify-between w-full max-w-md mb-3.5 px-1 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 bg-white/90 hover:bg-white border border-slate-200/80 hover:border-teal-300 px-3.5 py-1.5 rounded-full shadow-2xs hover:shadow-xs transition-all duration-200 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-slate-400 group-hover:text-teal-600" />
          <span>Go to Dashboard</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>256-bit Encrypted</span>
        </div>
      </div>

      {/* Main Glassmorphic Signup Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-[0_20px_50px_-12px_rgba(13,148,136,0.12),0_8px_20px_-6px_rgba(0,0,0,0.04)] rounded-3xl p-6 sm:p-9 relative z-10 overflow-hidden"
      >
        {/* Ambient Top Hairline Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-400" />

        {/* Card Header & Brand Avatar */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-3.5">
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-emerald-500/5 border border-teal-200/60 flex items-center justify-center shadow-xs p-1.5 transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/30">
                  <User className="w-6 h-6 text-white" strokeWidth={2.3} />
                </div>
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white shadow-xs flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-tight">
            Create Account
          </h1>

          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Join ExpenseTracker to start managing and optimizing your wealth
          </p>
        </div>

        {/* API Error Alert */}
        {errors.api && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 bg-rose-50/90 p-3 rounded-2xl mt-5 border border-rose-200/80 text-rose-600 text-xs sm:text-sm font-semibold shadow-2xs"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span className="flex-1">{errors.api}</span>
          </motion.div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Full Name
            </label>
            <div
              className={`flex items-center px-4 py-3 rounded-2xl bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white border transition-all shadow-2xs group ${
                errors.name
                  ? "border-rose-300 ring-2 ring-rose-500/10"
                  : "border-slate-200/90 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10"
              }`}
            >
              <User className="w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors shrink-0" />
              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="your name"
              />
            </div>
            {errors.name && <p className="text-rose-500 text-xs font-medium mt-1 ml-1">{errors.name}</p>}
          </div>

          {/* Email Address Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Email Address
            </label>
            <div
              className={`flex items-center px-4 py-3 rounded-2xl bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white border transition-all shadow-2xs group ${
                errors.email
                  ? "border-rose-300 ring-2 ring-rose-500/10"
                  : "border-slate-200/90 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10"
              }`}
            >
              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors shrink-0" />
              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="name@example.com"
              />
            </div>
            {errors.email && <p className="text-rose-500 text-xs font-medium mt-1 ml-1">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1.5">
              Password
            </label>
            <div
              className={`flex items-center px-4 py-3 rounded-2xl bg-slate-50/80 hover:bg-slate-50 focus-within:bg-white border transition-all shadow-2xs group ${
                errors.password
                  ? "border-rose-300 ring-2 ring-rose-500/10"
                  : "border-slate-200/90 focus-within:border-teal-500 focus-within:ring-4 focus-within:ring-teal-500/10"
              }`}
            >
              <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-teal-600 transition-colors shrink-0" />
              <input
                className="w-full bg-transparent outline-none ml-3 text-sm text-slate-800 font-semibold placeholder:text-slate-400 placeholder:font-normal"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-rose-500 text-xs font-medium mt-1 ml-1">{errors.password}</p>}
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center gap-2 text-xs pt-0.5">
            <input
              type="checkbox"
              id="signup-remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
            />
            <label htmlFor="signup-remember" className="text-slate-600 font-semibold cursor-pointer select-none">
              Remember me on this browser
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white 
            bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 
            hover:from-teal-700 hover:via-teal-600 hover:to-cyan-700 
            shadow-md shadow-teal-500/25 hover:shadow-lg transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2
            ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation Switcher */}
        <div className="text-center mt-5 text-xs sm:text-sm text-slate-500">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-teal-600 hover:text-teal-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        {/* Secondary Option: Direct Guest Access to Dashboard */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Want to test first?</span>
          </span>
          <Link
            to="/"
            className="inline-flex items-center gap-1 font-bold text-teal-600 hover:text-teal-800 hover:underline transition-colors"
          >
            <span>Continue to Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
