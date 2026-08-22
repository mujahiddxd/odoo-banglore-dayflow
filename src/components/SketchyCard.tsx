'use client';

import React from 'react';

interface SketchyCardProps {
  children: React.ReactNode;
  dark?: boolean;
  tape?: boolean;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function SketchyCard({
  children,
  dark = false,
  tape = false,
  className = '',
  onClick,
  hoverable = false,
}: SketchyCardProps) {
  return (
    <div
      className={`
        relative
        ${dark ? 'sketchy-card-dark' : 'sketchy-card'}
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {tape && (
        <>
          <div className="tape-corner tape-corner-tl" />
          <div className="tape-corner tape-corner-br" />
        </>
      )}
      {children}
    </div>
  );
}
