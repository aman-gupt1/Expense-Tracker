<div align="center">
  <img src="screenshot/dashboard.png" alt="ExpenseTracker Dashboard Preview" width="100%" />

  # 💳 ExpenseTracker
  ### Modern Full-Stack MERN Personal Finance & Expense Analytics Platform

  <p align="center">
    <strong>Gain full clarity, control, and intelligence over your financial life.</strong>
  </p>
</div>

---

## 🎯 Project Goal

**ExpenseTracker** is a modern, full-stack financial management platform designed to eliminate financial ambiguity and replace complex, manual spreadsheets. 

The primary goals of the project are:
- **Financial Clarity**: Provide real-time, visual tracking of all incoming revenue streams and outgoing expenses.
- **Actionable Analytics**: Deliver deep insights into spending habits, hourly/daily cash velocities, and category breakdowns with zero friction.
- **Budget Discipline**: Empower users to set monthly spending limits and monitor budget health with automated visual warnings before limits are exceeded.
- **Universal Accessibility**: Support multi-currency tracking (USD, INR, EUR, GBP) and guest sandbox exploration so anyone can organize their finances instantly.

---

## ✨ Key Features

### 📊 1. Executive Analytics Dashboard
- **Dynamic Metric Cards**: Real-time KPI summaries for Total Income, Total Expenses, Net Surplus, and Monthly Budget utilization.
- **Interactive Donut Chart with Center HUD**: Hover over category slices to reveal real-time spending amounts and percentage contributions directly in the center readout.
- **Radial Target Gauges**: Left-to-right balanced visual gauges tracking Income, Spending, and Savings against target thresholds.
- **Recent Activity Stream**: Live feed of the latest inflows and outflows with segmented tabs (`All`, `Income`, `Expense`) and instant keyword search.

### 📅 2. Smart Timeframe & Custom Calendar Filtering
- **Timeframe Presets**: Switch instantly between **Daily**, **Weekly**, **Monthly**, and **Yearly** views.
- **Particular Date Inspection**: Choose any individual date via a custom-styled, interactive calendar popover (with month/year navigation, today indicator, and quick reset).
- **Single-Day Hourly Velocity**: Dynamically plots 24 hourly buckets (`12 AM` to `11 PM`) when a specific day is selected.

### 💰 3. Income & Expense Hubs
- **Categorized Tracking**: Pre-configured categories with distinct icon badges (Salary, Freelance, Investments, Food, Housing, Transport, Utilities, etc.).
- **Interactive Records Table**: Filtered data presentation with styled header and footer surfaces.
- **Smart Pagination**: Full-featured pagination footer with rows-per-page selector (defaulting to 5 rows) and page jump navigation.
- **Inline Editing & Quick Add**: Seamless modal and inline editing with instant toast notifications.
- **Excel Export**: One-click spreadsheet export (`.xlsx`) for accounting and offline reporting.

### 🌐 4. Multi-Currency Global Engine
- One-click global currency switcher in the top navigation bar supporting:
  - **US Dollar ($)**
  - **Indian Rupee (₹)**
  - **Euro (€)**
  - **British Pound (£)**
- Instantly updates all formatted values, charts, and metrics across the application without reloading.

### 🔐 5. Security & Guest Sandbox
- **JWT & Session Security**: Robust token-based authentication with bcrypt password encryption.
- **Guest Sandbox Mode**: Explore the full dashboard, charts, and test features with dummy data without creating an account.
- **Profile Hub**: Manage profile details, change passwords with real-time strength evaluation, and view session telemetry.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 | Modern, component-based user interface |
| **Styling & Design** | Tailwind CSS | Utility-first responsive SaaS design system |
| **Motion & Animations**| Framer Motion | Fluid spring transitions, modal popovers, and list animations |
| **Data Visualization** | Recharts | Donut charts, area charts, bar graphs, and radial gauges |
| **Icons** | Lucide React | Clean, consistent SVG iconography |
| **Notifications** | React Toastify | Low-profile, top-center action feedback alerts |
| **HTTP Client** | Axios | RESTful API requests and token interception |
| **Backend Runtime** | Node.js | Fast, scalable server environment |
| **Web Framework** | Express.js | Modular REST API routing and middleware |
| **Database** | MongoDB | Document-oriented NoSQL database |
| **ODM** | Mongoose | Strict schema validation and database modeling |
| **Authentication** | JWT & bcryptjs | Secure stateless authentication & password hashing |
| **Data Export** | ExcelJS & XLSX | Client-side spreadsheet report generation |
| **Build Tool** | Vite | Lightning-fast development server and optimized bundler |

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (Local community edition or MongoDB Atlas URI)

---

### 1. Backend Setup

1. Open your terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in a `.env` file inside `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   *The API will run on `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in a `.env` file inside `frontend/`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The application will launch at `http://localhost:5173`.*

---

## 💡 Usage Highlights

- **Guest Sandbox**: Click **"Continue to Dashboard"** on the login page to immediately test features with preloaded transactions.
- **Pick Date**: Click **"Pick Date"** in the top header card on any page to open the custom calendar popover and inspect records for that exact date.
- **Customize Page Rows**: Use the **Rows** dropdown in the table footer to switch between 5, 8, 15, or 25 records per page.
- **Export Data**: Click **Export** on the Income or Expense pages to generate a formatted `.xlsx` spreadsheet.
