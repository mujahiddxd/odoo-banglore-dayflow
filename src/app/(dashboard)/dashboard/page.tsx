'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import EmployeeCard from '@/components/EmployeeCard';
import CheckInOut from '@/components/CheckInOut';
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';
import { AddEmployeeModal } from '@/components/employees/AddEmployeeModal';
import CalendarView from '@/components/dashboard/CalendarView';

interface Employee {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  status: 'present' | 'leave' | 'absent';
}

interface UserInfo {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  companyName: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userRes, empRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/employees'),
      ]);

      if (!userRes.ok) {
        router.push('/signin');
        return;
      }

      const userData = await userRes.json();
      const empData = await empRes.json();

      setUser(userData.user);
      setEmployees(empData.employees || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen paper-bg flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="font-headline text-3xl font-bold mb-2 animate-wobble">Odoo</div>
          <p className="font-handwritten text-gray-500">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      {/* Navbar */}
      <Navbar
        userName={user?.name || 'User'}
        userAvatar={user?.avatar}
        companyName={user?.companyName}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Employee Grid */}
          <div className="flex-1">
            {/* Header with Add button */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)]">
                    Employees
                  </h1>
                  <p className="font-body text-sm text-gray-500 mt-1">
                    {employees.length} team member{employees.length !== 1 ? 's' : ''}
                  </p>
                </div>
                
                <div className="flex bg-gray-100 rounded-lg p-1 border-2 border-[var(--uxsg-ink)] ml-4">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[var(--uxsg-ink)] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Grid View
                  </button>
                  <button 
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-1 text-sm font-bold rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-[var(--uxsg-ink)] text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  >
                    Calendar View
                  </button>
                </div>
              </div>
              {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'hr' || user?.email === 'admin@dayflow.in') && (
                <SketchyButton
                  variant="primary"
                  onClick={() => setShowAddModal(true)}
                >
                  + New
                </SketchyButton>
              )}
            </div>

            {viewMode === 'calendar' ? (
              <CalendarView />
            ) : (
              <>
                {/* Employee Grid */}
                {employees.length === 0 ? (
              <div className="sketchy-card p-12 text-center animate-fade-in">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-ink)" strokeWidth="1" strokeLinecap="round" className="mx-auto mb-4 opacity-30">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <p className="font-headline text-lg font-bold text-gray-400">No employees yet</p>
                <p className="font-body text-sm text-gray-400 mt-1">Add your first team member to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {employees.map((emp, i) => (
                  <EmployeeCard
                    key={emp.id}
                    id={emp.employee_id}
                    name={emp.name}
                    avatar={emp.avatar}
                    status={emp.status}
                    index={i}
                  />
                ))}
              </div>
                )}
              </>
            )}

            {/* Settings link */}
            <div className="mt-8">
              <button className="font-body text-sm text-gray-400 hover:text-[var(--uxsg-ink)] transition-colors flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                Settings
              </button>
            </div>
          </div>

          {/* Right sidebar — Check In/Out */}
          <div className="lg:w-72 w-full">
            <CheckInOut />

            {/* Quick stats */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="sketchy-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="status-dot status-dot-present" style={{ width: '8px', height: '8px' }} />
                </div>
                <p className="font-headline text-lg font-bold">{employees.filter(e => e.status === 'present').length}</p>
                <p className="font-body text-[10px] text-gray-500">Present</p>
              </div>
              <div className="sketchy-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="status-dot status-dot-leave" style={{ width: '8px', height: '8px' }} />
                </div>
                <p className="font-headline text-lg font-bold">{employees.filter(e => e.status === 'leave').length}</p>
                <p className="font-body text-[10px] text-gray-500">On Leave</p>
              </div>
              <div className="sketchy-card p-3 text-center animate-fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="status-dot status-dot-absent" style={{ width: '8px', height: '8px' }} />
                </div>
                <p className="font-headline text-lg font-bold">{employees.filter(e => e.status === 'absent').length}</p>
                <p className="font-body text-[10px] text-gray-500">Absent</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => fetchData()}
        />
      )}
    </div>
  );
}
