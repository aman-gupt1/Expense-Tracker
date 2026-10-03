// Dummy data for Guest / Demo mode without external dependencies (no uuid dependency)

const generateId = (prefix = "demo") =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

// Generate relative date string YYYY-MM-DD
const getRelativeDate = (daysAgo, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 59), 0, 0);
  return d.toISOString();
};

export const dummyUser = {
  name: "Guest User",
  email: "guest@example.com",
  isGuest: true,
  createdAt: new Date().toISOString(),
};

export const dummyBudget = {
  monthlyBudget: 4500,
  spent: 2850,
  remaining: 1650,
  savingsGoal: 1500,
  savingsCurrent: 1650,
};

// Realistic mock transactions for all timeframe views (Today, This Week, This Month, This Year)
export const dummyTransactions = [
  // Today's transactions
  {
    id: "demo_tx_1",
    type: "expense",
    amount: 14.50,
    description: "Starbucks Morning Coffee",
    category: "Food",
    date: getRelativeDate(0, 9),
  },
  {
    id: "demo_tx_2",
    type: "income",
    amount: 250.00,
    description: "Freelance Bug Fix",
    category: "Freelance",
    date: getRelativeDate(0, 11),
  },
  {
    id: "demo_tx_3",
    type: "expense",
    amount: 32.00,
    description: "Uber Ride Downtown",
    category: "Transport",
    date: getRelativeDate(0, 14),
  },

  // This Week's transactions
  {
    id: "demo_tx_4",
    type: "expense",
    amount: 88.75,
    description: "Whole Foods Grocery",
    category: "Food",
    date: getRelativeDate(1, 17),
  },
  {
    id: "demo_tx_5",
    type: "expense",
    amount: 45.00,
    description: "Gas Station Fuel",
    category: "Transport",
    date: getRelativeDate(2, 10),
  },
  {
    id: "demo_tx_6",
    type: "income",
    amount: 750.00,
    description: "Client Website Design",
    category: "Freelance",
    date: getRelativeDate(2, 16),
  },
  {
    id: "demo_tx_7",
    type: "expense",
    amount: 119.99,
    description: "Running Shoes & Gear",
    category: "Shopping",
    date: getRelativeDate(3, 14),
  },
  {
    id: "demo_tx_8",
    type: "expense",
    amount: 65.00,
    description: "Dinner at Italian Bistro",
    category: "Entertainment",
    date: getRelativeDate(4, 20),
  },
  {
    id: "demo_tx_9",
    type: "expense",
    amount: 24.99,
    description: "Netflix & Spotify Subscription",
    category: "Entertainment",
    date: getRelativeDate(5, 8),
  },

  // This Month's transactions
  {
    id: "demo_tx_10",
    type: "income",
    amount: 4200.00,
    description: "Monthly Tech Salary",
    category: "Salary",
    date: getRelativeDate(6, 9),
  },
  {
    id: "demo_tx_11",
    type: "expense",
    amount: 1350.00,
    description: "Monthly Apartment Rent",
    category: "Housing",
    date: getRelativeDate(7, 10),
  },
  {
    id: "demo_tx_12",
    type: "expense",
    amount: 145.50,
    description: "Electricity & Water Bill",
    category: "Utilities",
    date: getRelativeDate(9, 12),
  },
  {
    id: "demo_tx_13",
    type: "expense",
    amount: 60.00,
    description: "Gym Monthly Membership",
    category: "Healthcare",
    date: getRelativeDate(11, 7),
  },
  {
    id: "demo_tx_14",
    type: "income",
    amount: 320.00,
    description: "Stock Dividend Yield",
    category: "Investment",
    date: getRelativeDate(13, 15),
  },
  {
    id: "demo_tx_15",
    type: "expense",
    amount: 185.20,
    description: "Costco Bulk Shopping",
    category: "Food",
    date: getRelativeDate(15, 11),
  },
  {
    id: "demo_tx_16",
    type: "expense",
    amount: 42.00,
    description: "Pharmacy Medication",
    category: "Healthcare",
    date: getRelativeDate(17, 16),
  },
  {
    id: "demo_tx_17",
    type: "expense",
    amount: 79.99,
    description: "Home Internet Fiber",
    category: "Utilities",
    date: getRelativeDate(19, 13),
  },
  {
    id: "demo_tx_18",
    type: "income",
    amount: 500.00,
    description: "Quarterly Performance Bonus",
    category: "Bonus",
    date: getRelativeDate(21, 10),
  },
  {
    id: "demo_tx_19",
    type: "expense",
    amount: 130.00,
    description: "Concert Weekend Tickets",
    category: "Entertainment",
    date: getRelativeDate(23, 19),
  },
  {
    id: "demo_tx_20",
    type: "expense",
    amount: 95.00,
    description: "Car Maintenance & Oil Check",
    category: "Transport",
    date: getRelativeDate(25, 14),
  },
  {
    id: "demo_tx_21",
    type: "income",
    amount: 450.00,
    description: "Technical Consulting Call",
    category: "Freelance",
    date: getRelativeDate(27, 11),
  },

  // Last Month / Previous range transactions for comparison
  {
    id: "demo_tx_22",
    type: "income",
    amount: 4200.00,
    description: "Previous Month Salary",
    category: "Salary",
    date: getRelativeDate(35, 9),
  },
  {
    id: "demo_tx_23",
    type: "expense",
    amount: 1350.00,
    description: "Apartment Rent - Prev Month",
    category: "Housing",
    date: getRelativeDate(36, 10),
  },
  {
    id: "demo_tx_24",
    type: "expense",
    amount: 420.00,
    description: "Groceries - Prev Month",
    category: "Food",
    date: getRelativeDate(40, 15),
  },
  {
    id: "demo_tx_25",
    type: "income",
    amount: 600.00,
    description: "Freelance Project - Prev Month",
    category: "Freelance",
    date: getRelativeDate(45, 12),
  },
];

// Gauge Data for Overview
export const dummyGaugeData = [
  {
    name: "Income",
    value: 6470,
    max: 8000,
  },
  {
    name: "Spent",
    value: 2850,
    max: 5000,
  },
  {
    name: "Savings",
    value: 3620,
    max: 5000,
  },
];

// Pre-computed distribution for fallback / overview
export const dummyExpenseDistribution = [
  { name: "Housing", value: 1350 },
  { name: "Food", value: 488.45 },
  { name: "Transport", value: 217.00 },
  { name: "Entertainment", value: 219.98 },
  { name: "Utilities", value: 225.49 },
  { name: "Shopping", value: 119.99 },
  { name: "Healthcare", value: 102.00 },
];

export const COLORS = [
  "#00C49F",
  "#FF8042",
  "#0088FE",
  "#FFBB28",
  "#AF19FF",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];