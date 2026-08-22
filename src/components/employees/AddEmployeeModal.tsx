'use client';

import React, { useState } from 'react';
import SketchyButton from '@/components/SketchyButton';
import SketchyInput from '@/components/SketchyInput';

interface AddEmployeeModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function AddEmployeeModal({ onClose, onSuccess }: AddEmployeeModalProps) {
  const [newEmployee, setNewEmployee] = useState({ name: '', email: '', phone: '', role: 'employee' });
  const [addResult, setAddResult] = useState<{ id: string; password: string } | null>(null);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee),
      });

      const data = await res.json();

      if (!res.ok) {
        setAddError(data.error);
        return;
      }

      setAddResult({
        id: data.generatedId,
        password: data.generatedPassword,
      });

      onSuccess();
    } catch {
      setAddError('Failed to add employee');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glass-overlay animate-fade-in">
      <div className="sketchy-card p-6 w-full max-w-md relative animate-slide-up">
        <div className="tape-corner tape-corner-tl" />
        <div className="tape-corner tape-corner-tr" />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
        >
          ✕
        </button>

        <h2 className="font-headline text-xl font-bold mb-5">Add New Employee</h2>

        {addResult ? (
          <div className="space-y-4 animate-fade-in">
            <div className="sticky-note sticky-note-yellow p-4">
              <p className="font-bold text-sm mb-2">✅ Employee Created!</p>
              <p className="text-sm">Employee ID: <strong>{addResult.id}</strong></p>
              <p className="text-sm">Temp Password: <strong>{addResult.password}</strong></p>
            </div>
            <p className="font-body text-xs text-gray-500">
              Share these credentials with the employee. They can change the password after first login.
            </p>
            <SketchyButton variant="secondary" fullWidth onClick={onClose}>
              Close
            </SketchyButton>
          </div>
        ) : (
          <form onSubmit={handleAddEmployee} className="space-y-4">
            <SketchyInput
              label="Full Name"
              placeholder="Jane Smith"
              value={newEmployee.name}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <SketchyInput
              label="Email"
              type="email"
              placeholder="jane@company.com"
              value={newEmployee.email}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <SketchyInput
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={newEmployee.phone}
              onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
            />

            <div className="flex flex-col gap-1.5">
              <label className="font-body text-sm font-medium text-[var(--uxsg-ink)] tracking-wide">
                Role :-
              </label>
              <select
                value={newEmployee.role}
                onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value }))}
                className="sketchy-input"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {addError && (
              <div className="sticky-note sticky-note-yellow p-3 text-sm animate-fade-in" style={{ transform: 'rotate(-0.5deg)' }}>
                <span className="font-handwritten">{addError}</span>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <SketchyButton type="button" variant="secondary" onClick={onClose}>
                Cancel
              </SketchyButton>
              <SketchyButton type="submit" variant="cta" fullWidth disabled={addLoading}>
                {addLoading ? 'Creating...' : 'Create Employee'}
              </SketchyButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
