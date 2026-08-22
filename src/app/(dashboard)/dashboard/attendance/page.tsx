'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';

export default function AttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        router.push('/signin');
        return;
      }
      const userData = await userRes.json();
      setUser(userData.user);

      const attRes = await fetch('/api/attendance');
      if (attRes.ok) {
        const attData = await attRes.json();
        setRecords(attData.attendance || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || ''} userAvatar={user?.avatar} companyName={user?.companyName} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)] mb-6">Attendance Records</h1>
        
        <div className="sketchy-card p-6 overflow-x-auto">
          <table className="w-full text-left font-body text-sm">
            <thead>
              <tr className="border-b-2 border-[var(--uxsg-ink)]">
                <th className="pb-3 px-4 font-bold">Date</th>
                <th className="pb-3 px-4 font-bold">Employee</th>
                <th className="pb-3 px-4 font-bold">ID</th>
                <th className="pb-3 px-4 font-bold">Check In</th>
                <th className="pb-3 px-4 font-bold">Check Out</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No attendance records found.</td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--uxsg-border-light)] hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-semibold">{r.employee_name}</td>
                    <td className="py-3 px-4 text-gray-500">{r.emp_code}</td>
                    <td className="py-3 px-4">
                      {r.check_in ? new Date(r.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {r.check_out ? new Date(r.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
