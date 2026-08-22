'use client';

import React from 'react';
import type { AttendanceRecord } from '@/lib/types';

interface AttendanceTableProps {
  records: AttendanceRecord[];
  leaveDates?: { date: string; type: string; isPaid: boolean }[];
  loading?: boolean;
  showEmployee?: boolean;
  employeeNames?: Record<string, string>;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function formatTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatHM(minutes: number): string {
  if (minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function statusBadge(status: string, isLeave?: boolean, leaveType?: string) {
  if (isLeave) {
    return (
      <span className="sketchy-badge sketchy-badge-yellow text-xs">
        🏖️ {leaveType ?? 'On Leave'}
      </span>
    );
  }

  switch (status) {
    case 'CHECKED_OUT':
    case 'PRESENT':
      return (
        <span className="sketchy-badge sketchy-badge-teal text-xs">
          ✓ Present
        </span>
      );
    case 'CHECKED_IN':
      return (
        <span className="sketchy-badge sketchy-badge-yellow text-xs">
          ⏳ Working
        </span>
      );
    case 'ABSENT':
      return (
        <span className="sketchy-badge text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          ✕ Absent
        </span>
      );
    default:
      return (
        <span className="sketchy-badge text-xs opacity-50">
          — {status}
        </span>
      );
  }
}

export default function AttendanceTable({
  records,
  leaveDates = [],
  loading,
  showEmployee = false,
  employeeNames = {},
}: AttendanceTableProps) {
  if (loading) {
    return (
      <div className="sketchy-card p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  // Merge records with leave dates for a complete view
  const leaveDateMap = new Map(leaveDates.map((l) => [l.date, l]));

  // Create a combined set of all dates to display
  const allDates = new Set<string>();
  records.forEach((r) => allDates.add(r.date));
  leaveDates.forEach((l) => allDates.add(l.date));

  const sortedDates = Array.from(allDates).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="sketchy-card p-8 text-center">
        <p className="font-headline text-lg font-bold text-gray-400 mb-1">
          No Records
        </p>
        <p className="font-body text-sm text-gray-400">
          No attendance data for this period.
        </p>
      </div>
    );
  }

  return (
    <div className="sketchy-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b-2" style={{ borderColor: 'var(--uxsg-ink)' }}>
              <th className="py-3 px-4 font-bold">Date</th>
              <th className="py-3 px-4 font-bold">Day</th>
              {showEmployee && <th className="py-3 px-4 font-bold">Employee</th>}
              <th className="py-3 px-4 font-bold">Check In</th>
              <th className="py-3 px-4 font-bold">Check Out</th>
              <th className="py-3 px-4 font-bold">Working Hours</th>
              <th className="py-3 px-4 font-bold">Break</th>
              <th className="py-3 px-4 font-bold">Extra Hours</th>
              <th className="py-3 px-4 font-bold">Status</th>
            </tr>
          </thead>
          <tbody>
            {showEmployee ? (
              records.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-4">No records found.</td></tr>
              ) : (
                records.map((record, idx) => {
                  const date = new Date(record.date + 'T00:00:00');
                  const dayName = DAY_NAMES[date.getDay()];
                  return (
                    <tr
                      key={`${record.employeeId}-${record.date}-${idx}`}
                      className="border-b transition-colors hover:bg-[rgba(252,221,42,0.05)]"
                      style={{ borderColor: 'var(--uxsg-border-light)' }}
                    >
                      <td className="py-3 px-4 font-medium tabular-nums">
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </td>
                      <td className="py-3 px-4">{dayName}</td>
                      <td className="py-3 px-4 font-semibold">
                        {employeeNames[record.employeeId] ?? record.employeeId}
                      </td>
                      <td className="py-3 px-4 tabular-nums">{formatTime(record.checkIn)}</td>
                      <td className="py-3 px-4 tabular-nums">{formatTime(record.checkOut)}</td>
                      <td className="py-3 px-4 tabular-nums">{formatHM(record.workingMinutes)}</td>
                      <td className="py-3 px-4 tabular-nums">{formatHM(record.breakMinutes)}</td>
                      <td className="py-3 px-4 tabular-nums">{formatHM(record.extraMinutes)}</td>
                      <td className="py-3 px-4">{statusBadge(record.status)}</td>
                    </tr>
                  );
                })
              )
            ) : (
              sortedDates.map((dateStr) => {
                const record = records.find((r) => r.date === dateStr);
                const leave = leaveDateMap.get(dateStr);
                const date = new Date(dateStr + 'T00:00:00');
                const dayName = DAY_NAMES[date.getDay()];
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                return (
                  <tr
                    key={dateStr}
                    className="border-b transition-colors hover:bg-[rgba(252,221,42,0.05)]"
                    style={{
                      borderColor: 'var(--uxsg-border-light)',
                      opacity: isWeekend ? 0.5 : 1,
                    }}
                  >
                    <td className="py-3 px-4 font-medium tabular-nums">
                      {date.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-4">{dayName}</td>
                    <td className="py-3 px-4 tabular-nums">
                      {record ? formatTime(record.checkIn) : '—'}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {record ? formatTime(record.checkOut) : '—'}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {record ? formatHM(record.workingMinutes) : '—'}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {record ? formatHM(record.breakMinutes) : '—'}
                    </td>
                    <td className="py-3 px-4 tabular-nums">
                      {record ? formatHM(record.extraMinutes) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {leave
                        ? statusBadge('ON_LEAVE', true, leave.type)
                        : record
                          ? statusBadge(record.status)
                          : isWeekend
                            ? <span className="font-body text-xs opacity-40">Weekend</span>
                            : statusBadge('ABSENT')}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
