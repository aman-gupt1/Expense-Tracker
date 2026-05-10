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
  type = "expense",
  categoryIcons,
  setEditingId,
}) => {
  const [errors, setErrors] = useState({ description: "", amount: "" });

  const classes = colorClasses[type];
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

  

  return (
  <div className={styles.container(isEditing, classes)}>

    {/* LEFT */}
    <div className={styles.mainContainer}>

      {/* ICON */}
      <div className={styles.iconContainer("p-3 rounded-xl", classes)}>
        {categoryIcons?.[transaction.category] || (
          <DollarSign className="w-5 h-5" />
        )}
      </div>

      {/* CONTENT */}
      <div className={styles.contentContainer}>

        {isEditing ? (
          <>
            <input
              type="text"
              value={editForm.description}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={styles.input(errors.description, classes)}
            />

            {errors.description && (
              <p className={styles.errorText}>
                {errors.description}
              </p>
            )}
          </>
        ) : (
          <p className={styles.description}>
            {transaction.description}
          </p>
        )}

        <p className={styles.details}>
          {new Date(transaction.date).toLocaleDateString()} •{" "}
          {transaction.category}
        </p>
      </div>
    </div>

    {/* RIGHT */}
    <div className={styles.actionsContainer}>

      {/* AMOUNT */}
      <div className={styles.amountContainer}>

        {isEditing ? (
          <>
            <input
              type="number"
              value={editForm.amount}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  amount: e.target.value,
                }))
              }
              className={styles.amountInput(errors.amount, classes)}
            />

            {errors.amount && (
              <p className={styles.errorText}>
                {errors.amount}
              </p>
            )}
          </>
        ) : (
          <span className={styles.amountText("", classes)}>
            {sign}${Number(transaction.amount).toLocaleString()}
          </span>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className={styles.buttonsContainer}>

        {isEditing ? (
          <>
            <button
              onClick={handleSaveClick}
              className={styles.saveButton(classes)}
            >
              <Save size={16} />
            </button>

            <button
              onClick={() => {
                setErrors({ description: "", amount: "" });
                onCancel();
              }}
              className={styles.cancelButton}
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setEditForm({
                  description: transaction.description ?? "",
                  amount: transaction.amount ?? "",
                  category: transaction.category ?? "",
                  date: transaction.date ?? "",
                  type: transaction.type ?? "expense",
                });
                setErrors({ description: "", amount: "" });
                setEditingId(transaction.id);
              }}
              className={styles.editButton(classes)}
            >
              <Edit size={16} />
            </button>

            <button
              onClick={() => onDelete(transaction.id)}
              className={styles.deleteButton(classes)}
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