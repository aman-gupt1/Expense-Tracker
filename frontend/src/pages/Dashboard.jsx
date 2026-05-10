import axios from 'axios';
import React, { useEffect, useMemo, useState } from 'react'
import { BiPlus } from 'react-icons/bi';
import { useOutletContext } from 'react-router-dom';
import {getTimeFrameRange,getPreviousTimeFrameRange,calculateData} from "../components/Helper"
import FinancialCard from '../components/FinancialCard';
import { ArrowDown, TrendingUp as ProfitIcon, PieChart as PieChartIcon, BarChart2, ChevronDown, ChevronUp, DollarSign, PiggyBank, ShoppingCart, TrendingDown, TrendingUp, Wallet} from "lucide-react";
import GaugeCard from '../components/GauseCard';
import { Cell, Legend, Pie, ResponsiveContainer, Tooltip, PieChart } from 'recharts';
import AddTransactionModal from '../components/Add';
import { INCOME_CATEGORY_ICONS, EXPENSE_CATEGORY_ICONS } from "../assets/color";
import { dashboardStyles as styles } from "../assets/dummyStyles";
import { getAuthHeaders } from "../utils/auth";

const API_BASE=import.meta.env.VITE_API_URL + "/api";
// const API_BASE="http://localhost:4000/api";
const GAUGE_COLORS = {
  Income: "#00C49F",
  Spent: "#FF8042",
  Savings: "#0088FE",
};
const COLORS = ["#00C49F", "#FF8042", "#0088FE", "#FFBB28", "#AF19FF"];

// const getAuthHeader=()=>{
//   const token=localStorage.getItem("token") || localStorage.getItem("authToken");
//   return token ? {Authorization: `Bearer ${token}`} : {};
// }

// Fix token issue 
// export const getAuthHeader = () => {
//   const token = localStorage.getItem("token");

//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// to convert date to ISO timeline
function toIsoWithClientTime(dateValue) {
  if (!dateValue) {
    return new Date().toISOString();
  }

  if (typeof dateValue === "string" && dateValue.length === 10) {
    const now = new Date();
    const hhmmss = now.toTimeString().slice(0, 8);
    const combined = new Date(`${dateValue}T${hhmmss}`);
    return combined.toISOString();
  }

  try {
    return new Date(dateValue).toISOString();
  } catch (err) {
    return new Date().toISOString();
  }
}


const Dashboard = () => {

 const { 
    transactions: outletTransactions = [], 
    timeFrame = "monthly", 
    setTimeFrame = () => {},
    refreshTransactions 
  } = useOutletContext();

  const [showModal, setShowModal] = useState(false);
  const [gaugeData, setGaugeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [overviewMeta, setOverviewMeta] = useState({});
  const [showAllIncome, setShowAllIncome] = useState(false);
  const [showAllExpense, setShowAllExpense] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    amount: "",
    type: "expense",
    category: "Food",
  });

  const timeFrameRange = useMemo(() => getTimeFrameRange(timeFrame), [timeFrame]);
  const prevTimeFrameRange = useMemo(() => getPreviousTimeFrameRange(timeFrame), [timeFrame]);

  const isDateInRange = (date, start, end) => {
    const transactionDate = new Date(date);
    const startDate = new Date(start);
    const endDate = new Date(end);
    transactionDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return transactionDate >= startDate && transactionDate <= endDate;
  };

  const filteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) => 
      isDateInRange(t.date, timeFrameRange.start, timeFrameRange.end)
    ),
    [outletTransactions, timeFrameRange]
  );

  const prevFilteredTransactions = useMemo(
    () => (outletTransactions || []).filter((t) => 
      isDateInRange(t.date, prevTimeFrameRange.start, prevTimeFrameRange.end)
    ),
    [outletTransactions, prevTimeFrameRange]
  );

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

  useEffect(() => {
    const maxValues = {
      income: Math.max(currentTimeFrameData.income, 5000),
      expenses: Math.max(currentTimeFrameData.expenses, 3000),
      savings: Math.max(Math.abs(currentTimeFrameData.savings), 2000),
    };

    setGaugeData([
      { name: "Income", value: currentTimeFrameData.income, max: maxValues.income },
      { name: "Spent", value: currentTimeFrameData.expenses, max: maxValues.expenses },
      { name: "Savings", value: currentTimeFrameData.savings, max: maxValues.savings },
    ]);
  }, [currentTimeFrameData, timeFrame]);

  const displayIncome =
    timeFrame === "monthly" && typeof overviewMeta.monthlyIncome === "number"
      ? overviewMeta.monthlyIncome
      : currentTimeFrameData.income;

  const displayExpenses =
    timeFrame === "monthly" && typeof overviewMeta.monthlyExpense === "number"
      ? overviewMeta.monthlyExpense
      : currentTimeFrameData.expenses;

  const displaySavings =
    timeFrame === "monthly" && typeof overviewMeta.savings === "number"
      ? overviewMeta.savings
      : currentTimeFrameData.savings;

  const expenseChange = useMemo(() => {
    const prev = prevTimeFrameData.expenses;
    const curr = displayExpenses;
    if (!prev) {
      if (!curr) return 0;
      return 100;
    }
    return Math.round(((curr - prev) / prev) * 100);
  }, [prevTimeFrameData, displayExpenses]);


  const financialOverviewData = useMemo(() => {
  // Backend data use karo agar available ho
  if (
    timeFrame === "monthly" &&
    Array.isArray(overviewMeta.expenseDistribution) &&
    overviewMeta.expenseDistribution.length > 0
  ) {
    return overviewMeta.expenseDistribution.map((d) => ({
      name: d.category || "Other",
      value: Number(d.amount) || 0,
    }));
  }

  // Fallback (FIXED)
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
    value: categories[key],
  }));
}, [filteredTransactions, overviewMeta, timeFrame]);




