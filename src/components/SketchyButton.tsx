'use client';

import React from 'react';

interface SketchyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta' | 'rsvp';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export default function SketchyButton({
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  ...props
}: SketchyButtonProps) {
  const variantClass = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    cta: 'btn-cta',
    rsvp: 'btn-rsvp',
  }[variant];

  return (
    <button
      className={`btn-sketchy ${variantClass} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
