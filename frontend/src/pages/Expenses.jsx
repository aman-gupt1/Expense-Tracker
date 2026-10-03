import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Plus,
  DollarSign,
  Download,
  Eye,
  Calendar,
  TrendingDown,
  Filter,
  BarChart2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import axios from "axios";
import { exportToExcel } from "../utils/exportUtils";
import FinancialCard from "../components/FinancialCard";
import TimeFrameSelector from "../components/TimeFrame";
import TransactionItem from "../components/TransactionItem";
import AddTransactionModal from "../components/Add";
import { getTimeFrameRange, generateChartPoints } from "../components/Helper";
import { CATEGORY_ICONS } from "../assets/color";
import { dummyTransactions } from "../assets/dummy";
import { getAuthHeaders } from "../utils/auth";
import { formatCurrency } from "../utils/currency";
import { toast } from "react-toastify";
import DeleteConfirmModal from "../components/DeleteConfirmModal";

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

const ExpensePage = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
  });

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    transaction: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const timeFrameRange = useMemo(
    () => getTimeFrameRange(timeFrame, selectedMonth),
    [timeFrame, selectedMonth]
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

  const expenseTransactions = useMemo(
    () =>
      (outletTransactions || [])
        .filter((t) => t.type === "expense")
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [outletTransactions]
  );

  const timeFrameTransactions = useMemo(
    () =>
      expenseTransactions.filter((t) =>
        isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
      ),
    [expenseTransactions, timeFrameRange, isDateInRange]
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

  const totalExpense = useMemo(
    () =>
      filteredTransactions.reduce(
        (sum, t) => sum + Math.round(Number(t.amount || 0)),
        0
      ),
    [filteredTransactions]
  );

  const averageExpense = useMemo(
    () =>
      filteredTransactions.length
        ? Math.round(totalExpense / filteredTransactions.length)
        : 0,
    [filteredTransactions, totalExpense]
  );

  // Chart data
  const chartData = useMemo(() => {
    const data = chartPoints.map((point, index) => ({
      label: point?.label || `Item ${index}`,
      ...point,
      expense: 0,
    }));

    filteredTransactions.forEach((transaction) => {
      const transDate = new Date(transaction.date);
      const point = data.find((d) =>
        timeFrame === "daily"
          ? d.hour === transDate.getHours()
          : timeFrame === "yearly"
          ? d.date.getMonth() === transDate.getMonth()
          : d.date.getDate() === transDate.getDate() &&
            d.date.getMonth() === transDate.getMonth()
      );
      if (point) {
        point.expense += Math.round(Number(transaction.amount));
      }
    });

    return data;
  }, [filteredTransactions, chartPoints, timeFrame]);

  // Actions with Guest Interception
  const handleAddClick = () => {
    if (isGuest) {
      requestAuth("add an expense transaction");
      return;
    }
    setShowModal(true);
  };

  const handleAddTransaction = async () => {
    if (!newTransaction.description || !newTransaction.amount) return;

    if (isGuest) {
      setShowModal(false);
      requestAuth("add an expense transaction");
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

      await axios.post(`${API_BASE}/expense/add`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      await refreshTransactions();
      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
        type: "expense",
        category: "Food",
      });
      setShowModal(false);
      toast.success("Expense added successfully!");
    } catch (err) {
      console.error("Add expense error:", err);
      toast.error(err?.response?.data?.message || "Server error while adding expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (transaction) => {
    if (isGuest) {
      requestAuth("edit this expense transaction");
      return;
    }
    setEditForm({
      description: transaction.description ?? "",
      amount: transaction.amount ?? "",
      category: transaction.category ?? "Food",
      date: transaction.date ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setEditingId(transaction.id);
  };

  const handleEditTransaction = async () => {
    if (!editingId || !editForm.description || !editForm.amount) return;

    if (isGuest) {
      setEditingId(null);
      requestAuth("edit this expense transaction");
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

      await axios.put(`${API_BASE}/expense/update/${editingId}`, payload, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      await refreshTransactions();
      setEditingId(null);
      toast.success("Expense updated successfully!");
    } catch (err) {
      console.error("Update expense error:", err);
      toast.error(err?.response?.data?.message || "Server error while updating expense.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id, transaction) => {
    if (!id) return;

    if (isGuest) {
      requestAuth("delete this expense transaction");
      return;
    }

    const target =
      typeof transaction === "object" && transaction !== null
        ? transaction
        : outletTransactions.find((t) => t.id === id);

    setDeleteModalState({
      isOpen: true,
      transaction: target || { id, type: "expense" },
    });
  };

  const handleConfirmDelete = async () => {
    const targetId = deleteModalState.transaction?.id;
    if (!targetId) return;

    try {
      setDeleteLoading(true);
      await axios.delete(`${API_BASE}/expense/delete/${targetId}`, {
        headers: getAuthHeaders(),
      });
      await refreshTransactions();
      toast.success("Expense deleted successfully!");
      setDeleteModalState({ isOpen: false, transaction: null });
    } catch (err) {
      console.error("Delete expense error:", err);
      toast.error(err?.response?.data?.message || "Server error while deleting expense.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      if (!isGuest) {
        const res = await axios.get(`${API_BASE}/expense/downloadexcel`, {
          headers: getAuthHeaders(),
          responseType: "blob",
        });

        const blob = new Blob([res.data], {
          type: res.headers["content-type"] || "application/octet-stream",
        });
        const disposition = res.headers["content-disposition"];
        let filename = "expense_details.xlsx";
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
        Type: "Expense",
      }));
      exportToExcel(exportData, `expenses_${new Date().toISOString().slice(0, 10)}`);
    } catch (e) {
      console.error("Fallback export failed:", e);
      alert("Failed to export data.");
    }
  };

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
      {/* 1. HEADER CARD */}
      <motion.div
        variants={cardItemVariants}
        className="relative bg-white rounded-3xl p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] border border-slate-200/80 hover:border-rose-300/70 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 overflow-hidden group"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent" />

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200/70 mb-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Expense & Outflow Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
            Expense Stream
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track, categorize, and control all spending channels and budget outflows
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/30 transition-all cursor-pointer group active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </motion.div>

      {/* 2. TIMEFRAME SELECTOR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <TimeFrameSelector
          timeFrame={timeFrame}
          setTimeFrame={(frame) => {
            setTimeFrame(frame);
            setSelectedMonth(null);
          }}
          options={["daily", "weekly", "monthly", "yearly"]}
          color="orange"
        />
        <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Active Window: <strong className="text-slate-700 font-bold">{timeFrameRange?.label || timeFrame}</strong></span>
        </div>
      </div>

      {/* 3. SUMMARY STATS CARDS */}
      <motion.div variants={cardItemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/70 border border-rose-100 text-rose-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Total Expenses"
          value={formatCurrency(totalExpense, currency)}
          trend="Outflows"
          trendPositive={false}
          additionalContent="Net spending for selected range"
        />
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50/70 border border-orange-100 text-orange-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Average Spending"
          value={formatCurrency(averageExpense, currency)}
          trend="Avg / Ticket"
          trendPositive={false}
          additionalContent="Mean outflow per transaction"
        />
        <FinancialCard
          icon={
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50/70 border border-violet-100 text-violet-600 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
              <BarChart2 className="w-5 h-5 stroke-[2.2]" />
            </div>
          }
          label="Expense Count"
          value={`${filteredTransactions.length}`}
          trend="Entries"
          trendPositive={false}
          additionalContent={`${filteredTransactions.length} recorded outflows`}
        />
      </motion.div>

      {/* 4. EXPENSE TRENDS AREA CHART */}
      <motion.div
        variants={cardItemVariants}
        className="relative bg-white rounded-3xl p-5 sm:p-7 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] border border-slate-200/80 hover:border-rose-300/70 transition-all duration-300 overflow-hidden group"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/70 border border-rose-100 text-rose-600 flex items-center justify-center shadow-xs shrink-0">
              <BarChart2 className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight leading-tight">
                {timeFrame === "daily"
                  ? "Hourly"
                  : timeFrame === "yearly"
                  ? "Monthly"
                  : "Daily"}{" "}
                Expense Trajectory & Curve
              </h3>
              <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                Window: {timeFrameRange?.label || timeFrame}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-rose-700 bg-rose-50/90 border border-rose-200/70 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Total: {formatCurrency(totalExpense, currency)}</span>
          </div>
        </div>

        <div className="w-full h-[260px] sm:h-[320px] min-h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="expensePageGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.01} />
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
                tickFormatter={(value) =>
                  `${currency}${value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}`
                }
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value, currency), "Expense"]}
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
              <Area
                type="monotone"
                dataKey="expense"
                stroke="#f43f5e"
                fill="url(#expensePageGradient)"
                strokeWidth={2.5}
                activeDot={{ r: 6, fill: "#e11d48", stroke: "#ffffff", strokeWidth: 2 }}
              />
              {chartData.map(
                (point, index) =>
                  point.isCurrent && (
                    <ReferenceLine
                      key={index}
                      x={point.label}
                      stroke="#f43f5e"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  )
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 5. SEARCH & FILTER CONTROLS */}
      <motion.div
        variants={cardItemVariants}
        className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] border border-slate-200/80 flex flex-col md:flex-row justify-between items-center gap-3"
      >
        {/* Real-time Search input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense records..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 hover:bg-slate-50 focus:bg-white border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all shadow-2xs"
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
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-2xl pl-3.5 pr-9 py-2.5 text-xs sm:text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 transition-all cursor-pointer shadow-2xs"
            >
              <option value="all">All Categories</option>
              <option value="Food">Food</option>
              <option value="Housing">Housing</option>
              <option value="Transport">Transport</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Other">Other</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200/80 rounded-2xl bg-slate-50/80 hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-700 transition cursor-pointer shrink-0 active:scale-[0.98] shadow-2xs hover:shadow-xs"
          >
            <Download className="w-4 h-4 text-rose-600" />
            <span>Export</span>
          </button>
        </div>
      </motion.div>

      {/* 6. TRANSACTIONS LIST */}
      <motion.div
        variants={cardItemVariants}
        className="bg-white rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-200/80 space-y-3"
      >
        <div className="flex justify-between items-center mb-2 px-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-slate-800 text-base">
              Expense Records
            </h3>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
              {filteredTransactions.length}
            </span>
          </div>

          <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Real-time Live Records
          </span>
        </div>

        <div className="space-y-2.5">
          {filteredTransactions
            .slice(0, showAll ? filteredTransactions.length : 8)
            .map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                isEditing={editingId === transaction.id}
                editForm={editForm}
                setEditForm={setEditForm}
                onSave={handleEditTransaction}
                onCancel={() => setEditingId(null)}
                onDelete={handleDeleteClick}
                onEdit={() => {
                  if (isGuest) {
                    requestAuth("edit this expense transaction");
                    return false;
                  }
                  return true;
                }}
                type="expense"
                categoryIcons={CATEGORY_ICONS}
                setEditingId={setEditingId}
                currency={currency}
              />
            ))}
        </div>

        {!showAll && filteredTransactions.length > 8 && (
          <button
            onClick={() => setShowAll(true)}
            className="w-full py-3 mt-2 text-rose-700 hover:text-rose-800 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200/60 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs sm:text-sm transition cursor-pointer shadow-2xs"
          >
            <Eye className="w-4 h-4" />
            <span>View All ({filteredTransactions.length}) Records</span>
          </button>
        )}

        {filteredTransactions.length === 0 && (
          <div className="w-full py-14 flex flex-col items-center justify-center text-center px-4">
            <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100/90 border border-slate-200/70 flex items-center justify-center shadow-inner ring-6 ring-slate-50/80">
                <DollarSign className="w-7 h-7 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-rose-50 border-2 border-white flex items-center justify-center text-rose-600 shadow-2xs">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>
            <p className="text-sm font-bold text-slate-700">No Expense Records Found</p>
            <p className="text-xs text-slate-400 max-w-[220px] mt-1 leading-relaxed">
              {searchQuery ? "Try refining your search keyword" : "Record your first expense above to see analytics."}
            </p>
          </div>
        )}
      </motion.div>

      {/* ADD EXPENSE MODAL */}
      <AddTransactionModal
        showModal={showModal}
        setShowModal={setShowModal}
        newTransaction={newTransaction}
        setNewTransaction={setNewTransaction}
        handleAddTransaction={handleAddTransaction}
        loading={loading}
        type="expense"
        title="Add New Expense"
        buttonText="Save Expense"
        categories={[
          "Food",
          "Housing",
          "Transport",
          "Shopping",
          "Entertainment",
          "Utilities",
          "Healthcare",
          "Other",
        ]}
        color="orange"
      />

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState({ isOpen: false, transaction: null })}
        onConfirm={handleConfirmDelete}
        transaction={deleteModalState.transaction}
        title="Delete Expense Record?"
        message="Are you sure you want to permanently delete this expense record? This action cannot be undone."
        loading={deleteLoading}
        currency={currency}
      />
    </motion.div>
  );
};

export default ExpensePage;
