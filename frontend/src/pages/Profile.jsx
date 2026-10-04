import React, { useCallback, useEffect, useState, memo } from "react";
import Modal from "react-modal";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  X,
  Sparkles,
  LogIn,
  ArrowRight,
  Mail,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Coins,
  LogOut,
  Edit3,
  Sliders,
  BadgeCheck,
  Activity,
  Copy,
  Check,
  Camera,
  Bell,
  ShieldAlert,
  Save,
} from "lucide-react";
import { useNavigate, useOutletContext, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getAuthHeaders } from "../utils/auth.js";
import { CURRENCIES } from "../utils/currency.js";

const BASE_URL = import.meta.env.VITE_API_URL + "/api";

Modal.setAppElement("#root");

const PasswordInput = memo(
  ({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={showField ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all duration-200 ${
            error ? "border-red-300 ring-2 ring-red-100" : "border-slate-200"
          }`}
          placeholder={`Enter ${label.toLowerCase()}`}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1 rounded-lg"
          disabled={disabled}
        >
          {showField ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
    </div>
  )
);

PasswordInput.displayName = "PasswordInput";

// Password strength calculator
const calculatePasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "Not entered", color: "bg-slate-200", text: "text-slate-400", width: "0%" };
  let score = 0;
  if (pwd.length >= 6) score += 1;
  if (pwd.length >= 10) score += 1;
  if (/[A-Z]/.test(pwd)) score += 1;
  if (/[0-9]/.test(pwd)) score += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

  if (score <= 2) return { score, label: "Weak", color: "bg-rose-500", text: "text-rose-600", width: "33%" };
  if (score <= 4) return { score, label: "Medium", color: "bg-amber-500", text: "text-amber-600", width: "66%" };
  return { score, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600", width: "100%" };
};

const Profile = ({ onUpdateProfile, onLogout, user: propUser }) => {
  const navigate = useNavigate();
  const context = useOutletContext() || {};
  const {
    isGuest = false,
    requestAuth = () => {},
    user: contextUser,
    transactions = [],
    currency = "$",
    setCurrency = () => {},
  } = context;

  const [user, setUser] = useState(
    propUser || contextUser || { name: isGuest ? "Guest User" : "", email: isGuest ? "guest@example.com" : "" }
  );
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordUpdating, setIsPasswordUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Preference switches state for interactive feel
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);

  const initial = (user?.name || "U").charAt(0).toUpperCase();

  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      toast.success("Email copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApiRequest = useCallback(
    async (method, endpoint, data = null) => {
      if (isGuest) {
        requestAuth("modify profile information");
        return null;
      }

      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) {
        onLogout?.();
        navigate("/login");
        return null;
      }

      try {
        const config = {
          method,
          url: `${BASE_URL}${endpoint}`,
          headers: { ...getAuthHeaders() },
        };
        if (data) config.data = data;
        const response = await axios(config);
        return response.data;
      } catch (error) {
        console.error(`${method} request error:`, error);
        if (error.response?.status === 401) {
          onLogout?.();
          navigate("/login");
        }
        throw error;
      }
    },
    [navigate, isGuest, requestAuth, onLogout]
  );

  useEffect(() => {
    if (isGuest) {
      setUser({ name: "Guest User", email: "guest@example.com" });
      setTempUser({ name: "Guest User", email: "guest@example.com" });
      return;
    }

    if (propUser || contextUser) {
      const active = propUser || contextUser;
      setUser(active);
      setTempUser(active);
    }

    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const data = await handleApiRequest("get", "/user/me");
        if (data && isMounted) {
          const userData = data.user || data;
          setUser(userData);
          setTempUser(userData);
          onUpdateProfile?.(userData);
        }
      } catch (error) {
        if (!isMounted) return;
        console.warn("fetchUserData warning:", error?.message || error);
        if (error.response?.status === 401) {
          toast.info("Session expired. Please log in again.");
          return;
        }
        // Only show error if we don't already have user data from props or context
        if (!propUser && !contextUser) {
          toast.error("Failed to load user data. Please check your connection.");
        }
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [handleApiRequest, isGuest, propUser, contextUser, onUpdateProfile]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const handleEditClick = () => {
    if (isGuest) {
      requestAuth("edit your profile information");
      return;
    }
    setEditMode(true);
  };

  const handleSaveProfile = async () => {
    if (isGuest) {
      requestAuth("save profile changes");
      return;
    }
    if (!tempUser.name?.trim() || !tempUser.email?.trim()) {
      toast.error("Please enter a valid name and email address.");
      return;
    }
    try {
      setIsProfileSaving(true);
      const data = await handleApiRequest("put", "/user/profile", {
        name: tempUser.name.trim(),
        email: tempUser.email.trim(),
      });
      if (data) {
        const updatedUser = data.user || data;
        setUser(updatedUser);
        setTempUser(updatedUser);
        setEditMode(false);
        onUpdateProfile?.(updatedUser);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handleCancelEdit = useCallback(() => {
    setTempUser(user);
    setEditMode(false);
  }, [user]);

  const handlePasswordModalOpen = () => {
    if (isGuest) {
      requestAuth("change account password");
      return;
    }
    setIsPasswordUpdating(false);
    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordErrors({});
    setShowPassword({ current: false, new: false, confirm: false });
    setShowPasswordModal(true);
  };

  const validatePassword = useCallback(() => {
    const errors = {};
    if (!passwordData.current) errors.current = "Current password is required";
    if (!passwordData.new) {
      errors.new = "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }
    if (!passwordData.confirm) {
      errors.confirm = "Confirm password is required";
    } else if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isGuest) {
      setShowPasswordModal(false);
      requestAuth("change your password");
      return;
    }

    if (!validatePassword()) return;

    try {
      setIsPasswordUpdating(true);
      await handleApiRequest("put", "/user/password", {
        currentPassword: passwordData.current,
        newPassword: passwordData.new,
      });
      toast.success("Password changed successfully!");
      closePasswordModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsPasswordUpdating(false);
    }
  };

  const handleLogout = useCallback(() => {
    if (isGuest) {
      navigate("/login");
    } else {
      onLogout?.();
    }
  }, [isGuest, onLogout, navigate]);

  const closePasswordModal = useCallback(() => {
    if (!isPasswordUpdating) {
      setShowPasswordModal(false);
      setIsPasswordUpdating(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordErrors({});
      setShowPassword({ current: false, new: false, confirm: false });
    }
  }, [isPasswordUpdating]);

  const passwordStrength = calculatePasswordStrength(passwordData.new);

  // Framer Motion Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.09,
        delayChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 max-w-5xl mx-auto pb-12"
    >
      {/* ===== HERO PROFILE BANNER & IDENTITY CARD ===== */}
      <motion.div
        variants={cardVariants}
        whileHover={{ y: -3, transition: { duration: 0.25 } }}
        className="relative bg-white rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden group"
      >
        {/* Cover Decorative Banner */}
        <div className="h-20 sm:h-24 w-full bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 relative overflow-hidden">
          {/* Subtle geometric circles overlay */}
          <div className="absolute inset-0 opacity-15">
            <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full border-4 border-white/30" />
            <div className="absolute top-4 right-8 w-60 h-60 rounded-full border-2 border-white/25" />
            <div className="absolute -bottom-12 left-1/3 w-36 h-36 rounded-full bg-white/20 blur-lg" />
          </div>

          {/* Top-right Workspace Tag */}
          <div className="absolute top-3 right-4 sm:top-3.5 sm:right-5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Personal Finance Workspace</span>
            </span>
          </div>
        </div>

        {/* Profile Info & Avatar */}
        <div className="px-5 sm:px-7 pb-4 sm:pb-5 pt-0 relative">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3 -mt-9 sm:-mt-10 mb-3">
            {/* Avatar with Glow and Online Indicator */}
            <div className="relative group/avatar cursor-pointer">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 via-teal-600 to-cyan-600 p-0.5 bg-white shadow-lg shadow-teal-500/20 flex items-center justify-center text-white text-2xl sm:text-3xl font-black ring-4 ring-white transition-transform duration-300 group-hover/avatar:scale-105">
                {initial}
              </div>
              <div
                className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-xs"
                title="Account is Active"
              />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:mb-1 w-full sm:w-auto justify-center">
              {!editMode && (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm shadow-teal-500/20 hover:shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              )}
              <button
                onClick={handlePasswordModalOpen}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>Password</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {user.name || (isGuest ? "Guest User" : "Loading...")}
              </h1>
              {isGuest ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Guest Mode
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
                  <BadgeCheck className="w-3.5 h-3.5 text-teal-600" />
                  Verified Pro
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-slate-500 text-xs pt-0.5">
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200/60">
                <Mail className="w-3 h-3 text-slate-400" />
                <span className="text-xs">{user.email || "guest@example.com"}</span>
                <button
                  onClick={handleCopyEmail}
                  className="ml-1 text-slate-400 hover:text-teal-600 transition cursor-pointer p-0.5 rounded"
                  title="Copy email"
                >
                  {copied ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Synchronized Cloud Account</span>
              </div>
            </div>
          </div>

          {/* Integrated Quick Stats Strip - Compact */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-4 pt-3.5 border-t border-slate-100">
            <div className="p-2.5 bg-slate-50/70 hover:bg-teal-50/40 rounded-xl border border-slate-100 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Activity className="w-3 h-3 text-teal-600" />
                <span>Total Records</span>
              </div>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">
                {transactions.length}{" "}
                <span className="text-[11px] font-normal text-slate-400">entries</span>
              </p>
            </div>

            <div className="p-2.5 bg-slate-50/70 hover:bg-teal-50/40 rounded-xl border border-slate-100 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <Coins className="w-3 h-3 text-cyan-600" />
                <span>Display Currency</span>
              </div>
              <p className="text-base font-extrabold text-teal-600 mt-0.5">{currency}</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 hover:bg-teal-50/40 rounded-xl border border-slate-100 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Data Security</span>
              </div>
              <p className="text-base font-extrabold text-emerald-600 mt-0.5">256-Bit SSL</p>
            </div>

            <div className="p-2.5 bg-slate-50/70 hover:bg-teal-50/40 rounded-xl border border-slate-100 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Account Role</span>
              </div>
              <p className="text-base font-extrabold text-slate-800 mt-0.5">Owner</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== GUEST NOTICE CARD ===== */}
      {isGuest && (
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -3 }}
          className="bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-emerald-500/10 rounded-3xl p-6 border border-teal-200 shadow-xs"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>Browsing as Guest</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Sign in or register to customize your profile, set personal preferences, and synchronize your transactions securely to the cloud.
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Link
                to="/login"
                className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/20"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="flex-1 sm:flex-initial text-center px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
              >
                Register
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== 2-COLUMN SETTINGS GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* ===== CARD 1: PERSONAL INFORMATION ===== */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-sm shadow-teal-500/25 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                    Personal Information
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Manage your identity & account details
                  </p>
                </div>
              </div>

              {!editMode && (
                <button
                  onClick={handleEditClick}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-teal-600 bg-teal-50 hover:bg-teal-100/80 border border-teal-100 transition-all active:scale-95 cursor-pointer"
                >
                  Edit Info
                </button>
              )}
            </div>

            <AnimatePresence mode="wait">
              {editMode ? (
                <motion.div
                  key="edit-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={tempUser.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl transition outline-none disabled:opacity-60"
                      disabled={isProfileSaving}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 text-sm bg-slate-50 focus:bg-white border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 rounded-2xl transition outline-none disabled:opacity-60"
                      disabled={isProfileSaving}
                    />
                  </div>

                  <div className="flex gap-2.5 pt-3">
                    <button
                      onClick={handleSaveProfile}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={isProfileSaving}
                    >
                      <Save className="w-4 h-4" />
                      <span>{isProfileSaving ? "Saving..." : "Save Changes"}</span>
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                      disabled={isProfileSaving}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="view-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <div className="p-3.5 bg-slate-50/80 hover:bg-teal-50/30 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Full Name
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/60 text-slate-600">
                        Public Name
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">{user.name}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 hover:bg-teal-50/30 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Email Address
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">{user.email}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50/80 hover:bg-teal-50/30 rounded-2xl border border-slate-100 transition-colors">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                        Account Type
                      </p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                        {isGuest ? "Guest Access" : "Personal Primary"}
                      </span>
                    </div>
                    <p className="text-sm font-bold text-slate-800 mt-1">
                      {isGuest ? "Local Sandbox Account" : "Secure Cloud Account"}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ===== CARD 2: ACCOUNT SECURITY ===== */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                    Account Security
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Authentication, keys & session control
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                100% Score
              </span>
            </div>

            {/* Password status box */}
            <div className="p-4 bg-slate-50/80 hover:bg-slate-100/70 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-800">Account Password</p>
                <p className="text-xs text-slate-400 font-mono tracking-widest mt-0.5">
                  ••••••••••••
                </p>
              </div>
              <button
                onClick={handlePasswordModalOpen}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-600 shadow-2xs transition active:scale-95 cursor-pointer"
              >
                Change
              </button>
            </div>

            {/* Security checklist */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-600">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    256-bit SSL Encryption
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-teal-100 text-teal-600">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    JWT Session Shield
                  </span>
                </div>
                <span className="text-[11px] font-bold text-teal-600">Verified</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-2.5">
                  <div className="p-1 rounded-lg bg-cyan-100 text-cyan-600">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    Cloud Database Isolation
                  </span>
                </div>
                <span className="text-[11px] font-bold text-cyan-600">Secured</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== CARD 3: PREFERENCES & CURRENCY HUB ===== */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-amber-500/25 group-hover:scale-105 transition-transform">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                    Preferences & Currency
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Customize display currency & notifications
                  </p>
                </div>
              </div>
            </div>

            {/* Currency Selector Grid */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Primary Display Currency
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CURRENCIES.map((c) => {
                  const isSelected = currency === c.symbol;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setCurrency(c.symbol)}
                      className={`p-2.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-tr from-teal-600 to-cyan-600 text-white font-bold border-transparent shadow-md shadow-teal-500/25 scale-[1.02]"
                          : "bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200/70 font-semibold"
                      }`}
                    >
                      <div className="text-base font-extrabold">{c.symbol}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? "text-teal-100" : "text-slate-400"
                        }`}
                      >
                        {c.code}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notification & Feature switches */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <Bell className="w-4 h-4 text-teal-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Monthly Expense Summary</p>
                    <p className="text-[10px] text-slate-400">Receive periodic spending recaps</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailAlerts(!emailAlerts)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    emailAlerts ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <motion.div
                    layout
                    className="bg-white w-4 h-4 rounded-full shadow-md"
                    animate={{ x: emailAlerts ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Automated Cloud Sync</p>
                    <p className="text-[10px] text-slate-400">Instant background synchronization</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCloudSync(!cloudSync)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                    cloudSync ? "bg-teal-600" : "bg-slate-300"
                  }`}
                >
                  <motion.div
                    layout
                    className="bg-white w-4 h-4 rounded-full shadow-md"
                    animate={{ x: cloudSync ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ===== CARD 4: SESSION & LOGOUT MANAGEMENT ===== */}
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4, transition: { duration: 0.25 } }}
          className="bg-gradient-to-br from-white via-white to-red-50/20 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-xl border border-red-100 hover:border-red-200 transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center text-white shadow-sm shadow-red-500/25 group-hover:scale-105 transition-transform">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-800 leading-tight">
                  Session Management
                </h2>
                <p className="text-[11px] text-slate-400 font-medium">
                  End your current browser session safely
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Logging out will clear your authentication token on this device. All financial records and budget categories remain protected in your encrypted database.
            </p>

            <div className="p-3 bg-red-50/50 rounded-2xl border border-red-100/80 mb-6 flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-[11px] text-red-700 font-medium">
                Make sure you save any ongoing edits before ending your active session.
              </p>
            </div>
          </div>

          <div>
            <button
              onClick={handleLogout}
              className={`w-full py-3 px-4 rounded-2xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-xs hover:shadow-md cursor-pointer active:scale-95 group/btn ${
                isGuest
                  ? "text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200"
                  : "text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-500/20"
              }`}
            >
              <LogOut className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              <span>{isGuest ? "Sign In / Register Account" : "Log Out of Account"}</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* ===== CHANGE PASSWORD MODAL ===== */}
      <Modal
        isOpen={showPasswordModal}
        onRequestClose={closePasswordModal}
        contentLabel="Change Password"
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 outline-none"
        overlayClassName="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
        shouldCloseOnOverlayClick={!isPasswordUpdating}
        shouldCloseOnEsc={!isPasswordUpdating}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-2xl border border-slate-100"
        >
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-800">Change Password</h3>
            </div>
            <button
              onClick={closePasswordModal}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              disabled={isPasswordUpdating}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <PasswordInput
              name="current"
              label="Current Password"
              value={passwordData.current}
              error={passwordErrors.current}
              showField={showPassword.current}
              onToggle={() => togglePasswordVisibility("current")}
              onChange={handlePasswordChange}
              disabled={isPasswordUpdating}
            />

            <PasswordInput
              name="new"
              label="New Password (min 8 chars)"
              value={passwordData.new}
              error={passwordErrors.new}
              showField={showPassword.new}
              onToggle={() => togglePasswordVisibility("new")}
              onChange={handlePasswordChange}
              disabled={isPasswordUpdating}
            />

            {/* Live Password Strength Meter */}
            {passwordData.new && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Password Strength:</span>
                  <span className={`font-bold ${passwordStrength.text}`}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300 rounded-full`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}

            <PasswordInput
              name="confirm"
              label="Confirm New Password"
              value={passwordData.confirm}
              error={passwordErrors.confirm}
              showField={showPassword.confirm}
              onToggle={() => togglePasswordVisibility("confirm")}
              onChange={handlePasswordChange}
              disabled={isPasswordUpdating}
            />

            <div className="flex gap-2.5 pt-4">
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/20 transition active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={isPasswordUpdating}
              >
                {isPasswordUpdating ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={closePasswordModal}
                className="py-2.5 px-4 rounded-2xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition active:scale-95 cursor-pointer"
                disabled={isPasswordUpdating}
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </Modal>
    </motion.div>
  );
};

export default Profile;