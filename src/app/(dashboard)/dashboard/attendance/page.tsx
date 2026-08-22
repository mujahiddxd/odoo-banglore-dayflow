'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import MonthNavigator from '@/components/attendance/MonthNavigator';
import AttendanceSummary from '@/components/attendance/AttendanceSummary';
import AttendanceTable from '@/components/attendance/AttendanceTable';
import CheckInCard from '@/components/attendance/CheckInCard';
import type { AttendanceRecord } from '@/lib/types';

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

export default function AttendancePage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaveDates, setLeaveDates] = useState<{ date: string; type: string; isPaid: boolean }[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ role: string; employeeId: string; name: string; avatar: string; companyName: string } | null>(null);

  // Admin filters
  const [filterEmployee, setFilterEmployee] = useState('');
  const [allRecords, setAllRecords] = useState<(AttendanceRecord & { employeeName?: string; department?: string })[]>([]);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [year, month, user]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser({
          role: u?.role?.toUpperCase?.() ?? data.role?.toUpperCase?.() ?? 'EMPLOYEE',
          employeeId: u?.employee_id ?? data.employeeId ?? '',
          name: u?.name ?? data.name ?? 'User',
          avatar: u?.avatar ?? data.avatar ?? '',
          companyName: u?.companyName ?? 'Odoo',
        });
      }
    } catch {
      // ignore
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const isAdmin = user?.role === 'ADMIN';

      // Fetch attendance records
      const attRes = await fetch(`/api/attendance?year=${year}&month=${month}`);
      if (attRes.ok) {
        const data = await attRes.json();
        if (isAdmin && !filterEmployee) {
          setAllRecords(data.data?.records ?? []);
          setRecords([]);
        } else {
          setRecords(data.data?.records ?? []);
          setLeaveDates(data.data?.leaveDates ?? []);
        }
      }

      // Fetch summary (for employee view or when admin views specific employee)
      if (!isAdmin || filterEmployee) {
        const empParam = filterEmployee ? `&employeeId=${filterEmployee}` : '';
        const sumRes = await fetch(`/api/attendance/summary?year=${year}&month=${month}${empParam}`);
        if (sumRes.ok) {
          const sumData = await sumRes.json();
          setSummary(sumData.data);
        }
      } else {
        setSummary(null);
      }
    } catch (e) {
      console.error('Failed to fetch attendance data', e);
    } finally {
      setLoading(false);
    }
  }, [year, month, user, filterEmployee]);

  const handleNavigate = (y: number, m: number) => {
    setYear(y);
    setMonth(m);
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || 'User'} userAvatar={user?.avatar} companyName={user?.companyName} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)]">
              📋 Attendance
            </h1>
            <p className="font-body text-sm text-gray-500 mt-1">
              {isAdmin ? 'View and manage employee attendance' : 'Track your daily attendance'}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main content */}
          <div className="flex-1">
            {/* Month Navigation */}
            <MonthNavigator year={year} month={month} onNavigate={handleNavigate} />

            {/* Admin Filters */}
            {isAdmin && (
              <div className="sketchy-card p-4 mb-4 animate-fade-in">
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="font-body text-sm font-medium">Filter:</label>
                  <input
                    type="text"
                    placeholder="Employee ID (e.g. emp-002)"
                    value={filterEmployee}
                    onChange={(e) => setFilterEmployee(e.target.value)}
                    className="sketchy-input max-w-xs"
                  />
                  <button
                    onClick={() => { setFilterEmployee(''); }}
                    className="sketchy-btn sketchy-btn-secondary text-xs py-2 px-3"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Summary Cards */}
            {summary && (
              <AttendanceSummary summary={summary} loading={loading} />
            )}

            {/* Admin: all employees table */}
            {isAdmin && !filterEmployee && (
              <div className="animate-fade-in">
                <h2 className="font-headline text-lg font-bold mb-3">
                  All Employees — Today
                </h2>
                <AttendanceTable
                  records={allRecords as AttendanceRecord[]}
                  loading={loading}
                  showEmployee
                  employeeNames={Object.fromEntries(
                    allRecords.map((r) => [r.employeeId, (r as any).employeeName ?? r.employeeId])
                  )}
                />
              </div>
            )}

            {/* Employee or Admin-filtered view */}
            {(!isAdmin || filterEmployee) && (
              <div className="animate-fade-in">
                <AttendanceTable
                  records={records}
                  leaveDates={leaveDates}
                  loading={loading}
                />
              </div>
            )}
          </div>

          {/* Sidebar — Check In Card */}
          <div className="lg:w-72 w-full">
            <CheckInCard />
          </div>
        </div>
      </div>
    </div>
  );
}
