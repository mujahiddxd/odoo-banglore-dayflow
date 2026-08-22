'use client';

import React, { useState, useEffect } from 'react';
import type { TimeOffType } from '@/lib/types';

interface CreateTimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateTimeOffModal({ isOpen, onClose, onCreated }: CreateTimeOffModalProps) {
  const [types, setTypes] = useState<TimeOffType[]>([]);
  const [typeId, setTypeId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calculatedDays, setCalculatedDays] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchTypes();
      // Reset form
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTypeId('');
      setStartDate('');
      setEndDate('');
      setReason('');
      setError('');
      setCalculatedDays(null);
    }
  }, [isOpen]);

  // Calculate business days when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start <= end) {
        let count = 0;
        const cur = new Date(start);
        while (cur <= end) {
          const d = cur.getDay();
          if (d !== 0 && d !== 6) count++;
          cur.setDate(cur.getDate() + 1);
        }
        setCalculatedDays(count);
      } else {
        setCalculatedDays(null);
      }
    } else {
      setCalculatedDays(null);
    }
  }, [startDate, endDate]);

  async function fetchTypes() {
    try {
      const res = await fetch('/api/timeoff/types');
      if (res.ok) {
        const data = await res.json();
        setTypes(data.data ?? []);
        if (data.data?.length > 0) setTypeId(data.data[0].id);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/timeoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeOffTypeId: typeId, startDate, endDate, reason }),
      });
      const data = await res.json();
      if (res.ok) {
        onCreated();
        onClose();
      } else {
        setError(data.error ?? 'Failed to create request');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" style={{ background: 'rgba(9,9,7,0.5)' }}>
      <div className="sketchy-card p-6 w-full max-w-md relative animate-fade-in">
        <div className="tape tape-tl" />
        <div className="tape tape-br" style={{ transform: 'rotate(8deg)' }} />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>

        <h2 className="font-headline text-xl font-bold mb-5">🏖️ New Time Off Request</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time Off Type */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
              Time Off Type
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="sketchy-input"
              required
            >
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.isPaid ? '(Paid)' : '(Unpaid)'}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="sketchy-input"
              required
            />
          </div>

          {/* End Date */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="sketchy-input"
              required
            />
          </div>

          {/* Calculated days preview */}
          {calculatedDays !== null && (
            <div className="sticky-note sticky-note-blue p-3 text-sm">
              <span className="font-handwritten">
                📅 {calculatedDays} business day{calculatedDays !== 1 ? 's' : ''} will be requested
              </span>
            </div>
          )}

          {/* Reason */}
          <div className="flex flex-col gap-1.5">
            <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
              Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief reason for time off..."
              className="sketchy-input"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && (
            <div className="sticky-note sticky-note-yellow p-3 text-sm animate-fade-in" style={{ transform: 'rotate(-0.5deg)' }}>
              <span className="font-handwritten">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="sketchy-btn sketchy-btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !typeId || !startDate || !endDate}
              className="sketchy-btn sketchy-btn-primary flex-1"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
