'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { formatCurrency } from '@/lib/money';

interface PayslipSummary {
  month: number;
  year: number;
  netSalary: number;
  grossSalary: number;
  status: 'GENERATED' | 'PAID';
}

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<PayslipSummary[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const userRes = await fetch('/api/auth/me');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }
      
      // Fetch mock payslips for now
      // In a real app, this would be an API call like: await fetch('/api/payslips')
      const now = new Date();
      const mockPayslips: PayslipSummary[] = [];
      for (let i = 1; i <= 3; i++) {
        let m = now.getMonth() + 1 - i;
        let y = now.getFullYear();
        if (m <= 0) {
          m += 12;
          y -= 1;
        }
        mockPayslips.push({
          month: m,
          year: y,
          netSalary: 4500000, // 45,000 INR in paise
          grossSalary: 5000000,
          status: 'PAID'
        });
      }
      setPayslips(mockPayslips);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || 'User'} userAvatar={user?.avatar} companyName={user?.companyName} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-headline text-3xl font-bold text-[var(--uxsg-ink)] mb-6">
          My Payslips
        </h1>

        {loading ? (
          <div className="text-center py-12 animate-pulse">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {payslips.map((p, idx) => (
              <div key={idx} className="sketchy-card p-6 bg-white animate-fade-in relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[var(--uxsg-yellow)] opacity-20 rounded-bl-full" />
                
                <h3 className="font-headline text-xl font-bold mb-1">
                  {monthNames[p.month - 1]} {p.year}
                </h3>
                <p className="font-body text-xs text-green-600 font-bold mb-4 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {p.status}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Gross Pay</span>
                    <span className="font-bold">{formatCurrency(p.grossSalary)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Net Pay</span>
                    <span className="font-bold text-lg text-[var(--uxsg-teal)]">{formatCurrency(p.netSalary)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => window.print()} 
                  className="w-full sketchy-btn font-body text-sm py-2 flex items-center justify-center gap-2 group-hover:bg-[var(--uxsg-ink)] group-hover:text-white transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 6 2 18 2 18 9"></polyline>
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                    <rect x="6" y="14" width="12" height="8"></rect>
                  </svg>
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
