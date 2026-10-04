import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useOutletContext, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  DollarSign,
  Wallet,
  PiggyBank,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Search,
  Clock,
  Plus,
  ArrowRight,
  TrendingDown,
  Sparkles,
  CreditCard,
  Activity,
  Layers,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Cell, Pie, ResponsiveContainer, PieChart } from "recharts";
import { getTimeFrameRange, getPreviousTimeFrameRange, calculateData } from "../components/Helper";
import FinancialCard from "../components/FinancialCard";
import GaugeCard from "../components/GauseCard";
import AddTransactionModal from "../components/Add";
import TimeFrameSelector from "../components/TimeFrame";
import { dummyTransactions, dummyBudget, COLORS } from "../assets/dummy";
import { getAuthHeaders } from "../utils/auth";
import { formatCurrency } from "../utils/currency";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL + "/api";

const GAUGE_COLORS = {
  Income: { gradientStart: "#10b981", gradientEnd: "#059669", text: "text-emerald-700" },
  Spent: { gradientStart: "#f97316", gradientEnd: "#ea580c", text: "text-orange-700" },
  Savings: { gradientStart: "#0ea5e9", gradientEnd: "#0284c7", text: "text-sky-700" },
};

function toIsoWithClientTime(dateValue) {
  if (!dateValue) return new Date().toISOString();
  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    return new Date(`${dateValue}T${hhmmss}`).toISOString();
  }
  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

