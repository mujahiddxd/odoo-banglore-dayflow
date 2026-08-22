'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function CheckInOut() {
  const [status, setStatus] = useState<'idle' | 'checked-in' | 'checked-out'>('idle');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch current attendance status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Timer effect
  useEffect(() => {
    if (status !== 'checked-in' || !checkInTime) return;
    const interval = setInterval(() => {
      const start = new Date(checkInTime).getTime();
      const now = Date.now();
      setElapsedSeconds(Math.floor((now - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, checkInTime]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/attendance/status');
      if (res.ok) {
        const data = await res.json();
        if (data.checkedIn) {
          setStatus('checked-in');
          setCheckInTime(data.checkInTime);
        } else if (data.checkedOut) {
          setStatus('checked-out');
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-in' }),
      });
      if (res.ok) {
        const data = await res.json();
        setStatus('checked-in');
        setCheckInTime(data.checkInTime);
        setElapsedSeconds(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check-out' }),
      });
      if (res.ok) {
        setStatus('checked-out');
        setElapsedSeconds(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatClockTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className="sketchy-card p-5 animate-fade-in" style={{ animationDelay: '0.3s', opacity: 0 }}>
      {/* Status indicator */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`status-dot ${status === 'checked-in' ? 'status-dot-present' : 'status-dot-absent'}`} />
        <span className="font-body text-sm font-medium">
          {status === 'checked-in' ? 'Checked In' : status === 'checked-out' ? 'Checked Out' : 'Not Checked In'}
        </span>
      </div>

      {/* Timer */}
      {status === 'checked-in' && (
        <div className="mb-4 text-center">
          <p className="font-headline text-3xl font-bold text-[var(--uxsg-ink)]">
            {formatTime(elapsedSeconds)}
          </p>
          <p className="font-body text-xs text-gray-500 mt-1">
            Since {checkInTime ? formatClockTime(checkInTime) : '—'}
          </p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-2">
        {status !== 'checked-in' && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="btn-sketchy btn-primary w-full"
          >
            {loading ? 'Checking in...' : 'Check In →'}
          </button>
        )}
        {status === 'checked-in' && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="btn-sketchy btn-secondary w-full"
          >
            {loading ? 'Checking out...' : 'Check Out →'}
          </button>
        )}
      </div>
    </div>
  );
}
