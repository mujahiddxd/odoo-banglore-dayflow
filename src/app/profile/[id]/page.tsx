'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

interface EmployeeData {
  id: string;
  employee_id?: string;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  role: string;
  avatar: string;
  created_at?: string;
  company?: string;
  companyName?: string;
  address?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');
  const [user, setUser] = useState<any>(null); // To show in navbar
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleImageClick = () => {
    if (user?.employee_id === employee?.employee_id || user?.employee_id === employee?.id || ['admin', 'hr'].includes(user?.role?.toLowerCase())) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Str = event.target?.result as string;
      setIsUploading(true);

      try {
        const res = await fetch(`/api/employees/${employee?.id}/avatar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: base64Str }),
        });

        if (res.ok) {
          setEmployee(prev => prev ? { ...prev, avatar: base64Str } : prev);
          if (user?.employee_id === employee?.id) {
            setUser((prev: any) => prev ? { ...prev, avatar: base64Str } : prev);
          }
        } else {
          alert('Failed to upload image');
        }
      } catch (err) {
        console.error(err);
        alert('An error occurred while uploading');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const MOCK_PROFILES: Record<string, EmployeeData> = {
    '1': { id: '1', name: 'Priya Sharma', email: 'priya.sharma@dayflow.in', phone: '+91 98765 43210', role: 'admin', avatar: '', created_at: '2024-01-15T09:00:00Z', companyName: 'Odoo' },
    '2': { id: '2', name: 'John Doe', email: 'john@dayflow.in', phone: '+91 98765 43211', role: 'employee', avatar: '', created_at: '2024-02-10T09:00:00Z', companyName: 'Odoo' },
    'me': { id: '1', name: 'Priya Sharma', email: 'priya.sharma@dayflow.in', phone: '+91 98765 43210', role: 'admin', avatar: '', created_at: '2024-01-15T09:00:00Z', companyName: 'Odoo' },
  };

  async function fetchData() {
    try {
      const userRes = await fetch('/api/auth/me').catch(() => null);
      if (userRes && userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      const res = await fetch(`/api/employees/${id}`).catch(() => null);
      if (res && res.ok) {
        const resData = await res.json();
        const emp = resData.data?.employee || resData.employee;
        if (emp) {
          setEmployee(emp);
          setEditPhone(emp.phone || '');
          setEditAddress(emp.address || '');
        } else {
          const fallback = MOCK_PROFILES[id] || MOCK_PROFILES['1'];
          setEmployee(fallback);
        }
      } else {
        const fallback = MOCK_PROFILES[id] || MOCK_PROFILES['1'];
        setEmployee(fallback);
      }
    } catch {
      const fallback = MOCK_PROFILES[id] || MOCK_PROFILES['1'];
      setEmployee(fallback);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: editPhone, address: editAddress }),
      });
      if (res.ok) {
        setEmployee(prev => prev ? { ...prev, phone: editPhone, address: editAddress } : prev);
        setIsEditing(false);
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving');
    } finally {
      setIsSaving(false);
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
            <div 
              className="w-32 h-32 rounded-full flex-shrink-0 flex items-center justify-center border-[3px] border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] relative overflow-hidden group cursor-pointer" 
              style={{ background: 'linear-gradient(135deg, #a8d4e6 0%, #FCDD2A 100%)' }}
              onClick={handleImageClick}
            >
              {employee.avatar ? (
                <img src={employee.avatar} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-headline text-4xl font-bold text-white drop-shadow-md">
                  {initials}
                </span>
              )}
              
              {(user?.employee_id === employee?.employee_id || user?.employee_id === employee?.id || ['admin', 'hr'].includes(user?.role?.toLowerCase())) && (
                <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center transition-all">
                  <span className="text-white font-body text-xs font-bold text-center">
                    {isUploading ? 'Uploading...' : 'Change Photo'}
                  </span>
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* User Info */}
            <div className="flex-1 w-full">
              <div className="md:hidden mb-4">
                <span className="font-body text-xs font-bold bg-[var(--uxsg-yellow)] text-black px-4 py-1.5 sketchy-border-sm inline-flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                  <span className="text-sm">🔧</span> {employee.role === 'admin' ? 'Admin' : employee.role === 'hr' ? 'HR' : 'Employee'}
                </span>
              </div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-headline text-4xl font-bold text-[var(--uxsg-ink)] tracking-wide">
                    {employee.name}
                  </h2>
                  <p className="font-body text-gray-600 text-sm mt-1 mb-6">HR Manager</p>
                </div>
                {(user?.employee_id === employee?.employee_id || user?.employee_id === employee?.id || ['admin', 'hr'].includes(user?.role?.toLowerCase())) && (
                  <button 
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                    disabled={isSaving}
                    className="font-body text-xs font-bold bg-white border-2 border-black px-4 py-2 hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_#000]"
                  >
                    {isSaving ? 'Saving...' : (isEditing ? 'Save Profile' : 'Edit Profile')}
                  </button>
                )}
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                <DetailItem icon="✉️" label="EMAIL" value={employee.email} />
                
                {isEditing ? (
                  <div>
                    <p className="font-body text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <span className="opacity-80">📱</span> MOBILE
                    </p>
                    <input 
                      type="text" 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full border-b-2 border-black bg-transparent py-1 font-body text-sm font-semibold text-black focus:outline-none"
                    />
                  </div>
                ) : (
                  <DetailItem icon="📱" label="MOBILE" value={employee.phone || '+91 98765 43210'} />
                )}
                
                <DetailItem icon="🏢" label="COMPANY" value={employee.companyName || 'Odoo'} />
                <DetailItem icon="📁" label="DEPARTMENT" value="Human Resources" />
                <DetailItem icon="👔" label="MANAGER" value="—" />
                
                {isEditing ? (
                  <div>
                    <p className="font-body text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <span className="opacity-80">📍</span> ADDRESS
                    </p>
                    <input 
                      type="text" 
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="w-full border-b-2 border-black bg-transparent py-1 font-body text-sm font-semibold text-black focus:outline-none"
                    />
                  </div>
                ) : (
                  <DetailItem icon="📍" label="LOCATION / ADDRESS" value={employee.address || 'Bangalore, India'} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-black mb-8 flex overflow-x-auto">
          <TabButton active={activeTab === 'resume'} onClick={() => setActiveTab('resume')}>Resume</TabButton>
          <TabButton active={activeTab === 'private'} onClick={() => setActiveTab('private')}>Private Info</TabButton>
          <TabButton active={activeTab === 'salary'} onClick={() => setActiveTab('salary')}>Salary Info</TabButton>
          <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>Security</TabButton>
        </div>

        {/* Tab Content */}
        {activeTab === 'resume' && (
          <div className="animate-fade-in space-y-10 pl-2">
            
            {/* Skills */}
            <section>
              <h3 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)] section-heading">
                Skills
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
              <h3 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)] section-heading">
                Certifications
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
              <h3 className="font-headline text-2xl font-bold text-[var(--uxsg-ink)] section-heading">
                Work Experience
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

function TabButton({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-6 py-3 font-body text-sm font-bold transition-colors whitespace-nowrap
        ${active ? 'text-black border-b-[3px] border-black -mb-[2px]' : 'text-gray-500 hover:text-gray-700 hover:bg-black/5'}
      `}
    >
      {children}
    </button>
  );
}