const Dashboard = () => {
  const context = useOutletContext() || {};
  const {
    transactions: contextTransactions = [],
    isGuest = false,
    requestAuth = () => {},
    currency = "$",
    refreshTransactions = () => {},
    user,
  } = context;

  // Use dummy transactions if guest; if user is logged in, use real transactions
  const transactions = useMemo(() => {
    if (isGuest) return dummyTransactions;
    return contextTransactions || [];
  }, [isGuest, contextTransactions]);

  const [timeFrame, setTimeFrame] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activePieIndex, setActivePieIndex] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame, selectedDate),
    [timeFrame, selectedDate]
  );
  const prevTimeFrameRange = useMemo(
    () => getPreviousTimeFrameRange(timeFrame, selectedDate),
    [timeFrame, selectedDate]
  );

  const isDateInRange = (date, start, end) => {
    if (!date) return false;
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return transactionDate >= startDate && transactionDate <= endDate;
  };

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter((t) =>
      isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
    );
  }, [transactions, timeFrameRange]);

  const prevFilteredTransactions = useMemo(() => {
    return (transactions || []).filter((t) =>
      isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end)
    );
  }, [transactions, prevTimeFrameRange]);

  const currentTimeFrameData = useMemo(() => {
    const data = calculateData(filteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [filteredTransactions]);

  const prevTimeFrameData = useMemo(() => {
    const data = calculateData(prevFilteredTransactions);
    data.savings = data.income - data.expenses;
    return data;
  }, [prevFilteredTransactions]);

  const displayIncome = currentTimeFrameData.income;
  const displayExpenses = currentTimeFrameData.expenses;
  const displaySavings = displayIncome - displayExpenses;

  const savingsRate =
    displayIncome > 0 ? Math.max(0, Math.round((displaySavings / displayIncome) * 100)) : 0;

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;
    if (!prev) return curr ? 100 : 0;
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);

  // Gauge data
  const gaugeData = useMemo(() => {
    const maxValues = {
      income: Math.max(displayIncome, 5000),
      expenses: Math.max(displayExpenses, 3000),
      savings: Math.max(Math.abs(displaySavings), 2000),
    };

    return [
      { name: "Income", value: displayIncome, max: maxValues.income },
      { name: "Spent", value: displayExpenses, max: maxValues.expenses },
      { name: "Savings", value: displaySavings, max: maxValues.savings },
    ];
  }, [displayIncome, displayExpenses, displaySavings]);

  // Expense distribution
  const expenseDistribution = useMemo(() => {
    const categories = {};
    (filteredTransactions || []).forEach((t) => {
      if (t.type?.toLowerCase() === "expense") {
        const cat = t.category || "Other";
        const amt = Number(t.amount) || 0;
        categories[cat] = (categories[cat] || 0) + amt;
      }
    });

    return Object.keys(categories).map((key) => ({
      name: key,
      value: Math.round(categories[key]),
    }));
  }, [filteredTransactions]);

  const activePieCategory = useMemo(() => {
    if (activePieIndex === null || !expenseDistribution || !expenseDistribution[activePieIndex]) {
      return null;
    }
    return expenseDistribution[activePieIndex];
  }, [activePieIndex, expenseDistribution]);

  // Monthly Budget calculations
  const monthlyBudget = isGuest ? dummyBudget.monthlyBudget : 4500;
  const budgetSpent = displayExpenses;
  const budgetRemaining = Math.max(0, monthlyBudget - budgetSpent);
  const budgetPercentage = Math.min(100, Math.round((budgetSpent / monthlyBudget) * 100));

  const handleAddButtonClick = () => {
    if (isGuest) {
      requestAuth("add a transaction");
      return;
    }
    setShowModal(true);
  };

  const handleAddTransactionSubmit = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    if (isGuest) {
      setShowModal(false);
      requestAuth("add a transaction");
      return;
    }

    const payload = {
      date: toIsoWithClientTime(newTransaction.date),
      description: newTransaction.description.trim(),
      amount: parseFloat(newTransaction.amount),
      category: newTransaction.category,
    };

    try {
      setLoading(true);
      const endpoint = newTransaction.type === "income" ? "income/add" : "expense/add";
      await axios.post(`${API_BASE}/${endpoint}`, payload, {
        headers: getAuthHeaders(),
      });
      await refreshTransactions();
      const typeLabel = newTransaction.type === "income" ? "Income" : "Expense";
      toast.success(`${typeLabel} added successfully!`);
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });
      setShowModal(false);
    } catch (err) {
      console.error("Failed to add transaction:", err);
      toast.error(err.response?.data?.message || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  // Recent transactions list with tab filter and search
  const recentTransactionsList = useMemo(() => {
    let list = selectedDate ? [...(filteredTransactions || [])] : [...(transactions || [])];
    if (activeTab === "income") list = list.filter((t) => t.type === "income");
    if (activeTab === "expense") list = list.filter((t) => t.type === "expense");

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      );
    }

    return list.slice(0, 7);
  }, [transactions, filteredTransactions, selectedDate, activeTab, searchQuery]);

  const hasTransactions = transactions.length > 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8 pb-10"
    >
      {/* 1. TOP HERO HEADER & TIMEFRAME SELECTOR */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="relative z-30 bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs hover:shadow-xl border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 group"
      >
        {/* Subtle decorative background glow */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-teal-500/10 via-cyan-500/5 to-transparent rounded-bl-full group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200/60 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Financial Analytics
              </span>
              {isGuest && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Guest Sandbox
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
              Finance Dashboard
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium max-w-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-500 shrink-0" />
              <span>Active Window: <strong className="text-slate-700 font-bold">{timeFrameRange?.label || timeFrame}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Unified TimeFrame & Date Picker */}
            <TimeFrameSelector
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              options={["daily", "weekly", "monthly", "yearly"]}
              color="cyan"
            />

            {/* Vibrant Add Transaction CTA */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddButtonClick}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/35 transition-all cursor-pointer group/cta w-full sm:w-auto"
            >
              <div className="p-1 rounded-lg bg-white/20 group-hover/cta:rotate-90 transition-transform duration-300">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span>Add Transaction</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 2. ONBOARDING HERO CARD FOR NEW USERS WITH 0 TRANSACTIONS */}
      {!isGuest && !hasTransactions && (
        <motion.div
          variants={cardItemVariants}
          whileHover={{ y: -3 }}
          className="bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-white rounded-3xl p-6 sm:p-8 border border-teal-200/80 shadow-xs text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>Get Started</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800">
              Ready to record your first transaction?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
              Your account is all set up. Add your salary, freelance income, or daily expenses to
              see your real-time balance, category charts, and budget trends right here!
            </p>
          </div>
          <button
            onClick={handleAddButtonClick}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-teal-500/25 hover:shadow-lg transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record First Transaction</span>
          </button>
        </motion.div>
      )}

      {/* 3. FOUR HIGH-CONTRAST STAT METRIC CARDS */}
      <motion.div
        variants={cardItemVariants}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {/* TOTAL BALANCE */}
        <FinancialCard
          icon={
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
          }
          label="Total Balance"
          value={formatCurrency(displaySavings, currency)}
          trend={displaySavings >= 0 ? "Positive" : "Deficit"}
          trendPositive={displaySavings >= 0}
          additionalContent={
            <div className="flex items-center justify-between text-[11px] font-semibold text-teal-700 bg-teal-50/70 px-2.5 py-1 rounded-xl border border-teal-100/70">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {timeFrameRange.label}
              </span>
              <span className="font-mono font-bold">Net</span>
            </div>
          }
        />

        {/* TOTAL INCOME */}
        <FinancialCard
          icon={
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xs">
              <ArrowUp className="w-4 h-4" />
            </div>
          }
          label="Total Income"
          value={formatCurrency(displayIncome, currency)}
          trend="Inflow"
          trendPositive={true}
          additionalContent={
            <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-700 bg-emerald-50/70 px-2.5 py-1 rounded-xl border border-emerald-100/70">
              <span>Earned Inflow</span>
              <span className="font-mono font-bold">Verified</span>
            </div>
          }
        />

        {/* TOTAL EXPENSES */}
        <FinancialCard
          icon={
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-500 to-rose-600 flex items-center justify-center text-white shadow-xs">
              <ArrowDown className="w-4 h-4" />
            </div>
          }
          label="Total Expenses"
          value={formatCurrency(displayExpenses, currency)}
          trend={expenseChange > 0 ? `+${expenseChange}%` : `${expenseChange}%`}
          trendPositive={expenseChange <= 0}
          additionalContent={
            <div
              className={`flex items-center justify-between text-[11px] font-semibold px-2.5 py-1 rounded-xl border ${
                expenseChange > 0
                  ? "text-orange-700 bg-orange-50/70 border-orange-100/70"
                  : "text-emerald-700 bg-emerald-50/70 border-emerald-100/70"
              }`}
            >
              <span>vs previous</span>
              <span className="font-mono font-bold">{Math.abs(expenseChange)}%</span>
            </div>
          }
        />

        {/* SAVINGS RATE */}
        <FinancialCard
          icon={
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <PiggyBank className="w-4 h-4" />
            </div>
          }
          label="Savings Rate"
          value={`${savingsRate}%`}
          trend={savingsRate >= 20 ? "Optimal" : "Building"}
          trendPositive={savingsRate >= 20}
          additionalContent={
            <div className="space-y-0.5">
              <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(savingsRate, 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block font-medium">
                {savingsRate > 30 ? "Exceeding target 🎯" : "Target: 30%+"}
              </span>
            </div>
          }
        />
      </motion.div>

      {/* 4. BUDGET TARGET & SPENDING PROGRESS BAR (COMPACT HEIGHT) */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="bg-white rounded-2xl p-3.5 sm:p-4.5 shadow-xs hover:shadow-lg border border-slate-200/70 hover:border-teal-200/80 transition-all duration-300 group"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-sm sm:text-base tracking-tight leading-none">
                  Monthly Spending & Budget Gauge
                </h3>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    budgetPercentage > 90
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : budgetPercentage > 70
                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {budgetPercentage > 90
                    ? "Near Limit"
                    : budgetPercentage > 70
                    ? "Moderate"
                    : "Safe Buffer"}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                Real-time consumption tracking against allocated monthly ceiling
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block leading-tight">
              Budget Target
            </span>
            <span className="font-black text-slate-800 text-base sm:text-lg leading-tight">
              {formatCurrency(monthlyBudget, currency)}
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="space-y-1.5 mt-2">
          <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 overflow-hidden p-0.5 shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
                budgetPercentage > 90
                  ? "bg-gradient-to-r from-orange-500 to-rose-600"
                  : budgetPercentage > 75
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : "bg-gradient-to-r from-teal-500 via-teal-600 to-cyan-600"
              }`}
              style={{ width: `${Math.max(budgetPercentage, 3)}%` }}
            />
          </div>

          <div className="flex flex-wrap justify-between items-center text-[11px] sm:text-xs font-bold text-slate-600 pt-0.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>
                Spent:{" "}
                <strong className="text-slate-800">
                  {formatCurrency(budgetSpent, currency)}
                </strong>{" "}
                <span className="text-slate-400 font-normal">({budgetPercentage}%)</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Remaining Buffer:{" "}
                <strong className="text-emerald-700 font-extrabold">
                  {formatCurrency(budgetRemaining, currency)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 5. RADIAL GAUGES WITH DYNAMIC CURRENCY */}
      <motion.div
        variants={cardItemVariants}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 min-w-0"
      >
        {gaugeData.map((gauge) => (
          <div key={gauge.name} className="w-full h-full min-w-0">
            <GaugeCard
              gauge={gauge}
              colorInfo={GAUGE_COLORS[gauge.name]}
              timeFrameLabel={timeFrameRange.label}
              currency={currency}
            />
          </div>
        ))}
      </motion.div>

      {/* 6. EXPENSE DISTRIBUTION & RECENT TRANSACTIONS STREAM */}
      <motion.div variants={cardItemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-w-0">
        {/* Left Column: Expense Distribution Donut Chart */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative lg:col-span-1 bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.09)] border border-slate-200/80 hover:border-teal-300/70 transition-all duration-300 flex flex-col justify-between min-w-0 group overflow-hidden"
        >
          {/* Ambient top hairline glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-50/70 border border-teal-100 text-teal-600 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-teal-200 transition-all duration-300 shrink-0">
                  <PieChartIcon className="w-4.5 h-4.5 text-teal-600" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-teal-950 transition-colors">
                    Expense Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
                    Category distribution
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50/90 px-3 py-1 rounded-full border border-teal-200/60 shadow-2xs capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                <span>{timeFrame}</span>
              </div>
            </div>

            <div className="w-full h-44 sm:h-48 min-h-[170px] min-w-0 min-h-0 flex items-center justify-center relative">
              {expenseDistribution && expenseDistribution.length > 0 ? (
                <>
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={0}
                    initialDimension={{ width: 280, height: 180 }}
                  >
                    <PieChart onMouseLeave={() => setActivePieIndex(null)}>
                      <Pie
                        data={expenseDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={74}
                        paddingAngle={expenseDistribution.length > 1 ? 3 : 0}
                        onMouseEnter={(_, index) => setActivePieIndex(index)}
                        onMouseLeave={() => setActivePieIndex(null)}
                      >
                        {expenseDistribution.map((entry, i) => (
                          <Cell
                            key={`cell-${i}`}
                            fill={COLORS[i % COLORS.length]}
                            opacity={activePieIndex === null || activePieIndex === i ? 1 : 0.4}
                            stroke={activePieIndex === i ? "#ffffff" : "none"}
                            strokeWidth={activePieIndex === i ? 2.5 : 0}
                            className="transition-all duration-200 cursor-pointer"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Donut Center Dynamic Readout HUD */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-xs border border-slate-100 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center p-1 text-center transition-all duration-200">
                      {activePieCategory ? (
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span
                            className="text-[9px] font-bold uppercase tracking-wider truncate max-w-[68px]"
                            style={{ color: COLORS[activePieIndex % COLORS.length] }}
                            title={activePieCategory.name}
                          >
                            {activePieCategory.name}
                          </span>
                          <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight mt-0.5">
                            {formatCurrency(activePieCategory.value, currency)}
                          </span>
                          <span className="text-[8px] font-bold text-teal-700 bg-teal-50 px-1 py-0.2 rounded-full mt-0.5 border border-teal-100">
                            {displayExpenses > 0 ? Math.round((activePieCategory.value / displayExpenses) * 100) : 100}%
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center leading-tight">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                            Total Spent
                          </span>
                          <span className="text-xs sm:text-sm font-black text-slate-800 tracking-tight mt-0.5">
                            {formatCurrency(displayExpenses, currency)}
                          </span>
                          <span className="text-[8px] font-semibold text-slate-400 mt-0.5">
                            {expenseDistribution.length} {expenseDistribution.length === 1 ? "Category" : "Categories"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 py-8">
                  <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/70 flex items-center justify-center shadow-inner ring-6 ring-slate-50/80">
                      <PieChartIcon className="w-7 h-7 text-slate-400" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-teal-50 border-2 border-white flex items-center justify-center text-teal-600 shadow-2xs">
                      <Sparkles className="w-3 h-3" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-700">No Expense Records Found</p>
                  <p className="text-xs text-slate-400 max-w-[210px] mt-1 leading-relaxed">
                    Add expense transactions to see visual category breakdown.
                  </p>
                </div>
              )}
            </div>

            {/* Category Pills directly below the Donut Chart (Outer box removed) */}
            {expenseDistribution && expenseDistribution.length > 0 && (
              <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 max-h-[88px] overflow-y-auto custom-scrollbar px-1 py-0.5">
                {expenseDistribution.map((entry, i) => {
                  const isSelected = activePieIndex === i;
                  const color = COLORS[i % COLORS.length];
                  const percent = displayExpenses > 0 ? Math.round((entry.value / displayExpenses) * 100) : 0;
                  return (
                    <button
                      key={`cat-pill-${entry.name}`}
                      type="button"
                      onMouseEnter={() => setActivePieIndex(i)}
                      onMouseLeave={() => setActivePieIndex(null)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-semibold transition-all duration-150 border cursor-pointer ${
                        isSelected
                          ? "bg-white text-slate-900 border-slate-300 shadow-xs scale-[1.03]"
                          : "bg-slate-50/90 hover:bg-white text-slate-600 hover:text-slate-800 border-slate-200/80 hover:border-slate-300 shadow-2xs"
                      }`}
                      title={`${entry.name}: ${formatCurrency(entry.value, currency)} (${percent}%)`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0 ring-1 ring-black/5"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate max-w-[85px] leading-tight">{entry.name}</span>
                      <span className="text-[10px] font-bold text-slate-400 ml-0.5">{percent}%</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Column: Recent Transactions Stream */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="relative lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.09)] border border-slate-200/80 hover:border-teal-300/70 transition-all duration-300 flex flex-col min-w-0 group overflow-hidden"
        >
          {/* Ambient top hairline glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Header & Filter Tabs */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50/70 border border-cyan-100 text-cyan-600 flex items-center justify-center shadow-xs group-hover:scale-105 group-hover:border-cyan-200 transition-all duration-300 shrink-0">
                <Clock className="w-4.5 h-4.5 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight group-hover:text-cyan-950 transition-colors">
                  Recent Activity Stream
                </h3>
                <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  Latest recorded income & expenses
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 shadow-2xs">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "all"
                    ? "bg-white text-slate-800 shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("income")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "income"
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                    : "text-slate-500 hover:text-emerald-700"
                }`}
              >
                Income
              </button>
              <button
                onClick={() => setActiveTab("expense")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "expense"
                    ? "bg-rose-500 text-white shadow-xs shadow-rose-500/30"
                    : "text-slate-500 hover:text-rose-700"
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Interactive Search Bar & Date Picker */}
          <div className="my-3.5 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by description, category, or amount..."
                className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 transition-all duration-200 shadow-2xs outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 p-1 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  if (e.target.value) setTimeFrame("custom");
                }}
                title="Filter by particular date"
                className="w-full sm:w-auto bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 rounded-2xl pl-3.5 pr-8 py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition-all shadow-2xs outline-none cursor-pointer"
              />
              {selectedDate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate("");
                    setTimeFrame("monthly");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200/60 transition cursor-pointer"
                  title="Clear date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Transactions List with Executive Micro-Hover Styling */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-1.5 custom-scrollbar">
            {recentTransactionsList.length > 0 ? (
              recentTransactionsList.map((t) => (
                <div
                  key={t.id || t._id}
                  className="flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-white hover:bg-gradient-to-r hover:from-slate-50/90 hover:via-teal-50/20 hover:to-transparent border border-slate-100 hover:border-teal-200/80 shadow-2xs hover:shadow-sm transition-all duration-200 group/row cursor-default"
                >
                  <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover/row:scale-105 shadow-2xs ${
                        t.type === "income"
                          ? "bg-gradient-to-br from-emerald-50 to-teal-50/60 border-emerald-200/80 text-emerald-600 group-hover/row:bg-emerald-100/70"
                          : "bg-gradient-to-br from-rose-50 to-orange-50/60 border-rose-200/80 text-rose-600 group-hover/row:bg-rose-100/70"
                      }`}
                    >
                      {t.type === "income" ? (
                        <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <ArrowDown className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover/row:text-teal-950 transition-colors">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5">
                        <span>
                          {new Date(t.date).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span
                          className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            t.type === "income"
                              ? "bg-emerald-50/70 text-emerald-700 border-emerald-100"
                              : "bg-rose-50/70 text-rose-700 border-rose-100"
                          }`}
                        >
                          {t.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-3">
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border shadow-2xs transition-all ${
                        t.type === "income"
                          ? "text-emerald-700 bg-emerald-50/80 border-emerald-200/70 group-hover/row:bg-emerald-100/90"
                          : "text-rose-700 bg-rose-50/80 border-rose-200/70 group-hover/row:bg-rose-100/90"
                      }`}
                    >
                      {t.type === "income" ? "+" : "-"}
                      {formatCurrency(t.amount, currency)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mx-auto text-slate-400 shadow-inner">
                  <AlertCircle className="w-6 h-6 text-slate-400" />
                </div>
                <p className="font-bold text-slate-700 text-sm">No matching transactions found</p>
                <p className="text-[11px] text-slate-400">Try adjusting your search query or timeframe filter.</p>
              </div>
            )}
          </div>

          {/* Footer Quick Links with Hover Chevrons & Pill Buttons */}
          <div className="pt-3.5 mt-2.5 border-t border-slate-100 flex flex-wrap justify-between items-center text-xs gap-3">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>
                Showing <strong className="text-slate-700 font-bold">{recentTransactionsList.length}</strong> of {transactions.length} entries
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/income"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-200/60 transition-all duration-200 group/link shadow-2xs"
              >
                <span>View All Income</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/expense"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/60 transition-all duration-200 group/link shadow-2xs"
              >
                <span>View All Expenses</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ADD TRANSACTION MODAL */}
      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransactionSubmit}
        loading={loading}
      />
    </motion.div>
  );
};

export default Dashboard;
