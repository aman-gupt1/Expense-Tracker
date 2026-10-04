import React, { useState, useRef, useEffect } from "react";
import { Calendar, X, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad2 = (n) => String(n).padStart(2, "0");
const toDateStr = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;

const TimeFrameSelector = ({
  timeFrame,
  setTimeFrame,
  options = ["daily", "weekly", "monthly", "yearly"],
  color = "teal",
  selectedDate = "",
  setSelectedDate = () => {},
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse view date or default to current date
  const getInitialViewDate = () => {
    if (selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length === 3) {
        return new Date(parts[0], parts[1] - 1, parts[2]);
      }
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState(getInitialViewDate);

  // Sync view month when selectedDate changes or popover opens
  useEffect(() => {
    if (selectedDate) {
      const parts = selectedDate.split("-").map(Number);
      if (parts.length === 3) {
        setViewDate(new Date(parts[0], parts[1] - 1, parts[2]));
      }
    }
  }, [selectedDate, isCalendarOpen]);

  // Close calendar popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsCalendarOpen(false);
      }
    };
    if (isCalendarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isCalendarOpen]);

  const colorClasses = {
    teal: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 font-bold",
    orange: "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/25 font-bold",
    cyan: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/25 font-bold",
  };

  const activeDayClasses = {
    teal: "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30 font-bold scale-105",
    orange: "bg-gradient-to-tr from-rose-600 to-orange-600 text-white shadow-md shadow-rose-600/30 font-bold scale-105",
    cyan: "bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-bold scale-105",
  };

  const todayBorderClasses = {
    teal: "border border-emerald-500 text-emerald-700 font-bold bg-emerald-50/60",
    orange: "border border-rose-500 text-rose-700 font-bold bg-rose-50/60",
    cyan: "border border-cyan-500 text-cyan-700 font-bold bg-cyan-50/60",
  };

  const quickActionTextClasses = {
    teal: "text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50",
    orange: "text-rose-700 hover:text-rose-800 hover:bg-rose-50",
    cyan: "text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50",
  };

  const activeClass = colorClasses[color] || colorClasses.teal;
  const activeDayClass = activeDayClasses[color] || activeDayClasses.teal;
  const todayBorderClass = todayBorderClasses[color] || todayBorderClasses.teal;
  const quickActionClass = quickActionTextClasses[color] || quickActionTextClasses.teal;

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-").map(Number);
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return dateStr;
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleSelectDay = (dateStr) => {
    setSelectedDate(dateStr);
    setTimeFrame("custom");
    setIsCalendarOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
    setSelectedDate(todayStr);
    setTimeFrame("custom");
    setIsCalendarOpen(false);
  };

  const handleClear = () => {
    setSelectedDate("");
    setTimeFrame("monthly");
    setIsCalendarOpen(false);
  };

  // Build calendar matrix
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const prevCells = [];
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    prevCells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  const currentCells = [];
  for (let d = 1; d <= daysInMonth; d++) {
    currentCells.push({ day: d, month: currentMonth, year: currentYear, isCurrentMonth: true });
  }

  const totalCells = prevCells.length + currentCells.length > 35 ? 42 : 35;
  const nextCells = [];
  const remaining = totalCells - (prevCells.length + currentCells.length);
  for (let d = 1; d <= remaining; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    nextCells.push({ day: d, month: m, year: y, isCurrentMonth: false });
  }

  const allCells = [...prevCells, ...currentCells, ...nextCells];

  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  return (
    <div
      ref={containerRef}
      className="relative flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 border border-slate-200/80 rounded-2xl shadow-2xs"
    >
      {/* Time frame pill buttons */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {options.map((frame) => {
          const isActive = timeFrame === frame && !selectedDate;
          return (
            <button
              key={frame}
              type="button"
              onClick={() => {
                setTimeFrame(frame);
                setSelectedDate("");
                setIsCalendarOpen(false);
              }}
              className={`px-3 py-1.5 text-xs sm:text-sm rounded-xl capitalize transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.98] ${
                isActive
                  ? activeClass
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
              }`}
            >
              {frame}
            </button>
          );
        })}
      </div>

      <div className="h-4 w-px bg-slate-300/80 mx-0.5 hidden sm:block" />

      {/* Specific Date Picker Trigger Button */}
      {selectedDate ? (
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl transition-all shadow-xs ${activeClass}`}
        >
          <button
            type="button"
            onClick={() => setIsCalendarOpen((prev) => !prev)}
            className="flex items-center gap-1.5 font-bold cursor-pointer"
            title="Click to change date"
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{formatDateLabel(selectedDate)}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            title="Clear date filter"
            className="p-0.5 rounded-full hover:bg-black/20 text-white/90 hover:text-white transition cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsCalendarOpen((prev) => !prev)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-xl font-bold transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.98] ${
            isCalendarOpen
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
          }`}
          title="Filter by a particular date"
        >
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Pick Date</span>
        </button>
      )}

      {/* CUSTOM CALENDAR POPOVER */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2.5 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] p-4 bg-white border border-slate-200 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] ring-1 ring-black/5 select-none"
          >
            {/* Header: Month / Year + Navigation */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div>
                <h4 className="text-sm font-extrabold text-slate-800 leading-tight">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </h4>
                <p className="text-[10px] font-semibold text-slate-400">
                  Select a specific date
                </p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  aria-label="Next month"
                  className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
              {WEEKDAY_NAMES.map((d) => (
                <span
                  key={d}
                  className="text-[11px] font-extrabold text-slate-400 uppercase py-1"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {allCells.map((cell, idx) => {
                const cellDateStr = toDateStr(cell.year, cell.month, cell.day);
                const isSelected = cellDateStr === selectedDate;
                const isToday = cellDateStr === todayStr;

                return (
                  <button
                    key={`${cellDateStr}-${idx}`}
                    type="button"
                    onClick={() => handleSelectDay(cellDateStr)}
                    className={`h-8 sm:h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all duration-150 cursor-pointer active:scale-95 relative ${
                      isSelected
                        ? activeDayClass
                        : isToday
                        ? todayBorderClass
                        : cell.isCurrentMonth
                        ? "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium"
                        : "text-slate-300 hover:bg-slate-50 hover:text-slate-500 font-normal"
                    }`}
                  >
                    <span>{cell.day}</span>
                    {isToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-slate-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Footer: Quick actions */}
            <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <button
                type="button"
                onClick={handleClear}
                className="px-2.5 py-1 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={handleToday}
                className={`px-3 py-1 rounded-xl transition cursor-pointer font-bold ${quickActionClass}`}
              >
                Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TimeFrameSelector;