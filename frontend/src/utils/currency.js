export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "INR", symbol: "₹", label: "INR (₹)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
];

export const formatCurrency = (amount, symbol = "$") => {
  const num = Number(amount) || 0;
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};
