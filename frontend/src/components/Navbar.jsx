import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  LogOut,
  User,
  Menu,
  LogIn,
  ArrowRight,
  Wallet,
  Check,
  Globe,
  ChevronRight,
} from "lucide-react";
import { CURRENCIES } from "../utils/currency";

const CURRENCY_DETAILS = {
  "$": { code: "USD", name: "US Dollar", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "₹": { code: "INR", name: "Indian Rupee", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "€": { code: "EUR", name: "Euro", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "£": { code: "GBP", name: "British Pound", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const Navbar = ({
  user,
  isGuest = false,
  currency = "$",
  setCurrency = () => {},
  onToggleMobileMenu = () => {},
  onLogout,
}) => {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const currencyRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const toggleCurrency = () => setCurrencyOpen((prev) => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (currencyRef.current && !currencyRef.current.contains(e.target)) {
        setCurrencyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xs transition-all w-full">
      <div className="h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        {/* LEFT: Mobile Brand/Menu & Desktop Breadcrumb */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu toggle + Logo */}
          <div className="flex md:hidden items-center gap-2.5">
            <button
              onClick={onToggleMobileMenu}
              className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div
              onClick={() => navigate("/")}
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xs">
                <Wallet className="w-4 h-4 text-white" strokeWidth={2.2} />
              </div>
              <span className="text-base font-extrabold bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 bg-clip-text text-transparent">
                ExpenseTracker
              </span>
            </div>
          </div>
        </div>

        {/* RIGHT: Currency Switcher + User Profile / Auth Actions */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* CURRENCY SELECTOR PILL */}
          <div className="relative" ref={currencyRef}>
            <button
              onClick={toggleCurrency}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs group ${
                currencyOpen
                  ? "bg-teal-50/90 border-teal-300 ring-2 ring-teal-500/20 text-teal-800"
                  : "bg-white hover:bg-slate-50/90 border-slate-200/80 hover:border-slate-300 text-slate-700"
              }`}
              title="Change display currency"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-600 text-white text-[11px] font-black flex items-center justify-center shadow-2xs">
                {currency}
              </div>
              <span className="text-xs font-bold tracking-tight text-slate-700 group-hover:text-teal-700 transition-colors">
                {CURRENCY_DETAILS[currency]?.code || currency}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-transform duration-200 ${
                  currencyOpen ? "rotate-180 text-teal-600" : ""
                }`}
              />
            </button>

            {/* CURRENCY DROPDOWN POPOVER */}
            <AnimatePresence>
              {currencyOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute right-0 mt-2.5 w-60 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200 p-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Globe className="w-3.5 h-3.5 text-teal-600" />
                      <span>Display Currency</span>
                    </div>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {CURRENCIES.length} Available
                    </span>
                  </div>

                  <div className="space-y-1 mt-1.5">
                    {CURRENCIES.map((c) => {
                      const isSelected = currency === c.symbol;
                      const detail = CURRENCY_DETAILS[c.symbol] || {};

                      return (
                        <button
                          key={c.code}
                          onClick={() => {
                            setCurrency(c.symbol);
                            setCurrencyOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer group ${
                            isSelected
                              ? "bg-teal-50/90 text-teal-900 font-bold border border-teal-200/80 shadow-2xs"
                              : "hover:bg-slate-50 text-slate-700 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-transform group-hover:scale-105 ${
                                detail.bg || "bg-slate-100"
                              } ${detail.text || "text-slate-700"} border ${detail.border || "border-slate-200"}`}
                            >
                              {c.symbol}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-800 text-xs">{c.code}</span>
                                <span className="text-[10px] text-slate-400 font-normal">({c.symbol})</span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate">{detail.name}</p>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* GUEST CONTROLS: SLEEK SIGN IN / SIGN UP (NO DEMO BADGE) */}
          {isGuest ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold text-teal-700 bg-white hover:bg-teal-50/40 border border-teal-400 hover:border-teal-500 shadow-2xs hover:shadow-md hover:shadow-teal-500/25 active:scale-95 transition-all duration-200 cursor-pointer group"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-600 transition-colors" />
                <span>Sign In</span>
              </Link>

              <Link
                to="/signup"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-sm shadow-teal-500/25 hover:shadow-md transition cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* LOGGED IN USER PROFILE PILL */
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleMenu}
                className={`flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full border transition-all duration-200 cursor-pointer shadow-2xs group ${
                  menuOpen
                    ? "bg-teal-50/80 border-teal-300 ring-2 ring-teal-500/20"
                    : "bg-white hover:bg-slate-50/90 border-slate-200/70 hover:border-slate-300"
                }`}
              >
                {/* Avatar with gradient */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-2xs"></div>
                </div>

                {/* Name info on tablet/desktop */}
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[120px] leading-tight group-hover:text-teal-700 transition-colors">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[120px] font-medium">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 transition-transform duration-200 ${
                    menuOpen ? "rotate-180 text-teal-600" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="absolute right-0 mt-2.5 w-72 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.18)] border border-slate-200 p-2 z-50 overflow-hidden"
                  >
                    {/* Header Card with Gradient Accent */}
                    <div className="relative p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/70 via-cyan-50/40 to-slate-50/60 border border-teal-100/60 mb-2 overflow-hidden">
                      <div className="absolute -right-6 -top-6 w-20 h-20 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

                      <div className="flex items-center gap-3 relative z-10">
                        <div className="relative shrink-0">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 via-teal-500 to-cyan-600 flex items-center justify-center font-bold text-white text-sm shadow-md shadow-teal-500/25">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-2xs" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-sm font-bold text-slate-800 truncate">
                              {user?.name || "User"}
                            </h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200/60">
                              Active
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Items */}
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/profile");
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                              My Profile
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              Account settings & security
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                      </button>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/");
                        }}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-teal-700 transition cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 border border-cyan-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Wallet className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="font-bold text-slate-800 group-hover:text-teal-700 transition-colors">
                              Financial Overview
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              View dashboard & analytics
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                      </button>
                    </div>

                    <div className="border-t border-slate-100/90 my-1.5" />

                    {/* Sign Out Action */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50/80 transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <LogOut className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-rose-600">Sign Out</div>
                          <div className="text-[10px] text-rose-400 font-normal">End current session</div>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
