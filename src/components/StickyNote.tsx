'use client';

import React from 'react';

interface StickyNoteProps {
  children: React.ReactNode;
  color?: 'blue' | 'yellow';
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function StickyNote({
  children,
  color = 'yellow',
  title,
  className = '',
  style,
}: StickyNoteProps) {
  return (
    <div
      style={style}
      className={`
        sticky-note
        ${color === 'blue' ? 'sticky-note-blue' : 'sticky-note-yellow'}
        ${className}
      `}
    >
      {title && (
        <h4 className="font-headline text-lg font-bold mb-2 text-center wavy-underline pb-1">
          {title}
        </h4>
      )}
      <div className="font-handwritten text-[var(--uxsg-ink)]">
        {children}
      </div>
    </div>
  );
}
