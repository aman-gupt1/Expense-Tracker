import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  Download,
  Eye,
  Filter,
  BarChart2,
  Search,
  Sparkles,
  TrendingUp,
  X,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import axios from "axios";
import { exportToExcel } from "../utils/exportUtils";
import AddTransactionModal from "../components/Add";
import TransactionItem from "../components/TransactionItem";
import TimeFrameSelector from "../components/TimeFrame";
import FinancialCard from "../components/FinancialCard";
import { getTimeFrameRange, generateChartPoints } from "../components/Helper";
import { INCOME_COLORS, CATEGORY_ICONS_Inc } from "../assets/color";
import { dummyTransactions } from "../assets/dummy";
import { getAuthHeaders } from "../utils/auth";
import { formatCurrency } from "../utils/currency";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import Pagination from "../components/Pagination";
import CategoryDropdown from "../components/CategoryDropdown";

const INCOME_FILTER_OPTIONS = [
  { value: "all", label: "All Categories" },
  { value: "Salary", label: "Salary", icon: CATEGORY_ICONS_Inc.Salary },
  { value: "Freelance", label: "Freelance", icon: CATEGORY_ICONS_Inc.Freelance },
  { value: "Investment", label: "Investment", icon: CATEGORY_ICONS_Inc.Investment },
  { value: "Bonus", label: "Bonus", icon: CATEGORY_ICONS_Inc.Bonus },
  { value: "Other", label: "Other", icon: CATEGORY_ICONS_Inc.Other },
];

const API_BASE = import.meta.env.VITE_API_URL + "/api";

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

