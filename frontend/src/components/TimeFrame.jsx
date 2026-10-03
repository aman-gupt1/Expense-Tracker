import React from "react";

const TimeFrameSelector = ({
  timeFrame,
  setTimeFrame,
  options = ["daily", "weekly", "monthly", "yearly"],
  color = "teal",
}) => {
  const colorClasses = {
    teal: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm shadow-emerald-600/25 font-bold",
    orange: "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-sm shadow-rose-500/25 font-bold",
    cyan: "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm shadow-cyan-600/25 font-bold",
  };

  const activeClass = colorClasses[color] || colorClasses.teal;

  return (
    <div className="flex items-center gap-1 p-1 bg-slate-100/80 border border-slate-200/80 rounded-2xl overflow-x-auto no-scrollbar w-fit max-w-full shadow-2xs">
      {options.map((frame) => (
        <button
          key={frame}
          onClick={() => setTimeFrame(frame)}
          className={`px-3.5 py-1.5 text-xs sm:text-sm rounded-xl capitalize transition-all duration-200 cursor-pointer shrink-0 active:scale-[0.98] ${
            timeFrame === frame
              ? activeClass
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-semibold"
          }`}
        >
          {frame}
        </button>
      ))}
    </div>
  );
};

export default TimeFrameSelector;