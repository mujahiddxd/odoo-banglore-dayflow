'use client';

import React, { useState, useEffect } from 'react';

export default function CheckInCard() {
  const [status, setStatus] = useState<'idle' | 'checked-in' | 'checked-out'>('idle');
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  useEffect(() => {
    if (status !== 'checked-in' || !checkInTime) return;
    const interval = setInterval(() => {
      const start = new Date(checkInTime).getTime();
      setElapsedSeconds(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, checkInTime]);

  async function fetchStatus() {
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
    } catch {
      // ignore
    }
  };

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        if (action === 'check-in') {
          setStatus('checked-in');
          setCheckInTime(data.checkInTime);
          setElapsedSeconds(0);
        } else {
          setStatus('checked-out');
          setElapsedSeconds(0);
        }
      } else {
        setError(data.error ?? `${action} failed`);
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const formatClock = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return (
    <div className="sketchy-card p-5 animate-fade-in">
      <h3 className="font-headline text-lg font-bold mb-3">Attendance</h3>

      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-3 h-3 rounded-full"
          style={{
            background:
              status === 'checked-in' ? 'var(--status-present)'
              : status === 'checked-out' ? 'var(--uxsg-teal)'
              : 'var(--status-absent)',
            boxShadow: status === 'checked-in' ? '0 0 8px rgba(34,197,94,0.5)' : 'none',
          }}
        />
        <span className="font-body text-sm font-medium">
          {status === 'checked-in' ? 'Checked In' : status === 'checked-out' ? 'Checked Out' : 'Not Checked In'}
        </span>
      </div>

      {status === 'checked-in' && (
        <div className="mb-4 text-center py-3" style={{ background: 'rgba(34,197,94,0.05)', borderRadius: '8px' }}>
          <p className="font-headline text-3xl font-bold text-[var(--uxsg-ink)]">{formatTimer(elapsedSeconds)}</p>
          <p className="font-body text-xs text-gray-500 mt-1">Since {checkInTime ? formatClock(checkInTime) : '—'}</p>
        </div>
      )}

      {error && (
        <div className="sticky-note sticky-note-yellow p-3 mb-3 text-sm animate-fade-in" style={{ transform: 'rotate(-0.5deg)' }}>
          <span className="font-handwritten">{error}</span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {status !== 'checked-in' && status !== 'checked-out' && (
          <button onClick={() => handleAction('check-in')} disabled={loading} className="sketchy-btn sketchy-btn-primary w-full">
            {loading ? 'Checking in...' : '📍 Check In'}
          </button>
        )}
        {status === 'checked-in' && (
          <button onClick={() => handleAction('check-out')} disabled={loading} className="sketchy-btn sketchy-btn-secondary w-full">
            {loading ? 'Checking out...' : '🚪 Check Out'}
          </button>
        )}
        {status === 'checked-out' && (
          <div className="text-center py-2">
            <p className="font-body text-sm text-gray-500">✅ Attendance completed for today</p>
          </div>
        )}
      </div>
    </div>
  );
}
