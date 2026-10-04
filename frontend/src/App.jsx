import React, { useEffect, useState, useCallback } from "react";
import Layout from "./components/Layout";
import { useNavigate, Routes, Route, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Income from "./pages/Income";
import Expense from "./pages/Expenses";
import Profile from "./pages/Profile";
import axios from "axios";
import { dummyTransactions } from "./assets/dummy";
import { ToastContainer, toast, Slide } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

const getTransactionsFromStorage = () => {
  try {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error("Failed to read transactions from storage:", e);
    return [];
  }
};

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);
  return null;
};

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const isGuest = !user || !token;

  // Fetch real user transactions from backend MongoDB
  const fetchUserTransactions = useCallback(async (authToken) => {
    if (!authToken) return [];
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_URL}/api/income/get`, { headers }),
        axios.get(`${API_URL}/api/expense/get`, { headers }),
      ]);

      const incomes = (incomeRes.data?.data || []).map((i) => ({
        id: i._id || i.id,
        description: i.description,
        amount: Number(i.amount) || 0,
        category: i.category || "Salary",
        date: i.date || i.createdAt || new Date().toISOString(),
        type: "income",
      }));

      const expenses = (expenseRes.data?.data || []).map((e) => ({
        id: e._id || e.id,
        description: e.description,
        amount: Number(e.amount) || 0,
        category: e.category || "Other",
        date: e.date || e.createdAt || new Date().toISOString(),
        type: "expense",
      }));

      const combined = [...incomes, ...expenses].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      try {
        localStorage.setItem("transactions", JSON.stringify(combined));
      } catch (err) {
        console.warn("Could not save to localStorage", err);
      }

      return combined;
    } catch (err) {
      console.warn("Failed to fetch user transactions from API:", err?.message || err);
      return getTransactionsFromStorage();
    }
  }, []);

  const persistAuth = (userObj, tokenStr, remember = false) => {
    try {
      if (remember) {
        if (userObj) localStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) localStorage.setItem("token", tokenStr);
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");
      } else {
        if (userObj) sessionStorage.setItem("user", JSON.stringify(userObj));
        if (tokenStr) sessionStorage.setItem("token", tokenStr);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
      setUser(userObj || null);
      setToken(tokenStr || null);
    } catch (err) {
      console.error("persistAuth error:", err);
    }
  };

  const clearAuth = () => {
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("transactions");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
    } catch (err) {
      console.error("clearAuth error:", err);
    }
    setUser(null);
    setToken(null);
    setTransactions(dummyTransactions);
  };

  const updateUserData = (updatedUser) => {
    setUser(updatedUser);
    const localToken = localStorage.getItem("token");
    const sessionToken = sessionStorage.getItem("token");
    if (localToken) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (sessionToken) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  // Bootstrap auth on app mount
  useEffect(() => {
    (async () => {
      try {
        const localUserRaw = localStorage.getItem("user");
        const sessionUserRaw = sessionStorage.getItem("user");
        const localToken = localStorage.getItem("token");
        const sessionToken = sessionStorage.getItem("token");

        const storedUser = localUserRaw
          ? JSON.parse(localUserRaw)
          : sessionUserRaw
          ? JSON.parse(sessionUserRaw)
          : null;

        const storedToken = localToken || sessionToken || null;
        const tokenFromLocal = !!localToken;

        if (storedToken) {
          try {
            const res = await axios.get(`${API_URL}/api/user/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            const profile = res.data.user || res.data;
            persistAuth(profile, storedToken, tokenFromLocal);

            // Fetch actual user transactions from MongoDB
            const userTx = await fetchUserTransactions(storedToken);
            setTransactions(userTx);
          } catch (fetchErr) {
            console.warn("Could not fetch profile with stored token:", fetchErr);
            if (storedUser) {
              setUser(storedUser);
              setToken(storedToken);
              const userTx = await fetchUserTransactions(storedToken);
              setTransactions(userTx);
            } else {
              clearAuth();
            }
          }
        } else {
          // Guest mode: load dummy transactions seamlessly
          setTransactions(dummyTransactions);
        }
      } catch (err) {
        console.error("Error bootstrapping auth:", err);
        setTransactions(dummyTransactions);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [fetchUserTransactions]);

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully", {
      toastId: "logout-success",
      autoClose: 2000,
    });
    navigate("/", { replace: true });
  };

  const handleLogin = async (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    // Fetch user's real transactions from database
    const userTx = await fetchUserTransactions(tokenFromApi);
    setTransactions(userTx);
    navigate("/");
  };

  const handleSignup = async (userData, remember = false, tokenFromApi = null) => {
    persistAuth(userData, tokenFromApi, remember);
    setTransactions([]);
    navigate("/");
  };

  // Transaction mutations
  const addTransaction = (newTransaction) => {
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const editTransaction = (id, updatedTransaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...updatedTransaction, id } : t))
    );
  };

  const deleteTransaction = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const refreshTransactions = async () => {
    if (!isGuest && token) {
      const userTx = await fetchUserTransactions(token);
      setTransactions(userTx);
    } else {
      setTransactions(dummyTransactions);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"></div>
          <p className="mt-4 text-sm font-semibold text-gray-600">Loading ExpenseTracker...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <ToastContainer
        position="top-center"
        autoClose={2200}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
        transition={Slide}
        theme="colored"
      />
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup onSignup={handleSignup} />} />

        {/* Dashboard and pages: Guest sees dummy data seamlessly, Logged-in user sees their actual data */}
        <Route
          element={
            <Layout
              user={user}
              isGuest={isGuest}
              transactions={transactions}
              addTransaction={addTransaction}
              editTransaction={editTransaction}
              deleteTransaction={deleteTransaction}
              refreshTransactions={refreshTransactions}
              onLogout={handleLogout}
            />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expense" element={<Expense />} />
          <Route
            path="/profile"
            element={<Profile user={user} onUpdateProfile={updateUserData} onLogout={handleLogout} />}
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;