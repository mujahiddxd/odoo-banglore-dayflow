'use client';

import React from 'react';
import type { TimeOffAllocation } from '@/lib/types';

interface TimeOffBalanceCardsProps {
  allocations: TimeOffAllocation[];
  loading?: boolean;
}

const TYPE_STYLES: Record<string, { emoji: string; bg: string; accent: string }> = {
  'Paid Time Off': { emoji: '🏖️', bg: 'rgba(97,196,216,0.12)', accent: 'var(--uxsg-teal)' },
  'Sick Time Off': { emoji: '🏥', bg: 'rgba(252,221,42,0.15)', accent: 'var(--uxsg-yellow)' },
  'Unpaid Leave': { emoji: '📋', bg: 'rgba(9,9,7,0.05)', accent: 'var(--uxsg-ink)' },
};

function getStyle(typeName: string) {
  return TYPE_STYLES[typeName] ?? { emoji: '📅', bg: 'rgba(9,9,7,0.05)', accent: 'var(--uxsg-ink)' };
}

export default function TimeOffBalanceCards({ allocations, loading }: TimeOffBalanceCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2].map((i) => (
          <div key={i} className="sketchy-card p-6 animate-pulse" style={{ minHeight: '120px' }}>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="sketchy-card p-6 mb-6 text-center">
        <p className="font-body text-sm text-gray-500">No leave allocations found for this year.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 stagger-children">
      {allocations.map((alloc) => {
        const style = getStyle(alloc.timeOffTypeName);
        return (
          <div
            key={alloc.id}
            className="sketchy-card p-5 relative overflow-hidden"
            style={{ background: style.bg }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wide opacity-60">
                  {alloc.timeOffTypeName}
                </p>
              </div>
              <span className="text-2xl">{style.emoji}</span>
            </div>

            <div className="flex items-baseline gap-1 mb-3">
              <span
                className="font-headline text-4xl font-bold"
                style={{ color: style.accent }}
              >
                {alloc.remainingDays}
              </span>
              <span className="font-body text-sm opacity-60">Days Available</span>
            </div>

            <div className="flex gap-4 font-body text-xs opacity-70">
              <div>
                <span className="font-semibold">{alloc.allocatedDays}</span> Allocated
              </div>
              <div>
                <span className="font-semibold">{alloc.usedDays}</span> Used
              </div>
              {alloc.pendingDays > 0 && (
                <div>
                  <span className="font-semibold">{alloc.pendingDays}</span> Pending
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
