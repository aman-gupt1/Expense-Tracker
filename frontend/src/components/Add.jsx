import React from "react";
import { X, ArrowUpRight, ArrowDownRight } from "lucide-react";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = [
    "Food",
    "Housing",
    "Transport",
    "Shopping",
    "Entertainment",
    "Utilities",
    "Healthcare",
    "Salary",
    "Freelance",
    "Investment",
    "Bonus",
    "Other",
  ],
  color = "teal",
  loading = false,
}) => {
  if (!showModal) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split("T")[0];
  const minDate = `${currentYear - 2}-01-01`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs z-50 px-4 py-6 animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 tracking-tight">
            {title}
          </h3>
          <button
            onClick={() => setShowModal(false)}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAddTransaction();
          }}
          className="space-y-4"
        >
          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder={
                type === "both"
                  ? "Salary, Freelance, Grocery, etc."
                  : type === "income"
                  ? "Salary, Client payment, etc."
                  : "Groceries, Rent, Coffee, etc."
              }
              className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Amount ($)
            </label>
            <input
              type="number"
              step="any"
              min="0.01"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              placeholder="0.00"
              className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
              required
            />
          </div>

          {/* Type Selector (if both) */}
          {type === "both" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 tracking-tight">
                  Transaction Type
                </label>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize transition-colors ${
                    newTransaction.type === "income"
                      ? "text-emerald-700 bg-emerald-50 border border-emerald-200/70"
                      : "text-rose-700 bg-rose-50 border border-rose-200/70"
                  }`}
                >
                  {newTransaction.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <button
                  type="button"
                  onClick={() =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      type: "income",
                      category: "Salary",
                    }))
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    newTransaction.type === "income"
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25 border border-emerald-500/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      newTransaction.type === "income"
                        ? "bg-white/20 text-white"
                        : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>+ Income</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setNewTransaction((prev) => ({
                      ...prev,
                      type: "expense",
                      category: "Food",
                    }))
                  }
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer active:scale-[0.98] ${
                    newTransaction.type === "expense"
                      ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25 border border-rose-400/30"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      newTransaction.type === "expense"
                        ? "bg-white/20 text-white"
                        : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span>- Expense</span>
                </button>
              </div>
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction((prev) => ({
                  ...prev,
                  category: e.target.value,
                }))
              }
              className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
            >
              {categories.map((cat) => (
                <option value={cat} key={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Transaction Date
            </label>
            <input
              type="date"
              value={newTransaction.date}
              onChange={(e) => {
                setNewTransaction((prev) => ({
                  ...prev,
                  date: e.target.value,
                }));
              }}
              min={minDate}
              max={currentDate}
              className="w-full bg-gray-50 focus:bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition cursor-pointer"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white py-3 rounded-xl font-semibold text-sm shadow-md shadow-teal-500/20 transition cursor-pointer disabled:opacity-60"
            >
              {loading ? "Processing..." : buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
