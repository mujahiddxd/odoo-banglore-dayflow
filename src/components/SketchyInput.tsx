'use client';

import React, { useState } from 'react';

interface SketchyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  icon?: React.ReactNode;
}

export default function SketchyInput({
  label,
  error,
  showPasswordToggle = false,
  icon,
  className = '',
  type,
  ...props
}: SketchyInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
        {label} :-
      </label>
      <div className="relative">
        <input
          type={inputType}
          className={`sketchy-input ${icon ? 'pr-12' : ''} ${error ? 'border-[var(--status-absent)]' : ''}`}
          {...props}
        />
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-ink)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
        {icon && !showPasswordToggle && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      {error && (
        <span className="text-xs text-[var(--status-absent)] font-body mt-0.5">{error}</span>
      )}
    </div>
  );
}
