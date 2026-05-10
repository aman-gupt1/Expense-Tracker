import React, { useEffect, useRef, useState } from 'react';
import img1 from '../assets/hero.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronDown, LogOut, User } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL + "/api";
// const BASE_URL="http://localhost:4000/api";

const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();
  const menuRef = useRef();

  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(propUser || null); // ✅ FIXED

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.user || response.data;
        setUser(userData);
      } catch (error) {
        console.error("Failed to load profile", error);
      }
    };

    if (!propUser) fetchUserData();
    else setUser(propUser);

  }, [propUser]);

  const toggleMenu = () => setMenuOpen(prev => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    onLogout?.();
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white  border-b shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-8 py-3 max-w-7xl mx-auto">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src={img1} alt="logo" className="w-10 h-10 rounded-xl" />
          <span className="text-xl md:text-2xl font-bold text-gray-800">
            Expense Tracker
          </span>
        </div>

        {/* USER */}
        {user && (
          <div className="relative" ref={menuRef}>

            {/* BUTTON */}
            <button
              onClick={toggleMenu}
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 transition cursor-pointer"
            >
              {/* Avatar */}
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>

              {/* Info */}
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[120px]">
                  {user?.email || "user@example.com"}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${menuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* DROPDOWN */}
            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                {/* HEADER */}
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>

                {/* PROFILE */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <User className="w-4 h-4 " />
                  My Profile
                </button>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>

              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
};

export default Navbar;


