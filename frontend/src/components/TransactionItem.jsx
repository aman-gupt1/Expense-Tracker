import React, { useState } from "react";
import { colorClasses } from "../assets/color";
import { DollarSign, Edit, Save, Trash2, X } from "lucide-react";
import { transactionItemStyles as styles } from "../assets/dummyStyles";

const TransactionItem = ({
  transaction,
  isEditing,
  editForm,
  setEditForm,
  onSave,
  onCancel,
  onDelete,
  onEdit,
  type = "expense",
  categoryIcons,
  setEditingId,
  currency = "$",
}) => {
  const [errors, setErrors] = useState({ description: "", amount: "" });

  const classes = colorClasses[type] || colorClasses.expense;
  const sign = type === "income" ? "+" : "-";

  const validate = () => {
    const nextErrors = { description: "", amount: "" };

    if (!editForm.description?.trim()) {
      nextErrors.description = "Description is required.";
    }

    if (!editForm.amount || Number(editForm.amount) <= 0) {
      nextErrors.amount = "Valid amount required.";
    }

    setErrors(nextErrors);
    return !nextErrors.description && !nextErrors.amount;
  };

  const handleSaveClick = () => {
    if (validate()) {
      setErrors({ description: "", amount: "" });
      onSave();
    }
  };

  const handleEditClick = () => {
    if (onEdit) {
      const allowed = onEdit(transaction);
      if (allowed === false) return;
    }
    setEditForm({
      description: transaction.description ?? "",
      amount: transaction.amount ?? "",
      category: transaction.category ?? (type === "income" ? "Salary" : "Food"),
      date: transaction.date ? transaction.date.split("T")[0] : new Date().toISOString().split("T")[0],
      type: transaction.type ?? type,
    });
    setErrors({ description: "", amount: "" });
    if (setEditingId) setEditingId(transaction.id);
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl transition-all duration-200 border ${
        isEditing
          ? "bg-slate-50/90 border-teal-300 ring-2 ring-teal-500/10 shadow-sm"
          : "bg-white hover:bg-gradient-to-r hover:from-slate-50/90 hover:via-teal-50/20 hover:to-transparent border-slate-200/70 hover:border-teal-300/70 shadow-2xs hover:shadow-sm"
      } group/row`}
    >
      {/* LEFT: Category Icon & Content */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1 w-full sm:w-auto">
        {/* ICON */}
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover/row:scale-105 shadow-2xs ${
            type === "income"
              ? "bg-gradient-to-br from-emerald-50 to-teal-50/70 border-emerald-200/80 text-emerald-600 group-hover/row:bg-emerald-100/70"
              : "bg-gradient-to-br from-rose-50 to-orange-50/70 border-rose-200/80 text-rose-600 group-hover/row:bg-rose-100/70"
          }`}
        >
          {categoryIcons?.[transaction.category] || <DollarSign className="w-5 h-5 stroke-[2.2]" />}
        </div>

        {/* CONTENT */}
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="space-y-1.5 w-full">
              <input
                type="text"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                placeholder="Description"
              />
              {errors.description && (
                <p className="text-xs text-rose-600 font-semibold">{errors.description}</p>
              )}
            </div>
          ) : (
            <p className="font-bold text-slate-800 text-sm sm:text-base truncate group-hover/row:text-teal-950 transition-colors">
              {transaction.description}
            </p>
          )}

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-1">
            <span>
              {new Date(transaction.date).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-slate-300">•</span>
            <span
              className={`capitalize px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                type === "income"
                  ? "bg-emerald-50/80 text-emerald-700 border-emerald-100"
                  : "bg-rose-50/80 text-rose-700 border-rose-100"
              }`}
            >
              {transaction.category}
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT: Amount & Action Buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {/* AMOUNT */}
        <div className="shrink-0">
          {isEditing ? (
            <div className="flex flex-col items-end">
              <input
                type="number"
                step="any"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                className="w-28 px-3 py-2 text-sm font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-right"
                placeholder="0.00"
              />
              {errors.amount && (
                <p className="text-xs text-rose-600 font-semibold mt-1">{errors.amount}</p>
              )}
            </div>
          ) : (
            <span
              className={`inline-flex items-center gap-0.5 text-xs sm:text-sm font-black px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border shadow-2xs transition-all ${
                type === "income"
                  ? "text-emerald-700 bg-emerald-50/80 border-emerald-200/70 group-hover/row:bg-emerald-100/90"
                  : "text-rose-700 bg-rose-50/80 border-rose-200/70 group-hover/row:bg-rose-100/90"
              }`}
            >
              {sign}{currency}{Number(transaction.amount).toLocaleString()}
            </span>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-1 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveClick}
                className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-xs active:scale-[0.96]"
                title="Save changes"
              >
                <Save size={16} />
              </button>

              <button
                onClick={() => {
                  setErrors({ description: "", amount: "" });
                  onCancel();
                }}
                className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer active:scale-[0.96]"
                title="Cancel"
              >
                <X size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleEditClick}
                className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition cursor-pointer"
                title="Edit record"
              >
                <Edit size={16} />
              </button>

              <button
                onClick={() => onDelete(transaction.id, transaction)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Delete record"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;