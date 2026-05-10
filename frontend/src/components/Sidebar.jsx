import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Home,
  ArrowUp,
  ArrowDown,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: <Home size={20} /> },
  { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
  { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
  { text: "Profile", path: "/profile", icon: <User size={20} /> },
];
const Sidebar = ({ user, sidebarcollapsed, setSidebarCollapsed }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);

  const { name: username = "User", email = "user@example.com" } = user || {};
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleSidebar = () => setSidebarCollapsed((c) => !c);

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <motion.div
        ref={sidebarRef}
        className="hidden md:flex flex-col bg-white shadow-lg fixed left-0 top-16 h-[calc(100vh-4rem)] z-40"
        initial={{ x: -100 }}
        animate={{ x: 0, width: sidebarcollapsed ? 80 : 240 }}
      >
        {/* Toggle */}
        <div className="p-4 flex justify-end">
          <button onClick={toggleSidebar}>
            <motion.div animate={{ rotate: sidebarcollapsed ? 0 : 180 }}>
              <Menu />
            </motion.div>
          </button>
        </div>

        {/* USER */}
        <div className="flex items-center px-4 py-3">
          <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center">
            {initial}
          </div>

          {!sidebarcollapsed && (
            <div className="ml-3">
              <h2 className="text-sm font-bold truncate">{username}</h2>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          )}
        </div>

        {/* MENU */}
        <ul className="flex-1 mt-4 space-y-2 px-2">
          {MENU_ITEMS.map(({ text, path, icon }) => {
            const isActive = pathname === path;

            return (
              <li key={text}>
                <Link
                  to={path}
                  className={`flex items-center gap-3 p-2 rounded-lg transition 
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {icon}
                  {!sidebarcollapsed && <span>{text}</span>}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* FOOTER */}
        <div className="p-4 space-y-3 border-t">
          <Link className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
            <HelpCircle size={20} />
            {!sidebarcollapsed && <span>Support</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 cursor-pointer"
          >
            <LogOut size={20} />
            {!sidebarcollapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.div>

      {/* ===== MOBILE BUTTON ===== */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded shadow"
      >
        <Menu />
      </button>

      {/* ===== MOBILE SIDEBAR ===== */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
               transition={{ duration: 0.3 }}
            />

              <motion.div
              className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-lg flex flex-col"
              initial={{ x: "-100%" }}
               animate={{ x: 0 }}
               exit={{ x: "-100%" }}
               transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}>

              <div className="flex justify-between p-4 border-b items-center">
                <span className="border bg-teal-600 text-white p-1 w-8 h-8 text-center rounded-lg font-bold">{username.charAt().toUpperCase()}</span>
                <span className="font-semibold">{username}</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X />
                </button>
              </div>

              <ul className="flex-1 p-4 space-y-2">
                {MENU_ITEMS.map(({ text, path, icon }) => (
                  <li key={text}>
                    <Link
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-100"
                    >
                      {icon}
                      <span>{text}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-2 p-4 border-t">

                <Link className="flex items-center gap-3 text-gray-600 hover:text-blue-600">
            <HelpCircle size={20} />
            {!sidebarcollapsed && <span>Support</span>}
          </Link>

                <button
                  onClick={handleLogout}
                  className="flex gap-2 text-red-500 cursor-pointer"
                >
                  <LogOut />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
export default Sidebar;


