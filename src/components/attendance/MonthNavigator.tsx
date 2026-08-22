'use client';

import React from 'react';

interface MonthNavigatorProps {
  year: number;
  month: number; // 1-indexed
  onNavigate: (year: number, month: number) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function MonthNavigator({ year, month, onNavigate }: MonthNavigatorProps) {
  const handlePrev = () => {
    if (month === 1) {
      onNavigate(year - 1, 12);
    } else {
      onNavigate(year, month - 1);
    }
  };

  const handleNext = () => {
    if (month === 12) {
      onNavigate(year + 1, 1);
    } else {
      onNavigate(year, month + 1);
    }
  };

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const isFuture = year > now.getFullYear() || (year === now.getFullYear() && month > now.getMonth() + 1);

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <button
        onClick={handlePrev}
        className="sketchy-btn sketchy-btn-secondary text-sm px-4 py-2"
      >
        ← Previous
      </button>

      <div className="text-center">
        <h2 className="font-headline text-xl font-bold text-[var(--uxsg-ink)]">
          {MONTH_NAMES[month - 1]} {year}
        </h2>
        {isCurrentMonth && (
          <span className="sketchy-badge sketchy-badge-yellow text-xs mt-1 inline-block">
            Current Month
          </span>
        )}
      </div>

      <button
        onClick={handleNext}
        disabled={isFuture}
        className="sketchy-btn sketchy-btn-secondary text-sm px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </div>
  );
}
