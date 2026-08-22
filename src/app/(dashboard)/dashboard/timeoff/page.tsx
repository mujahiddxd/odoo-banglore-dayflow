'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TimeOffBalanceCards from '@/components/timeoff/TimeOffBalanceCards';
import TimeOffRequestsTable from '@/components/timeoff/TimeOffRequestsTable';
import CreateTimeOffModal from '@/components/timeoff/CreateTimeOffModal';
import Navbar from '@/components/Navbar';
import type { TimeOffAllocation, TimeOffRequest } from '@/lib/types';

export default function TimeOffPage() {
  const [allocations, setAllocations] = useState<TimeOffAllocation[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [user, setUser] = useState<{ role: string; employeeId: string; name: string } | null>(null);

  // Admin filters
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) fetchData();
  }, [user, filterStatus]);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setUser({
          role: u?.role?.toUpperCase?.() ?? data.role?.toUpperCase?.() ?? 'EMPLOYEE',
          employeeId: u?.employee_id ?? data.employeeId ?? '',
          name: u?.name ?? data.name ?? '',
        });
      }
    } catch {
      // ignore
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch allocations
      const allocRes = await fetch('/api/timeoff/allocations');
      if (allocRes.ok) {
        const allocData = await allocRes.json();
        setAllocations(allocData.data ?? []);
      }

      // Fetch requests
      const statusParam = filterStatus ? `?status=${filterStatus}` : '';
      const reqRes = await fetch(`/api/timeoff${statusParam}`);
      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.data ?? []);
      }
    } catch (e) {
      console.error('Failed to fetch time-off data', e);
    } finally {
      setLoading(false);
    }
  }, [user, filterStatus]);

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(`/api/timeoff/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', comment: '' }),
      });
      if (res.ok) fetchData();
    } catch {
      // ignore
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch(`/api/timeoff/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', comment: '' }),
      });
      if (res.ok) fetchData();
    } catch {
      // ignore
    }
  };

  const handleCancel = async (requestId: string) => {
    try {
      const res = await fetch(`/api/timeoff/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', comment: '' }),
      });
      if (res.ok) fetchData();
    } catch {
      // ignore
    }
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || 'User'} companyName="Odoo" />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)]">
              🏖️ Time Off
            </h1>
            <p className="font-body text-sm text-gray-500 mt-1">
              {isAdmin ? 'Manage employee leave requests' : 'Request and track your time off'}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="sketchy-btn sketchy-btn-primary"
          >
            + New Request
          </button>
        </div>

        {/* Balance Cards */}
        <TimeOffBalanceCards allocations={allocations} loading={loading} />

        {/* Filters for Admin */}
        {isAdmin && (
          <div className="sketchy-card p-4 mb-4 animate-fade-in">
            <div className="flex flex-wrap gap-3 items-center">
              <label className="font-body text-sm font-medium">Filter by status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="sketchy-input max-w-xs"
              >
                <option value="">All</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Requests Section */}
        <div className="animate-fade-in">
          <h2 className="font-headline text-xl font-bold mb-3">
            {isAdmin ? 'All Requests' : 'My Requests'}
          </h2>
          <TimeOffRequestsTable
            requests={requests}
            loading={loading}
            showEmployee={isAdmin}
            isAdmin={isAdmin}
            onApprove={handleApprove}
            onReject={handleReject}
            onCancel={handleCancel}
          />
        </div>

        {/* Create Modal */}
        <CreateTimeOffModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onCreated={() => fetchData()}
        />
      </div>
    </div>
  );
}
