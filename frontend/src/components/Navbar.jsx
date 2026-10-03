import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, LogOut, User, Menu, LogIn, ArrowRight, Wallet } from "lucide-react";
import { CURRENCIES } from "../utils/currency";

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
    navigate("/login");
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
    <header className="sticky top-0 z-20 h-16 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-xs transition-all w-full">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200/70 bg-slate-50/80 hover:bg-slate-100 text-xs sm:text-sm font-semibold text-slate-700 transition cursor-pointer shadow-2xs"
              title="Change display currency"
            >
              <span className="text-teal-600 font-bold">{currency}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                  currencyOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {currencyOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 text-xs sm:text-sm animate-fadeIn">
                <div className="px-3.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Select Currency
                </div>
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setCurrency(c.symbol);
                      setCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-teal-50/70 hover:text-teal-700 transition cursor-pointer ${
                      currency === c.symbol
                        ? "font-bold text-teal-600 bg-teal-50/40"
                        : "text-slate-700"
                    }`}
                  >
                    <span>{c.label}</span>
                    <span className="font-mono text-slate-400 text-xs">{c.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GUEST CONTROLS: SLEEK SIGN IN / SIGN UP (NO DEMO BADGE) */}
          {isGuest ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-600 hover:bg-slate-100 transition"
              >
                Sign In
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
                className="flex items-center gap-2.5 p-1 sm:px-2.5 sm:py-1 rounded-full border border-slate-200/60 bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                {/* Avatar with gradient */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>

                {/* Name info on tablet/desktop */}
                <div className="hidden md:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-800 truncate max-w-[110px] leading-tight">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate max-w-[110px]">
                    {user?.email || "user@example.com"}
                  </p>
                </div>

                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-3xl shadow-xl border border-slate-100 py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-teal-600 transition cursor-pointer"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
