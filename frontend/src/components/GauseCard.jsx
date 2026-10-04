import React from "react";
import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";
import { ArrowUp, ArrowDown, PiggyBank, Wallet } from "lucide-react";

const GAUGE_ICONS = {
  Income: {
    icon: ArrowUp,
    iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-600",
  },
  Spent: {
    icon: ArrowDown,
    iconBg: "bg-gradient-to-tr from-orange-500 to-rose-600",
  },
  Savings: {
    icon: PiggyBank,
    iconBg: "bg-gradient-to-tr from-sky-500 to-indigo-600",
  },
};

const GaugeCard = ({
  gauge = {},
  colorInfo = {},
  timeFrameLabel = "",
  highlightNegative = false,
  currency = "$",
}) => {
  const { name = "Metric", value = 0, max = 100 } = gauge;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  const chartValue = isNegative ? absValue : value;
  const percentage = Math.min((absValue / (max || 1)) * 100, 100);

  const gradientStart = isNegative ? "#ef4444" : colorInfo.gradientStart || "#00C49F";
  const gradientEnd = isNegative ? "#dc2626" : colorInfo.gradientEnd || "#0088FE";
  const textColor = isNegative ? "text-rose-600" : colorInfo.text || "text-slate-800";

  const config = GAUGE_ICONS[name] || {
    icon: Wallet,
    iconBg: "bg-gradient-to-tr from-teal-500 to-cyan-600",
  };
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-lg border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 flex flex-col justify-between w-full h-full min-h-[155px] min-w-0 group relative overflow-hidden"
    >
      {/* Ambient corner light accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-teal-500/5 via-cyan-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform duration-500" />

      {/* ===== TOP ROW: Left Header & Right-Top "% of target" Badge ===== */}
      <div className="flex items-center justify-between w-full mb-2 relative z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-white shadow-2xs shrink-0 ${config.iconBg}`}
          >
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <h3 className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${textColor}`}>
              {name}
            </h3>
            {timeFrameLabel && (
              <p className="text-[10px] text-slate-400 font-semibold capitalize leading-none mt-0.5 truncate">
                {timeFrameLabel}
              </p>
            )}
          </div>
        </div>

        {/* Right Top "% of target" badge */}
        <span
          className={`text-[10px] sm:text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shrink-0 shadow-2xs ${
            isNegative
              ? "bg-rose-50 text-rose-700 border border-rose-200/70"
              : percentage >= 80
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
              : "bg-slate-100 text-slate-700 border border-slate-200/70"
          }`}
        >
          {Math.round(percentage)}% of target
        </span>
      </div>

      {/* ===== MAIN BODY: Left (Amount & Wrapped Target Card) + Right (Enlarged Arch) ===== */}
      <div className="flex items-center justify-between gap-3 mt-auto relative z-10">
        {/* Left Side: Large Metric & Wrapped Target Card */}
        <div className="space-y-2 min-w-0">
          <p className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight leading-none group-hover:text-teal-900 transition-colors">
            {isNegative ? "-" : ""}
            {currency}
            {Math.round(absValue).toLocaleString()}
          </p>

          {/* Wrapped Target Mini Card */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50/90 hover:bg-slate-100/80 border border-slate-200/80 text-[11px] sm:text-xs font-semibold text-slate-500 shadow-2xs transition-colors">
            <span>Target:</span>
            <span className="font-extrabold text-slate-800">
              {currency}
              {Math.round(max).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Side: Enlarged Bold Radial Gauge Arch */}
        <div className="w-36 sm:w-48 h-28 sm:h-32 shrink-0 relative flex items-center justify-center min-w-0 min-h-0">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
            initialDimension={{ width: 180, height: 120 }}
          >
            <RadialBarChart
              data={[{ ...gauge, value: chartValue }]}
              cx="50%"
              cy="82%"
              startAngle={180}
              endAngle={0}
              innerRadius="70%"
              outerRadius="100%"
            >
              <PolarAngleAxis
                type="number"
                domain={[0, max || 100]}
                angleAxisId={0}
                tick={false}
                allowDataOverflow
              />

              <RadialBar
                minAngle={15}
                background={{ fill: "#f1f5f9" }}
                dataKey="value"
                cornerRadius="50%"
                fill={`url(#${name}GaugeGradient)`}
              />

              {/* Centered Percentage inside the wide lower pocket - Zero Overlap */}
              <text
                x="50%"
                y="68%"
                textAnchor="middle"
                dominantBaseline="middle"
                className={`font-black tracking-tight ${
                  Math.round(percentage) >= 100 ? "text-base sm:text-lg" : "text-xl sm:text-2xl"
                } ${textColor}`}
                fill="currentColor"
              >
                {Math.round(percentage)}%
              </text>

              <defs>
                <linearGradient id={`${name}GaugeGradient`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={gradientStart} />
                  <stop offset="100%" stopColor={gradientEnd} />
                </linearGradient>
              </defs>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

export default GaugeCard;