
import React, { Activity, useState } from 'react'
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { ArrowBigDownIcon, ArrowDown, ArrowUp, Car, ChevronDown, ChevronUp, Clock, CreditCard, Gift, Home, Info, PieChart, PiggyBank, RefreshCcw, ShoppingCart, TrendingUp, Utensils, Zap } from 'lucide-react';
import axios from 'axios';
import { useEffect,useMemo } from 'react';
import { DollarSign } from "lucide-react";
import { Outlet } from 'react-router-dom';
import { styles } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_URL + "/api";
// const API_BASE = "http://localhost:4000/api";

const CATEGORY_ICONS = {
  Food: <Utensils className="w-4 h-4" />,
  Housing: <Home className="w-4 h-4" />,
  Transport: <Car className="w-4 h-4" />,
  Shopping: <ShoppingCart className="w-4 h-4" />,
  Entertainment: <Gift className="w-4 h-4" />,
  Utilities: <Zap className="w-4 h-4" />,
  Healthcare: <Activity className="w-4 h-4" />,
  Salary: <ArrowUp className="w-4 h-4" />,
  Freelance: <CreditCard className="w-4 h-4" />,
  Savings: <PiggyBank className="w-4 h-4" />,
};


// function for the filter
const filterTransactions = (transactions, frame) => {
  const now = new Date();
  const today = new Date(now).setHours(0, 0, 0, 0);

  switch (frame) {
    case "daily":
      return transactions.filter((t) => new Date(t.date) >= today);
    case "weekly": {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return transactions.filter((t) => new Date(t.date) >= startOfWeek);
    }
    case "monthly":
      return transactions.filter(
        (t) => new Date(t.date).getMonth() === now.getMonth()
      );
    default:
      return transactions;
  }
};


const safeArrayFromResponse = (res) => {
  const body = res?.data;
  if (!body) return [];
  if (Array.isArray(body)) return body;
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.incomes)) return body.incomes;
  if (Array.isArray(body.expenses)) return body.expenses;
  return [];
};


const Layout = ({ onLogout, user, children }) => {
  const [sidebarcollapsed, setSidebarCollapsed] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [timeFrame, setTimeFrame] = useState("monthly");
  const [loading, setLoading] = useState(false);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());


