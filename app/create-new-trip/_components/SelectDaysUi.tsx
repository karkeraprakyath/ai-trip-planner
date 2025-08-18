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
    <div className="flex flex-col items-center rounded-2xl border bg-card p-5 mt-2 shadow-sm">
      <h2 className="text-sm font-medium mb-3 text-center">
        🗓 How many days do you want to travel?
      </h2>

      <div className="flex items-center gap-5 mb-3">
        <button
          className={`size-10 rounded-full bg-muted text-primary text-xl grid place-items-center transition active:scale-95 ${
            days === minDays ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"
          }`}
          onClick={handleDecrease}
          disabled={days === minDays}
        >
          –
        </button>

        <span className="text-xl font-semibold select-none">
          {days} {days === 1 ? "Day" : "Days"}
        </span>

        <button
          className={`size-10 rounded-full bg-muted text-primary text-xl grid place-items-center transition active:scale-95 ${
            days === maxDays ? "opacity-50 cursor-not-allowed" : "hover:bg-muted/80"
          }`}
          onClick={handleIncrease}
          disabled={days === maxDays}
        >
          +
        </button>
      </div>

      <button
        className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium transition hover:bg-primary/90"
        onClick={handleConfirm}
      >
        Confirm
      </button>
    </div>
  );
};

export default SelectDaysUi;
