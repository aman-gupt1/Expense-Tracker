import React from "react";
import { motion } from "framer-motion";

const FinancialCard = ({
  icon,
  label,
  value,
  additionalContent,
  trend,
  trendPositive,
  accentColor = "teal",
  borderColor = "border-slate-200/70",
  bgColor = "bg-white",
}) => (
  <motion.div
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className={`${bgColor} rounded-2xl p-4 sm:p-4.5 shadow-xs hover:shadow-lg border ${borderColor} hover:border-teal-200/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group`}
  >
    {/* Ambient corner light accent */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-teal-500/5 via-cyan-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

    {/* Header with Icon and Label */}
    <div className="flex items-center justify-between mb-1.5 relative z-10">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="text-xs sm:text-sm font-bold text-slate-700 tracking-tight truncate">
          {label}
        </span>
      </div>

      {trend && (
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
            trendPositive
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
              : "bg-rose-50 text-rose-700 border border-rose-200/70"
          }`}
        >
          {trend}
        </span>
      )}
    </div>

    {/* Metric Amount */}
    <div className="my-1 relative z-10">
      <p className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none group-hover:text-teal-900 transition-colors">
        {value}
      </p>
    </div>

    {/* Subtitle / Trend Badge */}
    {additionalContent && (
      <div className="text-[11px] text-slate-500 font-medium pt-1 relative z-10">
        {additionalContent}
      </div>
    )}
  </motion.div>
);

export default FinancialCard;
