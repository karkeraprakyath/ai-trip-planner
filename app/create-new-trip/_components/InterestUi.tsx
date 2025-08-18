"use client";
import React, { useState } from "react";

const INTEREST_OPTIONS = [
  "History",
  "Culture",
  "Food",
  "Nature",
  "Beach",
  "Adventure",
  "Nightlife",
  "Shopping",
  "Art",
  "Photography",
];

export default function InterestUi({
  onSelectedOption,
}: {
  onSelectedOption: (value: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  const confirm = () => {
    const value = Array.from(selected).join(", ");
    if (value) onSelectedOption(value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((label) => {
          const isActive = selected.has(label);
          return (
            <button
              key={label}
              type="button"
              onClick={() => toggle(label)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card hover:border-primary"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <button
          onClick={confirm}
          disabled={selected.size === 0}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}


