import React from 'react'

const FinancialCard = ({
  icon,
  label,
  value,
  additionalContent,
  borderColor = "",
  bgColor = "bg-white"
}) => (
  <div className={`${bgColor} rounded-xl p-5 lg:-mx-2 lg:p-2 shadow-sm
  border hover:shadow-md border-gray-100 transition-all ${borderColor}`}>

    {/* Header */}
    <div className='text-sm font-medium text-gray-600 flex items-center gap-2'>
      {icon}
      {label}
    </div>

    {/* Main Value */}
    <p className='text-2xl font-bold text-gray-800 mt-1'>
      {value}
    </p>

    {/* Additional Content */}
    <div>
      {additionalContent}
    </div>

  </div>
)

export default FinancialCard