//   // to fetch the transaction coming from server side here
      const fetchTransactions = async () => {
    try {
      setLoading(true);
      // const token = localStorage.getItem("token");
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      // const headers = token ? { Authorization: `Bearer ${token}` } : {};
      if (!token) {
      console.error("No token found");
       return;
       }
       const headers = {
       Authorization: `Bearer ${token}`,
        };

      const [incomeRes, expenseRes] = await Promise.all([
        axios.get(`${API_BASE}/income/get`, { headers }),
        axios.get(`${API_BASE}/expense/get`, { headers }),
      ]);

      const incomes = safeArrayFromResponse(incomeRes).map((i) => ({
        ...i,
        type: "income",
      }));
      const expenses = safeArrayFromResponse(expenseRes).map((e) => ({
        ...e,
        type: "expense",
      }));

      const allTransactions = [...incomes, ...expenses]
        .map((t) => ({
          id: t._id || t.id || t.id_str || Math.random().toString(36).slice(2),
          description: t.description || t.title || t.note || "",
          amount: t.amount != null ? Number(t.amount) : Number(t.value) || 0,
          date: t.date || t.createdAt || new Date().toISOString(),
          category: t.category || t.type || "Other",
          type: t.type,
          raw: t,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(
        "Failed to fetch transactions",
        err?.response || err.message || err
      );
    } finally {
      setLoading(false);
    }
  };


  // add transaction
  const addTransaction = async (transaction) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint =
        transaction.type === "income" ? "income/add" : "expense/add";
      await axios.post(`${API_BASE}/${endpoint}`, transaction, { headers });
      await fetchTransactions();
      return true;
    } catch (err) {
      console.error(
        "Failed to add transaction",
        err?.response || err.message || err
      );
      throw err;
    }
  };

//   // edit transaction function to udate 

  const editTransaction = async (id, transaction) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint =
        transaction.type === "income" ? "income/update" : "expense/update";
      await axios.put(`${API_BASE}/${endpoint}/${id}`, transaction, {
        headers,
      });
      await fetchTransactions();
      return true;
    } catch (err) {
      console.error(
        "Failed to edit transaction",
        err?.response || err.message || err
      );
      throw err;
    }
  };

  const deleteTransaction = async (id, type) => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const endpoint = type === "income" ? "income/delete" : "expense/delete";
      await axios.delete(`${API_BASE}/${endpoint}/${id}`, { headers });
      await fetchTransactions();
      return true;
    } catch (err) {
      console.error(
        "Failed to delete transaction",
        err?.response || err.message || err
      );
      throw err;
    }
  };

   

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, timeFrame),
    [transactions, timeFrame]
  );

  const stats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);

    const last30DaysTransactions = transactions.filter(
      (t) => new Date(t.date) >= thirtyDaysAgo
    );

    const last30DaysIncome = last30DaysTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const last30DaysExpenses = last30DaysTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimeIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const allTimeExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const savingsRate =
      last30DaysIncome > 0
        ? Math.round(
            ((last30DaysIncome - last30DaysExpenses) / last30DaysIncome) * 100
          )
        : 0;

    const last60DaysAgo = new Date(now);
    last60DaysAgo.setDate(now.getDate() - 60);

    const previous30DaysTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return date >= last60DaysAgo && date < thirtyDaysAgo;
    });

    const previous30DaysExpenses = previous30DaysTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenseChange =
      previous30DaysExpenses > 0
        ? Math.round(
            ((last30DaysExpenses - previous30DaysExpenses) /
              previous30DaysExpenses) *
              100
          )
        : 0;

    return {
      totalTransactions: transactions.length,
      last30DaysIncome,
      last30DaysExpenses,
      last30DaysSavings: last30DaysIncome - last30DaysExpenses,
      allTimeIncome,
      allTimeExpenses,
      allTimeSavings: allTimeIncome - allTimeExpenses,
      last30DaysCount: last30DaysTransactions.length,
      savingsRate,
      expenseChange,
    };
  }, [transactions]);

  const timeFrameLabel = useMemo(
    () =>
      timeFrame === "daily"
        ? "Today"
        : timeFrame === "weekly"
        ? "This Week"
        : "This Month",
    [timeFrame]
  );

  const outletContext = {
    // transactions: filteredTransactions,
    transactions: transactions,
    addTransaction,
    editTransaction,
    deleteTransaction,
    refreshTransactions: fetchTransactions,
    timeFrame,
    setTimeFrame,
    lastUpdated,
  };

  const getSavingsRating = (rate) =>
    rate > 30 ? "Excellent" : rate > 20 ? "Good" : "Needs improvement";

  const topCategories = useMemo(
    () =>
      Object.entries(
        transactions
          .filter((t) => t.type === "expense")
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + Number(t.amount);
            return acc;
          }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    [transactions]
  );

  const displayedTransactions = showAllTransactions
    ? transactions
    : transactions.slice(0, 4);
    // filtering transaction ending here

  // return (
  //   <div>
  //     {/* Navbar */}
  //     <Navbar user={user} onLogout={onLogout} />

  //     {/* Sidebar */}
  //     <Sidebar 
  //       user={user} 
  //       sidebarcollapsed={sidebarcollapsed} 
  //       setSidebarCollapsed={setSidebarCollapsed}
  //     />

  //     {/* Main Content (IMPORTANT FIX) */}
  //     <div className={` mt-16 transition-all duration-300
  //         ${sidebarcollapsed ? "md:ml-20" : "md:ml-60"} p-4`}>
  //       <div>
  //         <div>
  //           <h1 className=''>Dashboard</h1>
  //            <p>Welcome Back</p>
  //         </div>
  //       </div>
  //        <div>
  //         <div>
  //           <div>
  //             <div>
  //               <p> Total Balance Here</p>
  //               <p>{stats.allTimeSavings.toLocaleString("en-US",{
  //                 maximumFractionDigits:2,
  //               })}</p>
  //             </div>
  //             <div>
  //               <DollarSign/>
  //             </div>
  //           </div>
  //           <p>
  //             <span className='text-teal-600 font-medium'>
  //               +${stats.last30DaysSavings.toLocaleString()}
  //             </span>{" "}
  //             this month
  //           </p>
  //         </div>

  //         {/* for income over hear */}
  //         <div>
  //           <div>
  //             <div>
  //               <p>Monthly Income</p>
  //               <p>{stats.last30DaysIncome.toLocaleString("en-US",{
  //                 maximumFractionDigits:2,
  //               })}</p>
  //             </div>
  //             <div>
  //               <ArrowUp/>
  //             </div>
  //           </div>
  //           <p>
  //             <span className='text-green-600 font-medium'>
  //               +12.5%
  //             </span>{" "}
  //             last month
  //           </p>
  //         </div>

  //         {/*  */}
  //         <div>
  //           <div>
  //             <div>
  //               <p>Monthly Expense</p>
  //               <p>{stats.last30DaysExpenses.toLocaleString("en-US",{
  //                 maximumFractionDigits:2,
  //               })}</p>
  //             </div>
  //             <div>
  //               <ArrowDown/>
  //             </div>
  //           </div>
  //           <p>
  //           <span >
  //             {stats.expenseChange >0 ? "+" : ""}
  //             {stats.expenseChange}%
  //           </span>{" "}
  //           from last month
  //           </p>
  //         </div>

  //         {/*  */}
  //         <div>
  //           <div>
  //             <div>
  //               <p>Saving Rate</p>
  //               <p>
  //                 {stats.savingsRate}%
  //               </p>
  //             </div>
  //             <div>
  //               <PiggyBank/>
  //             </div>
  //           </div>
  //           <p>
  //             {getSavingsRating(stats.savingsRate)}
  //           </p>
  //         </div>
  //        </div>

  //        <div>
  //         <div>
  //           <div>
  //             <div>
  //               <h3>
  //                 <TrendingUp className='w-6 h-6 text-teal-500'/>
  //                 Financial Overview
  //                 <span className='text-sm text-gray-500 font-normal'>
  //                    ({timeFrameLabel})
  //                 </span>
  //               </h3>
  //             </div>
  //             <Outlet context={outletContext}/> 
  //           </div>
  //         </div>

  //         {/* right side */}
  //         <div>
  //            <div>
  //              <div>
  //                 <h3>
  //                   <Clock className='w-6 h-6 text-purple-500'/>
  //                   Recent Transactions
  //                 </h3>
  //                 <button onClick={fetchTransactions} disabled={loading}>
  //                   <RefreshCcw/>
  //                 </button>
  //              </div>

  //              <div>
  //               <Info/>
  //               <span>Transaction are stacked by date (newest first)</span>
  //              </div>

  //              <div>
  //               {
  //                 displayedTransactions.map((transactions)=>{
  //                  const {id,type,category,description,date,amount}=transactions 
  //                  return(
  //                   <div key={id}>
  //                     <div className='flex items-center gap-1 md:gap-4 lg:gap-3'>
  //                        <div className={`p-2 rounded-lg ${ type === "income"?"bg-green-100 text-green-700":"bg-red-100 text-red-700"}`}>
  //                           {
  //                             CATEGORY_ICONS[category] || (
  //                               <DollarSign className='p-2 rounded-lg bg-orange-100 text-orange-600'/>
  //                             )
  //                           }
  //                        </div>
  //                        <div>
  //                         <p>{description}</p>
  //                         <p>{new Date(date).toLocaleString()}
  //                           <span className='ml-2 capitalize'>
  //                             {category}
  //                           </span>
  //                         </p>
  //                        </div>
  //                     </div>

  //                     <span className={type === "income" ? "text-green-600" : "text-red-600"}>
  //                       {type==="income" ? "+" :"-" } ${Number(amount)}
  //                     </span>
  //                   </div>
  //                  )
  //                 })}

  //                 {transactions.length ===0 ? (
  //                   <div>
  //                     <div>
  //                       <Clock/>
  //                     </div>
  //                     <p>
  //                       No recent transactions
  //                     </p>
  //                   </div>
  //                 ) : (
  //                   <div>
  //                     <button onClick={()=>setShowAllTransactions(!showAllTransactions)}>
  //                       {showAllTransactions ? (
  //                         <>
  //                         <ChevronUp className='w-5 h-5'/>
  //                         Show Less
  //                         </>
  //                       ) : (
  //                         <>
  //                         <ChevronDown className='w-5 h-5'/>
  //                         View All Transactions ({transactions.length})
  //                         </>
  //                       )}
  //                     </button>
  //                   </div>
  //                 )}
  //              </div>
  //            </div>


  //            {/* spending by category card */}
  //            <div>
  //             <h3>
  //               <PieChart/>
  //               Spending by Category
  //             </h3>
  //             <div>
  //               {
  //                 topCategories.map(([category,amount])=>{
  //                   <div key={category}>
  //                     <div className='flex items-center gap-3'>
  //                         <div>
  //                           {
  //                             CATEGORY_ICONS[category] || (
  //                               <DollarSign/>
  //                             )
  //                           }
  //                         </div>
  //                         <span className=''>
  //                             {category}
  //                         </span>
  //                     </div>
  //                     <span>
  //                       ${amount}
  //                     </span>
  //                   </div>
  //                 })}
  //             </div>

  //             <div>
  //               <div>
  //                 <div>
  //                   <p>
  //                     Total Income
  //                   </p>
  //                   <p>${stats.allTimeIncome.toLocaleString()}</p>
  //                 </div>

  //                   <div>
  //                   <p>
  //                     Total Expense
  //                   </p>
  //                   <p>${stats.allTimeExpenses.toLocaleString()}</p>
  //                 </div>
                  
  //               </div>
  //             </div>
  //            </div>
  //         </div>
  //        </div>
  //     </div>
  //   </div>
  // );


  return (
  <div className={styles.layout.root}>

    {/* Navbar */}
    <Navbar user={user} onLogout={onLogout} />

    {/* Sidebar */}
    <Sidebar
      user={user}
      sidebarcollapsed={sidebarcollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
    />

    {/* MAIN CONTENT */}
    <div className={styles.layout.mainContainer(sidebarcollapsed)}>

      {/* HEADER */}
      <div className={styles.header.container}>
        <div>
          <h1 className={styles.header.title}>Dashboard</h1>
          <p className={styles.header.subtitle}>Welcome Back</p>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className={styles.statCards.grid}>

        {/* Total Balance */}
        <div className={styles.statCards.card}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Total Balance</p>
              <p className={styles.statCards.cardValue}>
                ${stats.allTimeSavings.toLocaleString()}
              </p>
            </div>
            <div className={styles.statCards.iconContainer("teal")}>
              <DollarSign className={styles.statCards.icon("teal")} />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>
            <span className="text-teal-600 font-medium">
              +${stats.last30DaysSavings.toLocaleString()}
            </span>{" "}
            this month
          </p>
        </div>

        {/* Income */}
        <div className={styles.statCards.card}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Monthly Income</p>
              <p className={styles.statCards.cardValue}>
                ${stats.last30DaysIncome.toLocaleString()}
              </p>
            </div>
            <div className={styles.statCards.iconContainer("green")}>
              <ArrowUp className={styles.statCards.icon("green")} />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>
            <span className="text-green-600 font-medium">+12.5%</span> last month
          </p>
        </div>

        {/* Expense */}
        <div className={styles.statCards.card}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Monthly Expense</p>
              <p className={styles.statCards.cardValue}>
                ${stats.last30DaysExpenses.toLocaleString()}
              </p>
            </div>
            <div className={styles.statCards.iconContainer("orange")}>
              <ArrowDown className={styles.statCards.icon("orange")} />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>
            <span className={styles.colors.expenseChange(stats.expenseChange)}>
              {stats.expenseChange > 0 ? "+" : ""}
              {stats.expenseChange}%
            </span>{" "}
            from last month
          </p>
        </div>

        {/* Saving Rate */}
        <div className={styles.statCards.card}>
          <div className={styles.statCards.cardHeader}>
            <div>
              <p className={styles.statCards.cardTitle}>Saving Rate</p>
              <p className={styles.statCards.cardValue}>
                {stats.savingsRate}%
              </p>
            </div>
            <div className={styles.statCards.iconContainer("cyan")}>
              <PiggyBank className={styles.statCards.icon("cyan")} />
            </div>
          </div>
          <p className={styles.statCards.cardFooter}>
            {getSavingsRating(stats.savingsRate)}
          </p>
        </div>

      </div>

      {/* MAIN GRID */}
      <div className={styles.grid.main}>

        {/* LEFT */}
        <div className={styles.grid.leftColumn}>

          <div className={styles.cards.base}>
            <div className={styles.cards.header}>
              <h3 className={styles.cards.title}>
                <TrendingUp className="text-teal-500" />
                Financial Overview
              </h3>
            </div>

            <Outlet context={outletContext} />
          </div>

        </div>

        {/* RIGHT */}
        <div className={styles.grid.rightColumn}>

          {/* Recent Transactions */}
          <div className={styles.cards.base}>
            <div className={styles.transactions.cardHeader}>
              <h3 className={styles.transactions.cardTitle}>
                <Clock /> Recent Transactions
              </h3>

              <button onClick={fetchTransactions}>
                <RefreshCcw />
              </button>
            </div>

            <div className={styles.transactions.listContainer}>
              {displayedTransactions.map((t) => (
                <div key={t.id} className={styles.transactions.transactionItem}>
                  <div className="flex items-center gap-3">
                    <div className={styles.transactions.iconWrapper(t.type)}>
                      {CATEGORY_ICONS[t.category] || <DollarSign />}
                    </div>

                    <div>
                      <p className={styles.transactions.description}>
                        {t.description}
                      </p>
                      <p className={styles.transactions.meta}>
                        {new Date(t.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <span className={styles.transactions.amount(t.type)}>
                    {t.type === "income" ? "+" : "-"}${t.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
};

export default Layout;

