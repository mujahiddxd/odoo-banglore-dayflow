'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for charts
  const attendanceData = [
    { name: 'Mon', Present: 40, Absent: 5, Leave: 2 },
    { name: 'Tue', Present: 42, Absent: 3, Leave: 2 },
    { name: 'Wed', Present: 45, Absent: 1, Leave: 1 },
    { name: 'Thu', Present: 41, Absent: 4, Leave: 2 },
    { name: 'Fri', Present: 38, Absent: 7, Leave: 2 },
  ];

  const leaveData = [
    { name: 'Sick Leave', value: 30 },
    { name: 'Casual Leave', value: 50 },
    { name: 'Unpaid Leave', value: 20 },
  ];

  const COLORS = ['#6d28d9', '#10b981', '#f59e0b', '#ef4444'];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Restrict to admins/hr
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return (
      <div className="min-h-screen bg-[var(--uxsg-paper)]">
        <Navbar userName={user?.name || 'User'} userAvatar={user?.avatar} companyName={user?.companyName} />
        <div className="max-w-5xl mx-auto px-4 py-8 text-center">
          <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)] mb-4">Access Denied</h1>
          <p>You do not have permission to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || 'User'} userAvatar={user?.avatar} companyName={user?.companyName} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)] mb-6">
          Analytics & Reports
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Attendance Chart */}
          <div className="sketchy-card bg-white p-6 animate-fade-in">
            <h2 className="font-headline text-xl font-bold mb-6">Weekly Attendance Trend</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="name" stroke="#374151" tick={{fontFamily: 'var(--font-body)'}} />
                  <YAxis stroke="#374151" tick={{fontFamily: 'var(--font-body)'}} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black', boxShadow: '4px 4px 0px black' }} />
                  <Legend wrapperStyle={{ fontFamily: 'var(--font-body)', paddingTop: '20px' }} />
                  <Bar dataKey="Present" stackId="a" fill="var(--uxsg-teal)" />
                  <Bar dataKey="Leave" stackId="a" fill="var(--uxsg-yellow)" />
                  <Bar dataKey="Absent" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Leave Distribution Pie Chart */}
          <div className="sketchy-card bg-white p-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h2 className="font-headline text-xl font-bold mb-6">Leave Distribution (YTD)</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {leaveData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '2px solid black', boxShadow: '4px 4px 0px black' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
