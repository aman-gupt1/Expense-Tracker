import React from "react";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 5,
  onPageChange = () => {},
  onItemsPerPageChange = () => {},
  colorTheme = "emerald", // "emerald" | "rose"
}) => {
  if (totalItems === 0) return null;

  const startIndex = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 3) {
      return [1, 2, 3, 4, "...", totalPages];
    }
    if (currentPage >= totalPages - 2) {
      return [1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  const themeClasses = {
    emerald: {
      badge: "bg-emerald-100 text-emerald-900 border-emerald-300 font-black",
      active:
        "bg-gradient-to-tr from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/30 border-emerald-600 ring-2 ring-emerald-500/25",
      focus: "focus:ring-emerald-500/20 focus:border-emerald-500",
      textAccent: "text-emerald-700",
      footerBg: "bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50/80 border-emerald-100/90",
    },
    rose: {
      badge: "bg-rose-100 text-rose-900 border-rose-300 font-black",
      active:
        "bg-gradient-to-tr from-rose-600 to-orange-600 text-white shadow-sm shadow-rose-600/30 border-rose-600 ring-2 ring-rose-500/25",
      focus: "focus:ring-rose-500/20 focus:border-rose-500",
      textAccent: "text-rose-700",
      footerBg: "bg-gradient-to-r from-rose-50/90 via-orange-50/50 to-slate-50/80 border-rose-100/90",
    },
  };

  const theme = themeClasses[colorTheme] || themeClasses.emerald;

  return (
    <div
      className={`-mx-5 sm:-mx-6 -mb-4 sm:-mb-5 px-5 sm:px-6 py-3.5 mt-4 border-t ${theme.footerBg} flex flex-col sm:flex-row items-center justify-between gap-3 transition-all`}
    >
      {/* Records count & Rows per page */}
      <div className="flex flex-wrap items-center gap-2.5 text-xs font-medium w-full sm:w-auto justify-between sm:justify-start">
        <div className="flex items-center gap-1.5 text-slate-600">
          <span>Showing</span>
          <span className="px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 font-extrabold text-slate-800 shadow-2xs">
            {startIndex} – {endIndex}
          </span>
          <span>of</span>
          <span className={`px-2.5 py-1 rounded-xl border shadow-2xs ${theme.badge}`}>
            {totalItems}
          </span>
          <span className="hidden sm:inline">records</span>
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200/90 rounded-xl shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Rows:
          </span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              onItemsPerPageChange(Number(e.target.value));
              onPageChange(1);
            }}
            className="bg-transparent text-xs font-black text-slate-800 cursor-pointer focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
          </select>
        </div>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
        {/* Page status chip on larger screens */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/80 text-xs font-semibold text-slate-600 shadow-2xs mr-1">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>
            Page <strong className="text-slate-800 font-extrabold">{currentPage}</strong> of{" "}
            <strong className="text-slate-800 font-extrabold">{totalPages}</strong>
          </span>
        </div>

        {/* Prev Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Previous Page"
          className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 aspect-square rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pages.map((p, index) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-7 text-center text-xs font-extrabold text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                type="button"
                key={`page-${p}`}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 sm:w-9 sm:h-9 shrink-0 aspect-square flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer active:scale-95 border ${
                  isActive
                    ? theme.active
                    : "bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xs"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          aria-label="Next Page"
          className="group flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 shrink-0 aspect-square rounded-xl border border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 disabled:opacity-35 disabled:hover:bg-white disabled:hover:text-slate-700 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer active:scale-95 shadow-2xs"
        >
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
