'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface EmployeeData {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string;
  created_at: string;
  companyName: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [user, setUser] = useState<any>(null); // To show in navbar

  useEffect(() => {
    fetchData();
  }, [id]);

  const MOCK_PROFILES: Record<string, EmployeeData> = {
    '1': { id: 1, employee_id: 'OIADMN20240001', name: 'Priya Sharma', email: 'priya.sharma@dayflow.in', phone: '+91 98765 43210', role: 'admin', avatar: '', created_at: '2024-01-15T09:00:00Z', companyName: 'Odoo' },
    '2': { id: 2, employee_id: 'OIJODO20240002', name: 'John Doe', email: 'john@dayflow.in', phone: '+91 98765 43211', role: 'employee', avatar: '', created_at: '2024-02-10T09:00:00Z', companyName: 'Odoo' },
    'me': { id: 1, employee_id: 'OIADMN20240001', name: 'Priya Sharma', email: 'priya.sharma@dayflow.in', phone: '+91 98765 43210', role: 'admin', avatar: '', created_at: '2024-01-15T09:00:00Z', companyName: 'Odoo' },
  };

  const fetchData = async () => {
    try {
      const userRes = await fetch('/api/auth/me').catch(() => null);
      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      const res = await fetch(`/api/employees/${id}`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setEmployee(data.employee);
        return;
      }
      
      const fallback = MOCK_PROFILES[id] || MOCK_PROFILES['1'];
      setEmployee(fallback);
    } catch {
      const fallback = MOCK_PROFILES[id] || MOCK_PROFILES['1'];
      setEmployee(fallback);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !employee) return null;

  const initials = employee.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-[var(--uxsg-paper)]">
      <Navbar userName={user?.name || employee.name} userAvatar={user?.avatar} companyName={user?.companyName || employee.companyName} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="font-headline text-3xl font-bold text-gray-500 mb-6" style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
          My Profile
        </h1>

        {/* Main Card */}
        <div className="sketchy-card bg-white p-8 mb-8 relative animate-slide-up">
          <div className="tape-corner tape-corner-tl" />
          <div className="tape-corner tape-corner-br" />

          {/* Top Section */}
          <div className="flex flex-col md:flex-row gap-8 items-start relative">
            
            {/* Role Badge - Absolute on desktop, relative on mobile */}
            <div className="absolute top-0 right-0 md:block hidden">
              <span className="font-body text-xs font-bold bg-[var(--uxsg-yellow)] text-black px-4 py-1.5 sketchy-border-sm inline-flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <span className="text-sm">🔧</span> {employee.role === 'admin' ? 'Admin' : employee.role === 'hr' ? 'HR' : 'Employee'}
              </span>
            </div>

            {/* Avatar */}
            <div className="w-32 h-32 rounded-full flex-shrink-0 flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden" 
                 style={{ background: 'linear-gradient(135deg, #a8d4e6 0%, #FCDD2A 100%)' }}>
              <span className="font-headline text-4xl font-bold text-white drop-shadow-md">
                {initials}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 w-full">
              <div className="md:hidden mb-4">
                <span className="font-body text-xs font-bold bg-[var(--uxsg-yellow)] text-black px-4 py-1.5 sketchy-border-sm inline-flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <span className="text-sm">🔧</span> {employee.role === 'admin' ? 'Admin' : employee.role === 'hr' ? 'HR' : 'Employee'}
                </span>
              </div>
              
              <h2 className="font-headline text-4xl font-bold text-[var(--uxsg-ink)] tracking-wide">
                {employee.name}
              </h2>
              <p className="font-body text-gray-600 text-sm mt-1 mb-6">HR Manager</p>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <DetailItem icon="✉️" label="EMAIL" value={employee.email} />
                <DetailItem icon="📱" label="MOBILE" value={employee.phone || '+91 98765 43210'} />
                <DetailItem icon="🏢" label="COMPANY" value={employee.companyName || 'Odoo'} />
                <DetailItem icon="📁" label="DEPARTMENT" value="Human Resources" />
                <DetailItem icon="👔" label="MANAGER" value="—" />
                <DetailItem icon="📍" label="LOCATION" value="Bangalore, India" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-black mb-8 flex overflow-x-auto">
          <TabButton active={activeTab === 'resume'} onClick={() => setActiveTab('resume')} icon="📄">Resume</TabButton>
          <TabButton active={activeTab === 'private'} onClick={() => setActiveTab('private')} icon="🔒">Private Info</TabButton>
          <TabButton active={activeTab === 'salary'} onClick={() => setActiveTab('salary')} icon="💰">Salary Info</TabButton>
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="🛡️">Security</TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'resume' && (
          <div className="animate-fade-in space-y-10 pl-2">
            
            {/* Skills */}
            <section>
              <h3 className="font-headline text-2xl font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span>🛠️</span> Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {['Talent Acquisition', 'Employee Relations', 'Payroll Management', 'Performance Review', 'Compliance'].map((skill) => (
                  <span key={skill} className="font-body text-xs font-semibold bg-[var(--uxsg-teal)] text-black px-4 py-1.5 sketchy-border-sm shadow-[2px_2px_0px_#000]">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h3 className="font-headline text-2xl font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span>🏅</span> Certifications
              </h3>
              <div className="flex flex-wrap gap-3">
                {['SHRM-CP', 'HR Analytics – IIM Bangalore'].map((cert) => (
                  <span key={cert} className="font-body text-xs font-bold bg-[var(--uxsg-yellow)] text-black px-4 py-1.5 border-[1.5px] border-black shadow-[2px_2px_0px_#000]">
                    {cert}
                  </span>
                ))}
              </div>
            </section>

            {/* Work Experience */}
            <section>
              <h3 className="font-headline text-2xl font-bold text-gray-600 mb-4 flex items-center gap-2">
                <span>💼</span> Work Experience
              </h3>
              <div className="sketchy-card p-6 min-h-[100px]">
                {/* Empty block for now to match UI */}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div>
      <p className="font-body text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
        <span className="opacity-80">{icon}</span> {label}
      </p>
      <p className="font-body text-sm font-semibold text-black">{value}</p>
    </div>
  );
}

function TabButton({ children, active, onClick, icon }: { children: React.ReactNode; active: boolean; onClick: () => void; icon: string }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 font-body text-sm font-bold transition-colors whitespace-nowrap
        ${active ? 'text-black border-b-[3px] border-black -mb-[2px]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}
      `}
    >
      <span className="opacity-60">{icon}</span>
      {children}
    </button>
  );
}
