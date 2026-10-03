import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  User,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: LayoutDashboard },
  { text: "Income", path: "/income", icon: TrendingUp },
  { text: "Expenses", path: "/expense", icon: TrendingDown },
  { text: "Profile", path: "/profile", icon: User },
];

const Sidebar = ({
  user,
  isGuest = false,
  sidebarcollapsed,
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen,
  onLogout,
}) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const [hoveredItem, setHoveredItem] = useState(null);

  const username = user?.name || (isGuest ? "Guest User" : "User");
  const email = user?.email || (isGuest ? "guest@example.com" : "user@example.com");
  const initial = username.charAt(0).toUpperCase();

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  const handleAuthAction = () => {
    if (isGuest) {
      navigate("/login");
    } else {
      onLogout?.();
      navigate("/login");
    }
  };

  return (
    <>
      {/* ===== DESKTOP SIDEBAR (FULL HEIGHT TOP:0) ===== */}
      <motion.aside
        ref={sidebarRef}
        className="relative hidden md:flex flex-col shrink-0 bg-white/95 backdrop-blur-md border-r border-slate-100 shadow-xs sticky top-0 h-screen z-30 select-none pb-2"
        animate={{ width: sidebarcollapsed ? 96 : 240 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Floating Border Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute -right-3.5 top-5 z-40 w-7 h-7 rounded-full bg-white border border-slate-200 shadow-xs hover:shadow-md items-center justify-center text-slate-500 hover:text-teal-600 hover:border-teal-400 transition-all cursor-pointer active:scale-95 group"
          title={sidebarcollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={sidebarcollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarcollapsed ? (
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          ) : (
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          )}
        </button>

        {/* Top Brand Header in Sidebar */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0">
          <div
            onClick={() => navigate("/")}
            className={`flex items-center gap-2.5 cursor-pointer select-none group min-w-0 ${
              sidebarcollapsed ? "mx-auto justify-center" : ""
            }`}
          >
            {/* Brand Vector Icon */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform duration-200">
                <Wallet className="w-5 h-5 text-white" strokeWidth={2.2} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white shadow-2xs"></div>
            </div>

            {/* Brand Title (when expanded) */}
            {!sidebarcollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-extrabold bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 bg-clip-text text-transparent leading-none tracking-tight">
                  ExpenseTracker
                </span>
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">
                  Personal Finance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Account Card */}
        <div
          onClick={() => navigate("/profile")}
          className={`cursor-pointer transition-all rounded-2xl my-3 ${
            sidebarcollapsed
              ? "flex justify-center p-2 hover:bg-slate-50"
              : "p-3 bg-gradient-to-br from-slate-50/80 to-slate-100/50 border border-slate-200/60 hover:border-teal-200 hover:bg-teal-50/30 mx-3"
          }`}
          title="Go to Profile"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center font-bold text-white shadow-sm shadow-teal-500/25">
                {initial}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-2xs" />
            </div>

            {!sidebarcollapsed && (
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <h2 className="text-sm font-bold text-slate-800 truncate leading-snug">
                    {username}
                  </h2>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 shrink-0">
                    {isGuest ? "Guest" : ""}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate font-medium mt-0.5">
                  {email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section Header */}
        {!sidebarcollapsed && (
          <div className="px-4 pb-2 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Navigation
          </div>
        )}

        {/* Navigation Menu List */}
        <ul className="flex-1 space-y-1.5 px-3 overflow-y-auto">
          {MENU_ITEMS.map(({ text, path, icon: Icon }) => {
            const isActive = pathname === path;

            return (
              <li
                key={text}
                className="relative"
                onMouseEnter={() => setHoveredItem(text)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Link
                  to={path}
                  className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/25"
                      : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                  } ${sidebarcollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
                >
                  <span
                    className={`shrink-0 transition-transform duration-200 ${
                      isActive
                        ? "text-white"
                        : "text-slate-400 group-hover:text-teal-600 group-hover:scale-110"
                    }`}
                  >
                    <Icon size={20} />
                  </span>

                  {!sidebarcollapsed && (
                    <span className="tracking-tight truncate">{text}</span>
                  )}

                  {/* Active indicator dot when collapsed */}
                  {sidebarcollapsed && isActive && (
                    <span className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full shadow-2xs ring-2 ring-teal-500" />
                  )}
                </Link>

                {/* Sleek Tooltip when Collapsed */}
                {sidebarcollapsed && hoveredItem === text && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn flex items-center gap-1.5">
                    <span>{text}</span>
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* Security & Sync Mini Card (Expanded mode only) */}
        {!sidebarcollapsed && (
          <div className="mx-3 p-3 rounded-2xl bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-slate-50 border border-teal-100/80 mb-3 space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-500 text-white rounded-xl shadow-2xs">
                <ShieldCheck size={13} />
              </div>
              <span className="text-xs font-bold text-slate-800">Bank-Grade Security</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Encrypted cloud synchronization active.
            </p>
          </div>
        )}

        {/* Footer info & Logout/Sign-in */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={handleAuthAction}
            onMouseEnter={() => setHoveredItem("auth")}
            onMouseLeave={() => setHoveredItem(null)}
            className={`relative w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-medium text-sm transition cursor-pointer ${
              isGuest
                ? "text-teal-700 bg-teal-50/70 hover:bg-teal-100/70"
                : "text-red-500 hover:bg-red-50 hover:text-red-600"
            } ${sidebarcollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : ""}`}
          >
            {isGuest ? <LogIn size={18} /> : <LogOut size={18} />}
            {!sidebarcollapsed && <span>{isGuest ? "Sign In / Register" : "Log Out"}</span>}

            {sidebarcollapsed && hoveredItem === "auth" && (
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap z-50 pointer-events-none animate-fadeIn flex items-center gap-1.5">
                <span>{isGuest ? "Sign In" : "Log Out"}</span>
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* ===== MOBILE SIDEBAR DRAWER ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            {/* Slide-out Drawer */}
            <motion.div
              className="md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-white z-50 shadow-2xl flex flex-col"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center font-bold text-white shadow-xs">
                    {initial}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{username}</h3>
                    <p className="text-xs text-slate-400 truncate max-w-[130px] font-medium">
                      {email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Links */}
              <ul className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {MENU_ITEMS.map(({ text, path, icon: Icon }) => {
                  const isActive = pathname === path;

                  return (
                    <li key={text}>
                      <Link
                        to={path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl font-medium text-sm transition ${
                          isActive
                            ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-md shadow-teal-500/20"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <span className={isActive ? "text-white" : "text-slate-400"}>
                          <Icon size={20} />
                        </span>
                        <span>{text}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {/* Mobile Drawer Footer */}
              <div className="p-4 border-t border-slate-100">
                {isGuest ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/login");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 shadow-md shadow-teal-500/20 cursor-pointer"
                    >
                      <LogIn size={18} />
                      <span>Sign In</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        navigate("/signup");
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                    >
                      <span>Create Account</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleAuthAction();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-2xl transition cursor-pointer"
                  >
                    <LogOut size={18} />
                    <span>Log Out</span>
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
