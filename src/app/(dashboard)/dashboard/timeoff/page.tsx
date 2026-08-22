'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import SketchyButton from '@/components/SketchyButton';

export default function TimeOffPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)]">Time Off Requests</h1>
          <SketchyButton variant="primary">Apply Leave</SketchyButton>
        </div>
        
        <div className="sketchy-card p-12 text-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--uxsg-yellow)" strokeWidth="2" strokeLinecap="round" className="mx-auto mb-4">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h2 className="font-headline text-xl font-bold mb-2">No Leave Requests</h2>
          <p className="font-body text-gray-500">You haven&apos;t applied for any time off recently.</p>
        </div>
      </div>
    </div>
  );
}