const IncomeChart = ({ chartData, timeFrame, timeFrameRange, currency = "$", totalIncome = 0 }) => (
  <div className="w-full">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs shrink-0">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight">
            {timeFrame === "daily"
              ? "Hourly"
              : timeFrame === "yearly"
              ? "Monthly"
              : "Daily"}{" "}
            Income Velocity & Trends
          </h3>
          <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Window: {timeFrameRange?.label || timeFrame}
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/70 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <span>Total: {formatCurrency(totalIncome, currency)}</span>
      </div>
    </div>

    <div className="w-full h-[260px] sm:h-[320px] min-h-[220px] min-w-0 min-h-0">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        minHeight={0}
        initialDimension={{ width: 500, height: 300 }}
      >
        <BarChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="incomeBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#64748b", fontSize: 11 }}
            width={55}
            tickFormatter={(value) => `${currency}${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`}
          />
          <Tooltip
            formatter={(value) => [formatCurrency(value, currency), "Income"]}
            contentStyle={{
              backgroundColor: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(8px)",
              borderRadius: "1rem",
              boxShadow: "0 18px 36px -6px rgba(0, 0, 0, 0.12)",
              border: "1px solid #e2e8f0",
              fontWeight: 600,
              padding: "8px 14px",
            }}
          />
          <Bar dataKey="income" name="Income" radius={[8, 8, 0, 0]} barSize={24}>
            {(chartData || []).map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={INCOME_COLORS[index % INCOME_COLORS.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </Bar>

          {(chartData || []).map(
            (point, index) =>
              point.isCurrent && (
                <ReferenceLine
                  key={index}
                  x={point.label}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              )
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const IncomePage = () => {
  const context = useOutletContext() || {};
  const {
    transactions: contextTransactions = [],
    isGuest = false,
    requestAuth = () => {},
    currency = "$",
    refreshTransactions = () => {},
  } = context;

  // Use dummy transactions if guest or if user has no transactions yet
  const outletTransactions = useMemo(() => {
    if (isGuest) return dummyTransactions;
    if (contextTransactions && contextTransactions.length > 0) return contextTransactions;
    return [];
  }, [isGuest, contextTransactions]);

  const [timeFrame, setTimeFrame] = useState("monthly");
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState({
    totalIncome: 0,
    averageIncome: 0,
    numberOfTransactions: 0,
    range: "monthly",
  });

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "income",
    category: "Salary",
  });

  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "Salary",
    date: new Date().toISOString().split("T")[0],
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    transaction: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame, selectedDate),
    [timeFrame, selectedDate]
  );
  const chartPoints = useMemo(
    () => generateChartPoints(timeFrame, timeFrameRange),
    [timeFrame, timeFrameRange]
  );

  const isDateInRange = useCallback((date, start, end) => {
    if (!date) return false;
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    return transactionDate >= startDate && transactionDate <= endDate;
  }, []);

  const incomeTransactions = useMemo(
    () =>
      (outletTransactions || [])
        .filter((t) => t.type === "income")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [outletTransactions]
  );

  const timeFrameTransactions = useMemo(
    () =>
      incomeTransactions.filter((t) =>
        isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
      ),
    [incomeTransactions, timeFrameRange, isDateInRange]
  );

  // Filter with Category and Search query
  const filteredTransactions = useMemo(() => {
    let list = timeFrameTransactions;

    if (filter !== "all") {
      list = list.filter((t) => t.category?.toLowerCase() === filter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          String(t.amount).includes(q)
      );
    }

    return list;
  }, [timeFrameTransactions, filter, searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery, timeFrame, selectedDate]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedTransactions = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, safeCurrentPage, itemsPerPage]);

  // Chart data
  const chartData = useMemo(() => {
    const data = chartPoints.map((point, index) => ({
      label: point?.label || `Item ${index}`,
      ...point,
      income: 0,
    }));

    const isSingleDay =
      timeFrame === "daily" ||
      timeFrame === "custom" ||
      Boolean(selectedDate);

    filteredTransactions.forEach((transaction) => {
      const transDate = new Date(transaction.date);
      const point = data.find((d) =>
        isSingleDay
          ? d.hour === transDate.getHours()
          : timeFrame === "yearly"
          ? d.date.getMonth() === transDate.getMonth()
          : d.date.getDate() === transDate.getDate() &&
            d.date.getMonth() === transDate.getMonth()
      );
      if (point) {
        point.income += Math.round(Number(transaction.amount));
      }
    });

    return data;
  }, [filteredTransactions, chartPoints, timeFrame]);

  // Fetch overview from backend if logged in
  const fetchOverview = useCallback(
    async (range = timeFrame ?? "monthly") => {
      if (isGuest) return;
      try {
        const res = await axios.get(`${API_BASE}/income/overview`, {
          headers: getAuthHeaders(),
          params: { range },
        });

        if (res.data?.success) {
          const payload = res.data.data ?? {};
          setOverview({
            totalIncome: payload.totalIncome ?? 0,
            averageIncome: payload.averageIncome ?? 0,
            numberOfTransactions: payload.numberOfTransactions ?? 0,
            range: payload.range ?? range,
          });
        }
      } catch (err) {
        console.warn("Could not fetch server income overview:", err?.message || err);
      }
    },
    [timeFrame, isGuest]
  );

  useEffect(() => {
    if (!isGuest) {
      fetchOverview(timeFrame ?? "monthly");
    }
  }, [fetchOverview, timeFrame, isGuest]);

  const totalIncome = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, t) => sum + Math.round(Number(t.amount || 0)),
        0
      ),
    [filteredTransactions]
  );

  const averageIncome = useMemo(
    () =>
      filteredTransactions.length
        ? Math.round(totalIncome / filteredTransactions.length)
        : 0,
    [filteredTransactions, totalIncome]
  );

  const transactionsCount = filteredTransactions.length;

  // Actions with Guest Interception
  const handleAddClick = () => {
    if (isGuest) {
      requestAuth("add an income transaction");
      return;
    }
    setShowModal(true);
  };

  const handleAddTransaction = useCallback(async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    if (isGuest) {
      setShowModal(false);
      requestAuth("add an income transaction");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        description: newTransaction.description.trim(),
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        date: toIsoWithClientTime(newTransaction.date),
      };

      await axios.post(`${API_BASE}/income/add`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      await refreshTransactions();
      await fetchOverview(timeFrame ?? "monthly");

      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "income",
        category: "Salary",
      });
      setShowModal(false);
      toast.success("Income added successfully!");
    } catch (err) {
      console.error("Add income error:", err);
      toast.error(err?.response?.data?.message || "Server error while adding income.");
    } finally {
      setLoading(false);
    }
  }, [newTransaction, refreshTransactions, fetchOverview, timeFrame, isGuest, requestAuth]);

  const handleEditClick = (transaction) => {
    if (isGuest) {
      requestAuth("edit this income transaction");
      return;
    }
    setEditForm({
      description: transaction.description ?? "",
      amount: transaction.amount ?? "",
      category: transaction.category ?? "Salary",
      date: transaction.date ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setEditingId(transaction.id);
  };

  const handleEditTransaction = useCallback(async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;

    if (isGuest) {
      setEditingId(null);
      requestAuth("edit this income transaction");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        description: editForm.description.trim(),
        amount: parseFloat(editForm.amount),
        category: editForm.category,
        date: toIsoWithClientTime(editForm.date),
      };

      await axios.put(`${API_BASE}/income/update/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      await refreshTransactions();
      await fetchOverview(timeFrame ?? "monthly");
      setEditingId(null);
      toast.success("Income updated successfully!");
    } catch (err) {
      console.error("Update income error:", err);
      toast.error(err?.response?.data?.message || "Server error while updating income.");
    } finally {
      setLoading(false);
    }
  }, [editingId, editForm, refreshTransactions, fetchOverview, timeFrame, isGuest, requestAuth]);

  const handleDeleteClick = useCallback(
    (id, transaction) => {
      if (!id) return;

      if (isGuest) {
        requestAuth("delete this income transaction");
        return;
      }

      const target =
        typeof transaction === "object" && transaction !== null
          ? transaction
          : outletTransactions.find((t) => t.id === id);

      setDeleteModalState({
        isOpen: true,
        transaction: target || { id, type: "income" },
      });
    },
    [isGuest, requestAuth, outletTransactions]
  );

  const handleConfirmDelete = useCallback(async () => {
    const targetId = deleteModalState.transaction?.id;
    if (!targetId) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE}/income/delete/${targetId}`, {
        headers: getAuthHeaders(),
      });
      await refreshTransactions();
      await fetchOverview(timeFrame ?? "monthly");
      toast.success("Income deleted successfully!");
      setDeleteModalState({ isOpen: false, transaction: null });
    } catch (err) {
      console.error("Delete income error:", err);
      toast.error(err?.response?.data?.message || "Server error while deleting income.");
    } finally {
      setDeleteLoading(false);
    }
  }, [deleteModalState.transaction, refreshTransactions, fetchOverview, timeFrame]);

  const handleExport = useCallback(async () => {
    try {
      if (!isGuest) {
        const res = await axios.get(`${API_BASE}/income/downloadexcel`, {
          headers: getAuthHeaders(),
          responseType: "blob",
        });

        const blob = new Blob([res.data], {
          type: res.headers["content-type"] || "application/octet-stream",
        });
        const disposition = res.headers["content-disposition"];
        let filename = "income_details.xlsx";
        if (disposition) {
          const match = disposition.match(/filename="?(.+)"?/);
          if (match && match[1]) filename = match[1];
        }
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        return;
      }
    } catch (err) {
      console.warn("Server export failed, falling back to client export:", err);
    }

    // Client export fallback (works for both Guest & Logged In)
    try {
      const exportData = filteredTransactions.map((t) => ({
        Date: new Date(t.date).toLocaleDateString(),
        Description: t.description,
        Category: t.category,
        Amount: t.amount,
        Type: "Income",
      }));
      exportToExcel(exportData, `income_${new Date().toISOString().slice(0, 10)}`);
    } catch (e) {
      console.error("Fallback export failed:", e);
      alert("Failed to export data.");
    }
  }, [filteredTransactions, isGuest]);

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
  },
};

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 sm:space-y-8"
    >
      {/* 1. TOP HERO HEADER & TIMEFRAME SELECTOR */}
      <motion.div
        variants={cardItemVariants}
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="relative z-30 bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 lg:p-7 shadow-xs hover:shadow-xl border border-slate-200/80 hover:border-emerald-300/70 transition-all duration-300 group"
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-emerald-500/10 via-teal-500/5 to-transparent rounded-bl-full group-hover:scale-110 transition-transform duration-500" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Revenue & Inflows Analytics
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800 tracking-tight">
              Income Streams
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium max-w-xl flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Active Window: <strong className="text-slate-700 font-bold">{timeFrameRange?.label || timeFrame}</strong></span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto justify-between lg:justify-end">
            <TimeFrameSelector
              timeFrame={timeFrame}
              setTimeFrame={setTimeFrame}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              options={["daily", "weekly", "monthly", "yearly"]}
              color="teal"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/35 transition-all cursor-pointer group active:scale-[0.98] w-full sm:w-auto"
            >
              <div className="p-1 rounded-lg bg-white/20 group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>Add Income</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* 3. SUMMARY STATS CARDS */}
      <motion.div variants={cardItemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-100 text-emerald-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Total Income"
          value={formatCurrency(totalIncome, currency)}
          trend="Inflows"
          trendPositive={true}
          additionalContent="Net revenue for selected range"
        />
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50/70 border border-teal-100 text-teal-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Average Ticket"
          value={formatCurrency(averageIncome, currency)}
          trend="Avg / Record"
          trendPositive={true}
          additionalContent="Mean revenue per transaction"
        />
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50/70 border border-sky-100 text-sky-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Transactions"
          value={`${transactionsCount}`}
          trend="Recorded"
          trendPositive={true}
          additionalContent={`${filteredTransactions.length} recorded inflows`}
        />
      </motion.div>

      {/* 4. BAR CHART */}
      <motion.div
        variants={cardItemVariants}
        className="relative bg-white rounded-3xl p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] border border-slate-200/80 hover:border-emerald-300/70 transition-all duration-300 overflow-hidden group"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <IncomeChart
          chartData={chartData}
          timeFrame={timeFrame}
          timeFrameRange={timeFrameRange}
          currency={currency}
          totalIncome={totalIncome}
        />
      </motion.div>

      {/* 5. SEARCH & FILTER CONTROLS */}
      <motion.div
        variants={cardItemVariants}
        className="relative z-20 bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-3"
      >
        {/* Real-time Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search income records..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-2xs"
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

        {/* Category filter & Export button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <CategoryDropdown
            value={filter}
            onChange={setFilter}
            options={INCOME_FILTER_OPTIONS}
            colorTheme="emerald"
          />

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200/80 rounded-2xl bg-slate-50/80 hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer shrink-0 active:scale-[0.98] shadow-2xs hover:shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* 6. TRANSACTIONS LIST */}
      <motion.div
        variants={cardItemVariants}
        className="bg-white rounded-3xl p-5 sm:p-6 pb-4 sm:pb-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/80 overflow-hidden flex flex-col justify-between"
      >
        {/* Styled Table Header */}
        <div className="-mx-5 sm:-mx-6 -mt-5 sm:-mt-6 px-5 sm:px-6 py-4 mb-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/50 to-slate-50/80 border-b border-emerald-100/90 flex justify-between items-center transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-emerald-200/90 text-emerald-600 flex items-center justify-center shadow-2xs shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-base leading-tight">
                  Income Records
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                  {filteredTransactions.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                All confirmed inflows and revenue items
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-emerald-200/80 text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Records</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {paginatedTransactions.map((t) => (
            <TransactionItem
              key={t.id}
              transaction={t}
              isEditing={editingId === t.id}
              editForm={editForm}
              setEditForm={setEditForm}
              onSave={handleEditTransaction}
              onCancel={() => setEditingId(null)}
              onDelete={handleDeleteClick}
              onEdit={() => {
                if (isGuest) {
                  requestAuth("edit this income transaction");
                  return false;
                }
                return true;
              }}
              type="income"
              categoryIcons={CATEGORY_ICONS_Inc}
              setEditingId={setEditingId}
              currency={currency}
            />
          ))}
        </div>

        {filteredTransactions.length > 0 && (
          <Pagination
            currentPage={safeCurrentPage}
            totalPages={totalPages}
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={(p) => setCurrentPage(p)}
            onItemsPerPageChange={(count) => setItemsPerPage(count)}
            colorTheme="emerald"
          />
        )}

        {filteredTransactions.length === 0 && (
          <div className="w-full py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/70 flex items-center justify-center shadow-inner ring-6 ring-slate-50/80">
                <DollarSign className="w-7 h-7 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-emerald-600 shadow-2xs">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-700">No Income Records Found</p>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1 leading-relaxed">
              {searchQuery ? "Try refining your search keyword" : "Record your first income above to see analytics."}
            </p>
          </div>
        )}
      </motion.div>

      {/* ADD INCOME MODAL */}
      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
        type="income"
        title="Add New Income"
        buttonText="Save Income"
        categories={["Salary", "Freelance", "Investment", "Bonus", "Other"]}
        color="teal"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, transaction: null })}
        onConfirm={handleConfirmDelete}
        transaction={deleteModalState.transaction}
        title="Delete Income Record?"
        message="Are you sure you want to permanently delete this income record? This action cannot be undone."
        loading={deleteLoading}
        currency={currency}
      />
    </motion.div>
  );
};

export default IncomePage;