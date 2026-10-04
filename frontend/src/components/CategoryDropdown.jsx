import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryDropdown = ({
  value = "all",
  onChange = () => {},
  options = [],
  colorTheme = "emerald", // "emerald" | "rose" | "cyan"
  placeholder = "All Categories",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const themeStyles = {
    emerald: {
      ring: "focus:ring-emerald-500/10 focus:border-emerald-500",
      activeBg: "bg-emerald-50 text-emerald-800 font-bold",
      checkIcon: "text-emerald-600",
      badgeDot: "bg-emerald-500",
      pillActive: "border-emerald-200/90 text-emerald-700 bg-emerald-50/80",
    },
    rose: {
      ring: "focus:ring-rose-500/10 focus:border-rose-500",
      activeBg: "bg-rose-50 text-rose-800 font-bold",
      checkIcon: "text-rose-600",
      badgeDot: "bg-rose-500",
      pillActive: "border-rose-200/90 text-rose-700 bg-rose-50/80",
    },
    cyan: {
      ring: "focus:ring-cyan-500/10 focus:border-cyan-500",
      activeBg: "bg-cyan-50 text-cyan-800 font-bold",
      checkIcon: "text-cyan-600",
      badgeDot: "bg-cyan-500",
      pillActive: "border-cyan-200/90 text-cyan-700 bg-cyan-50/80",
    },
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.emerald;
  const currentOption = options.find((opt) => opt.value === value) || {
    value: "all",
    label: placeholder,
  };

  return (
    <div className="relative w-full sm:w-auto" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full sm:w-auto min-w-[170px] flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 transition-all duration-150 cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98] ${
          isOpen ? "border-slate-300 bg-white shadow-xs" : ""
        } ${currentTheme.ring}`}
      >
        <div className="flex items-center gap-2 truncate">
          {currentOption.icon ? (
            <span className="shrink-0 text-slate-500 flex items-center justify-center">
              {currentOption.icon}
            </span>
          ) : (
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          )}
          <span className="truncate">{currentOption.label}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value !== "all" && (
            <span
              className={`w-1.5 h-1.5 rounded-full ${currentTheme.badgeDot}`}
            />
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-slate-600" : ""
            }`}
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 sm:right-0 sm:left-auto top-full mt-2 w-full sm:w-56 z-40 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-[0_12px_36px_rgba(0,0,0,0.18)] ring-1 ring-black/5 max-h-72 overflow-y-auto no-scrollbar"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
              <span>Filter Category</span>
              {value !== "all" && (
                <button
                  type="button"
                  onClick={() => {
                    onChange("all");
                    setIsOpen(false);
                  }}
                  className="text-slate-500 hover:text-slate-800 transition cursor-pointer font-bold capitalize"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="space-y-0.5">
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? currentTheme.activeBg
                        : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {opt.icon ? (
                        <span
                          className={`shrink-0 flex items-center justify-center ${
                            isSelected ? currentTheme.checkIcon : "text-slate-400"
                          }`}
                        >
                          {opt.icon}
                        </span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 ml-1 mr-0.5" />
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>

                    {isSelected && (
                      <Check
                        className={`w-3.5 h-3.5 shrink-0 ${currentTheme.checkIcon}`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryDropdown;
