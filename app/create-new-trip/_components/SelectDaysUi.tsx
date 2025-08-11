"use client";
import React, { useState } from "react";

interface SelectDaysUiProps {
  onSelectedOption: (days: number) => void;
  minDays?: number;
  maxDays?: number;
}

const SelectDaysUi: React.FC<SelectDaysUiProps> = ({
  onSelectedOption,
  minDays = 1,
  maxDays = 30,
}) => {
  const [days, setDays] = useState<number>(4);

  // 🔽 Helper functions
  const handleDecrease = () => setDays((prev) => Math.max(minDays, prev - 1));
  const handleIncrease = () => setDays((prev) => Math.min(maxDays, prev + 1));
  const handleConfirm = () => onSelectedOption(days);

  return (
    <div className="flex flex-col items-center bg-white rounded-2xl p-6 mt-4 shadow-lg transition-all hover:shadow-xl">
      {/* Heading */}
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-800">
        🗓 How many days do you want to travel?
      </h2>

      {/* Counter */}
      <div className="flex items-center gap-6 mb-4">
        <button
          className={`rounded-full bg-gray-100 text-purple-500 w-12 h-12 text-2xl flex items-center justify-center transition-all active:scale-90 ${
            days === minDays ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
          onClick={handleDecrease}
          disabled={days === minDays}
        >
          –
        </button>

        <span className="text-2xl font-bold text-gray-900 select-none">
          {days} {days === 1 ? "Day" : "Days"}
        </span>

        <button
          className={`rounded-full bg-gray-100 text-purple-500 w-12 h-12 text-2xl flex items-center justify-center transition-all active:scale-90 ${
            days === maxDays ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
          }`}
          onClick={handleIncrease}
          disabled={days === maxDays}
        >
          +
        </button>
      </div>

      {/* Confirm Button */}
      <button
        className="bg-primary text-white px-6 py-2 rounded-lg font-semibold transition-all active:scale-95 hover:bg-primary/90"
        onClick={handleConfirm}
      >
        ✅ Confirm
      </button>
    </div>
  );
};

export default SelectDaysUi;
