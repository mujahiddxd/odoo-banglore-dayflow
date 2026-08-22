'use client';

import React from 'react';

interface SummaryData {
  daysPresent: number;
  workingDays: number;
  absentDays: number;
  approvedLeave: number;
  totalWorkingMinutes: number;
  totalExtraMinutes: number;
  paidLeaveDays?: number;
  unpaidLeaveDays?: number;
  payableDays?: number;
}

interface AttendanceSummaryProps {
  summary: SummaryData;
  loading?: boolean;
}

function formatHoursMinutes(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

export default function AttendanceSummary({ summary, loading }: AttendanceSummaryProps) {
  const cards = [
    {
      label: 'Days Present',
      value: summary.daysPresent,
      color: 'var(--status-present)',
      bg: 'rgba(34, 197, 94, 0.1)',
    },
    {
      label: 'Working Days',
      value: summary.workingDays,
      color: 'var(--uxsg-ink)',
      bg: 'rgba(9, 9, 7, 0.05)',
    },
    {
      label: 'Absent Days',
      value: summary.absentDays,
      color: 'var(--status-absent)',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      label: 'Approved Leave',
      value: summary.approvedLeave,
      color: 'var(--status-leave)',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
    {
      label: 'Total Working Hours',
      value: formatHoursMinutes(summary.totalWorkingMinutes),
      color: 'var(--uxsg-teal)',
      bg: 'rgba(97, 196, 216, 0.1)',
      isText: true,
    },
    {
      label: 'Extra Hours',
      value: formatHoursMinutes(summary.totalExtraMinutes),
      color: 'var(--uxsg-yellow)',
      bg: 'rgba(252, 221, 42, 0.15)',
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="sketchy-card p-4 text-center animate-pulse"
            style={{ minHeight: '80px' }}
          >
            <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto mb-3" />
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6 stagger-children">
      {cards.map((card) => (
        <div
          key={card.label}
          className="sketchy-card p-4 text-center"
          style={{ background: card.bg }}
        >
          <p className="font-body text-xs font-medium opacity-70 mb-1">
            {card.label}
          </p>
          <p
            className="font-headline text-2xl font-bold"
            style={{ color: card.color }}
          >
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
}
