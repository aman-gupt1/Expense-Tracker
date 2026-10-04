import React, { useState, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import AuthPromptModal from "./AuthPromptModal";

const Layout = ({
  user,
  isGuest = false,
  transactions = [],
  addTransaction,
  editTransaction,
  deleteTransaction,
  refreshTransactions,
  onLogout,
}) => {
  const [sidebarcollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem("expense_currency") || "$";
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalAction, setAuthModalAction] = useState("");

  const handleSetCurrency = useCallback((newCurrency) => {
    setCurrency(newCurrency);
    try {
      localStorage.setItem("expense_currency", newCurrency);
    } catch (e) {
      console.warn("Could not save currency to localStorage", e);
    }
  }, []);

  // Intercept guest actions and prompt authentication smoothly
  const requestAuth = useCallback((actionName = "perform this action") => {
    if (isGuest) {
      setAuthModalAction(actionName);
      setAuthModalOpen(true);
      return true;
    }
    return false;
  }, [isGuest]);

  const handleAddTransaction = useCallback(async (transaction) => {
    if (isGuest) {
      requestAuth("add a transaction");
      return false;
    }
    if (addTransaction) return await addTransaction(transaction);
  }, [isGuest, requestAuth, addTransaction]);

  const handleEditTransaction = useCallback(async (id, transaction) => {
    if (isGuest) {
      requestAuth("edit this transaction");
      return false;
    }
    if (editTransaction) return await editTransaction(id, transaction);
  }, [isGuest, requestAuth, editTransaction]);

  const handleDeleteTransaction = useCallback(async (id, type) => {
    if (isGuest) {
      requestAuth("delete this transaction");
      return false;
    }
    if (deleteTransaction) return await deleteTransaction(id, type);
  }, [isGuest, requestAuth, deleteTransaction]);

  const outletContext = useMemo(() => ({
    transactions,
    isGuest,
    requestAuth,
    currency,
    setCurrency: handleSetCurrency,
    addTransaction: handleAddTransaction,
    editTransaction: handleEditTransaction,
    deleteTransaction: handleDeleteTransaction,
    refreshTransactions,
    user,
  }), [
    transactions,
    isGuest,
    requestAuth,
    currency,
    handleSetCurrency,
    handleAddTransaction,
    handleEditTransaction,
    handleDeleteTransaction,
    refreshTransactions,
    user,
  ]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex w-full antialiased text-slate-800">
      {/* Full-height Left Sidebar */}
      <Sidebar
        user={user}
        isGuest={isGuest}
        sidebarcollapsed={sidebarcollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onLogout={onLogout}
      />

      {/* Right Content Area: Top Navbar + Dashboard Main Content */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        <Navbar
          user={user}
          isGuest={isGuest}
          currency={currency}
          setCurrency={handleSetCurrency}
          onToggleMobileMenu={() => setMobileOpen(true)}
          onLogout={onLogout}
        />

        {/* Dashboard Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl w-full mx-auto min-w-0">
            <Outlet context={outletContext} />
          </div>
        </main>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={authModalAction}
      />
    </div>
  );
};

export default Layout;