// build server-provided recent list
   const serverRecent = overviewMeta.recentTransactions || [];
  const serverRecentIncome = serverRecent
    .filter((t) => t.type === "income")
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  const serverRecentExpense = serverRecent
    .filter((t) => t.type === "expense")
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const incomeTransactions = useMemo(
    () => filteredTransactions
      .filter((t) => t.type === "income")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions]
  );

  const expenseTransactions = useMemo(
    () => filteredTransactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredTransactions]
  );

  const incomeListForDisplay =
    timeFrame === "monthly" && serverRecentIncome.length > 0
      ? serverRecentIncome
      : incomeTransactions;

  const expenseListForDisplay =
    timeFrame === "monthly" && serverRecentExpense.length > 0
      ? serverRecentExpense
      : expenseTransactions;

  const displayedIncome = showAllIncome 
    ? incomeListForDisplay 
    : incomeListForDisplay.slice(0, 3);

  const displayedExpense = showAllExpense 
    ? expenseListForDisplay 
    : expenseListForDisplay.slice(0, 3);


    // fetch the server-side data
    const fetchDashboardOverview=async()=>{
      try {
        setLoading(true);
        const res=await axios.get(`${API_BASE}/dashboard`,{
          headers:getAuthHeaders(),
        })
        if(res?.data?.success){
          const data=res.data.data;
      const recent = (data.recentTransactions || []).map((item) => {
          const typeFromServer =
            item.type || (item.category ? "expense" : "income");
          const amountNum = Number(item.amount) || 0;

          const isoDate = item.date
            ? new Date(item.date).toISOString()
            : item.createdAt
            ? new Date(item.createdAt).toISOString()
            : new Date().toISOString();

          return {
            id: item._id || item.id || Date.now() + Math.random(),
            date: isoDate,
            description:
              item.description ||
              item.note ||
              item.title ||
              (typeFromServer === "income"
                ? item.source || "Income"
                : item.category || "Expense"),
            amount: amountNum,
            type: typeFromServer,
            category:
              item.category ||
              (typeFromServer === "income" ? "Salary" : "Other"),
            raw: item,
          };
        });

        setOverviewMeta((prev) => ({
          ...prev,
          monthlyIncome: Number(data.monthlyIncome || 0),
          monthlyExpense: Number(data.monthlyExpense || 0),
          savings:
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : Number(data.monthlyIncome || 0) - Number(data.monthlyExpense || 0),
          savingsRate:
            typeof data.savingsRate !== "undefined" ? data.savingsRate : null,
          spendByCategory: data.spendByCategory || {},
          expenseDistribution: data.expenseDistribution || [],
          recentTransactions: recent,
        }));

        if (timeFrame === "monthly") {
          const monthlyIncome = Number(data.monthlyIncome || 0);
          const monthlyExpense = Number(data.monthlyExpense || 0);
          const savings =
            typeof data.savings !== "undefined"
              ? Number(data.savings)
              : monthlyIncome - monthlyExpense;

          const maxValues = {
            income: Math.max(monthlyIncome, 5000),
            expenses: Math.max(monthlyExpense, 3000),
            savings: Math.max(Math.abs(savings), 2000),
          };

          setGaugeData([
            { name: "Income", value: monthlyIncome, max: maxValues.income },
            { name: "Spent", value: monthlyExpense, max: maxValues.expenses },
            { name: "Savings", value: savings, max: maxValues.savings },
          ]);
        }
      } else {
        console.warn("Dashboard endpoint returned success:false", res?.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard overview:", err?.response || err.message || err);
    } finally{
      setLoading(false)
    }
  }
   useEffect(()=>{
    fetchDashboardOverview();
   },[])  

  //  add / edit // or delete
  const handleAddTransaction=async()=>{
    if(!newTransaction.description || !newTransaction.amount) return ;

    const payload={
      date: toIsoWithClientTime(newTransaction.date),
      description:newTransaction.description,
      amount: parseFloat(newTransaction.amount),
      category:newTransaction.category,
    };

    console.log(payload)

    try{
      setLoading(true);
      if(newTransaction.type==="income"){
        await axios.post(`${API_BASE}/income/add`,payload,{
          headers:getAuthHeaders()
        })
      } else{
        await axios.post(`${API_BASE}/expense/add`,payload,{
          headers:getAuthHeaders(),
        })
      }
      await refreshTransactions();
      await fetchDashboardOverview();

      setNewTransaction({
        date: new Date().toISOString().split("T")[0],
        description:"",
        amount:"",
        type:"expense",
        category:"Food",
      });
      setShowModal(false)
    } catch(err){
        console.error("Failed to add Transactions:",err?.response || err.message || err)
    } finally{
      setLoading(false)
    }
  }

return (
  <div className={styles.container}>

    {/* HEADER */}
    <div className={styles.headerContainer}>
      <div className={styles.headerContent}>

        <div>
          <h1 className={styles.headerTitle}>Finance Dashboard</h1>
          <p className={styles.headerSubtitle}>
            Track your income and expenses
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className={styles.addButton}
        >
          <BiPlus size={20} />
          Add Transaction
        </button>
      </div>

      {/* TIME FILTER */}
      <div className={styles.timeFrameContainer}>
        <div className="flex gap-1 bg-white p-1 rounded-xl border">
          {["daily", "weekly", "monthly"].map((frame) => (
            <button
              key={frame}
              onClick={() => setTimeFrame(frame)}
              className={styles.timeFrameButton(timeFrame === frame)}
            >
              {frame}
            </button>
          ))}
        </div>
      </div>
    </div>

    {/* CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

      <FinancialCard
        icon={<div className={styles.walletIconContainer}><Wallet className="w-5 h-5 text-teal-600"/></div>}
        label="Total Balance"
        value={`$${Math.round(displayIncome - displayExpenses).toLocaleString()}`}
      />

      <FinancialCard
        icon={<div className={styles.arrowDownIconContainer}><ArrowDown className="w-5 h-5 text-orange-600"/></div>}
        label="Expenses"
        value={`$${Math.round(displayExpenses).toLocaleString()}`}
      />

      <FinancialCard
        icon={<div className={styles.piggyBankIconContainer}><PiggyBank className="w-5 h-5 text-cyan-600"/></div>}
        label="Savings"
        value={`$${Math.round(displaySavings).toLocaleString()}`}
      />
    </div>

    {/* GAUGE */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 w-full min-w-0">
      {gaugeData.map((gauge) => (
         <div key={gauge.name} className="w-full min-w-0">
    <GaugeCard
      gauge={gauge}
      colorInfo={GAUGE_COLORS[gauge.name]}
      timeFrameLabel={timeFrameRange.label}
    />
  </div>
      ))}
    </div>

    {/* PIE CHART *   expense distribution/}
    {/* <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <PieChartIcon className="text-teal-500" />
        Expense Distribution
      </h3>

      <div className="h-72 min-h-[300px] w-full">
        <ResponsiveContainer  width="100%" height="100%">
          <PieChart>
            <Pie data={financialOverviewData} dataKey="value" innerRadius={70} outerRadius={110}>
              {financialOverviewData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div> */}
   <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
    <PieChartIcon className="text-teal-500" />
    Expense Distribution
  </h3>

  <div className="w-full h-[320px] min-h-[300px]">
    {financialOverviewData && financialOverviewData.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={financialOverviewData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={3}
          >
            {financialOverviewData.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip
            formatter={(value) => `$${Number(value).toLocaleString()}`}
          />

          <Legend
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        No expense data available
      </div>
    )}
  </div>
    </div>



    {/* LISTS */}
    <div className="grid md:grid-cols-2 gap-8">

      {/* INCOME */}
      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>
          <ProfitIcon /> Recent Income
        </h3>

        <div className="space-y-3">
          {displayedIncome.map((t) => (
            <div key={t.id} className="flex justify-between p-3 rounded-xl bg-green-50">
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-sm text-gray-500">{t.category}</p>
              </div>
              <p className="text-green-600 font-bold">+${t.amount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* EXPENSE */}
      <div className={styles.listContainer}>
        <h3 className={styles.listTitle}>
          <ArrowDown /> Recent Expenses
        </h3>

        <div className="space-y-3">
          {displayedExpense.map((t) => (
            <div key={t.id} className="flex justify-between p-3 rounded-xl bg-orange-50">
              <div>
                <p className="font-medium">{t.description}</p>
                <p className="text-sm text-gray-500">{t.category}</p>
              </div>
              <p className="text-orange-600 font-bold">-${t.amount}</p>
            </div>
          ))}
        </div>
      </div>

    </div>

    {/* MODAL */}
    <AddTransactionModal
      showModal={showModal}
      setShowModal={setShowModal}
      newTransaction={newTransaction}
      setNewTransaction={setNewTransaction}
      handleAddTransaction={handleAddTransaction}
      loading={loading}
    />

  </div>
);

}

export default Dashboard
