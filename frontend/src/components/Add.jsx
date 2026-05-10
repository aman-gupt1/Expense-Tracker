import React from 'react'
import { X } from "lucide-react";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Salary", "Freelance", "Investments","Bonus" , "Other"],
  color = "teal"
}) => {

  if (!showModal) return null;

  // Get current date in YYYY-MM-DD format
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split('T')[0];
  const minDate = `${currentYear}-01-01`;

  const colorClass = "";

  // return (
  //   <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
  //     <div className="bg-white p-6 rounded-lg w-[400px]">
  //       <div>
  //           <h3>
  //               {title}
  //           </h3>
  //           <button onClick={()=>setShowModal(false)}>
  //               <X size={24} />
  //           </button>
  //       </div>
  //       <form onSubmit={(e)=>{
  //           e.preventDefault();
  //           handleAddTransaction();
  //       }}>
  //          <div>
  //           <div>
  //               <label>Description</label>
  //               <input type="text"
  //               value={newTransaction.description} 
  //               onChange={(e)=>
  //                   setNewTransaction((prev)=>({
  //                       ...prev, description:e.target.value
  //                   }))
  //               } placeholder={type==="both" ? "Salary, Funds, etc.":"Groceries, Rent, etc."} 
  //               required/>
  //           </div>

  //           <div>
  //               <label >Amount</label>
  //               <input type="number"
  //               value={newTransaction.amount} 
  //               onChange={(e)=>
  //                   setNewTransaction((prev)=>({
  //                       ...prev, amount:e.target.value
  //                   }))
  //               } placeholder="0.00"
  //               required/>
  //           </div>

  //          {type === "both" && (
  //             <div>
  //               <label >Type</label>
  //               <div >
  //                 <button 
  //                   type="button"
  //                   // className={modalStyles.typeButton(
  //                   //   newTransaction.type === 'income', 
  //                   //   modalStyles.colorClasses.teal.typeButtonSelected
  //                   // )}
  //                   onClick={() => setNewTransaction(prev => ({...prev, type: 'income'}))}
  //                 >
  //                   Income
  //                 </button>
  //                 <button 
  //                   type="button"
  //                   // className={modalStyles.typeButton(
  //                   //   newTransaction.type === 'expense', 
  //                   //   modalStyles.colorClasses.orange.typeButtonSelected
  //                   // )}
  //                   onClick={() => setNewTransaction(prev => ({...prev, type: 'expense'}))}
  //                 >
  //                   Expense
  //                 </button>
  //               </div>
  //             </div>
  //           )}
  //           <div>
  //              <label htmlFor="">Category</label> 
  //              <select value={newTransaction.category}
  //             onChange={(e)=>
  //               setNewTransaction((prev)=>({
  //                   ...prev,
  //                   category:e.target.value
  //               }))
  //             } >
  //                {
  //                   categories.map((cat)=>(
  //                       <option value={cat} key={cat}>
  //                           {cat}
  //                       </option>
  //                   ))
  //                }
  //             </select>
  //           </div>
  //           <div>
  //              <label htmlFor="">Date</label>
  //              <input type="date" value={newTransaction.date} onChange={(e)=>{
  //               setNewTransaction((prev)=>({
  //                   ...prev,
  //                   date:e.target.value
  //               }))
  //              }} min={minDate} max={currentDate} required/> 
  //           </div>
  //           <button type='submit'>
  //              {buttonText}
  //           </button>
  //           </div> 
  //       </form>
  //     </div>
  //   </div>
  // )


  return (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 px-4">
    
    {/* Modal Container */}
    <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-5 sm:p-6">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
          {title}
        </h3>
        <button
          onClick={() => setShowModal(false)}
          className="p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X size={22} className="text-gray-600" />
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAddTransaction();
        }}
        className="space-y-4"
      >
        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Description
          </label>
          <input
            type="text"
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder={
              type === "both"
                ? "Salary, Funds, etc."
                : "Groceries, Rent, etc."
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={newTransaction.amount}
            onChange={(e) =>
              setNewTransaction((prev) => ({
                ...prev,
                amount: e.target.value,
              }))
            }
            placeholder="0.00"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Type */}
        {type === "both" && (
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    type: "income",
                  }))
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  newTransaction.type === "income"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Income
              </button>

              <button
                type="button"
                onClick={() =>
                  setNewTransaction((prev) => ({
                    ...prev,
                    type: "expense",
                  }))
                }
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                  newTransaction.type === "expense"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Expense
              </button>
            </div>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Category
          </label>
          <select
            value={newTransaction.category}
            onChange={(e) =>
              setNewTransaction((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            {categories.map((cat) => (
              <option value={cat} key={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Date
          </label>
          <input
            type="date"
            value={newTransaction.date}
            onChange={(e) => {
              setNewTransaction((prev) => ({
                ...prev,
                date: e.target.value,
              }));
            }}
            min={minDate}
            max={currentDate}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition"
        >
          {buttonText}
        </button>
      </form>
    </div>
  </div>
);

}


export default AddTransactionModal


// this file is styling
