import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Loader2 } from "lucide-react";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  transaction = null,
  title = "Delete Transaction?",
  message = "Are you sure you want to permanently delete this record? This action cannot be undone.",
  loading = false,
  currency = "₹",
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 z-10 overflow-hidden"
          >
            {/* Top Close Button */}
            {!loading && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Warning Icon Badge */}
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 ring-8 ring-rose-50/50 shadow-inner">
                <Trash2 className="w-7 h-7 text-rose-600" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1.5">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mb-5">
                {message}
              </p>
            </div>

            {/* Optional Transaction Preview Card */}
            {transaction && (
              <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 mb-6 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 text-sm truncate">
                    {transaction.description || "Untitled Transaction"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {transaction.category && (
                      <span className="text-[11px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-600">
                        {transaction.category}
                      </span>
                    )}
                    {transaction.date && (
                      <span className="text-[11px] text-slate-400">
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={`font-bold text-sm sm:text-base ${
                      transaction.type === "income"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {currency}
                    {Number(transaction.amount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:scale-[0.98] rounded-xl transition cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-rose-200 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Delete</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
