'use client';

import React from 'react';
import type { TimeOffRequest } from '@/lib/types';

interface TimeOffRequestsTableProps {
  requests: TimeOffRequest[];
  loading?: boolean;
  showEmployee?: boolean;
  isAdmin?: boolean;
  onApprove?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
  onCancel?: (requestId: string) => void;
}

function statusBadge(status: string) {
  switch (status) {
    case 'PENDING':
      return <span className="sketchy-badge sketchy-badge-yellow text-xs">⏳ Pending</span>;
    case 'APPROVED':
      return <span className="sketchy-badge sketchy-badge-teal text-xs">✓ Approved</span>;
    case 'REJECTED':
      return (
        <span className="sketchy-badge text-xs" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
          ✕ Rejected
        </span>
      );
    case 'CANCELLED':
      return <span className="sketchy-badge text-xs opacity-50">— Cancelled</span>;
    default:
      return <span className="sketchy-badge text-xs">{status}</span>;
  }
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function TimeOffRequestsTable({
  requests,
  loading,
  showEmployee = false,
  isAdmin = false,
  onApprove,
  onReject,
  onCancel,
}: TimeOffRequestsTableProps) {
  if (loading) {
    return (
      <div className="sketchy-card p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="sketchy-card p-8 text-center">
        <span className="text-4xl mb-3 block">🌴</span>
        <p className="font-headline text-lg font-bold text-gray-400 mb-1">No Requests</p>
        <p className="font-body text-sm text-gray-400">No time-off requests to display.</p>
      </div>
    );
  }

  return (
    <div className="sketchy-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-body text-sm">
          <thead>
            <tr className="border-b-2" style={{ borderColor: 'var(--uxsg-ink)' }}>
              {showEmployee && <th className="py-3 px-4 font-bold">Employee</th>}
              <th className="py-3 px-4 font-bold">Type</th>
              <th className="py-3 px-4 font-bold">Start Date</th>
              <th className="py-3 px-4 font-bold">End Date</th>
              <th className="py-3 px-4 font-bold">Days</th>
              <th className="py-3 px-4 font-bold">Reason</th>
              <th className="py-3 px-4 font-bold">Status</th>
              {isAdmin && <th className="py-3 px-4 font-bold">Actions</th>}
              {!isAdmin && <th className="py-3 px-4 font-bold"></th>}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b transition-colors hover:bg-[rgba(252,221,42,0.05)]"
                style={{ borderColor: 'var(--uxsg-border-light)' }}
              >
                {showEmployee && (
                  <td className="py-3 px-4 font-semibold">{req.employeeName}</td>
                )}
                <td className="py-3 px-4">{req.timeOffTypeName}</td>
                <td className="py-3 px-4 tabular-nums">{formatDate(req.startDate)}</td>
                <td className="py-3 px-4 tabular-nums">{formatDate(req.endDate)}</td>
                <td className="py-3 px-4 font-semibold tabular-nums">{req.days}</td>
                <td className="py-3 px-4 max-w-[200px] truncate" title={req.reason}>
                  {req.reason || '—'}
                </td>
                <td className="py-3 px-4">{statusBadge(req.status)}</td>
                <td className="py-3 px-4">
                  {isAdmin && req.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove?.(req.id)}
                        className="sketchy-btn sketchy-btn-primary text-xs py-1 px-3"
                        title="Approve"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => onReject?.(req.id)}
                        className="sketchy-btn sketchy-btn-secondary text-xs py-1 px-3"
                        title="Reject"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {!isAdmin && req.status === 'PENDING' && (
                    <button
                      onClick={() => onCancel?.(req.id)}
                      className="sketchy-btn sketchy-btn-secondary text-xs py-1 px-3"
                      title="Cancel"
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
