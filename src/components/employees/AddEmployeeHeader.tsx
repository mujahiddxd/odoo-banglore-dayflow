'use client';

import React, { useState } from 'react';
import SketchyButton from '@/components/SketchyButton';
import { AddEmployeeModal } from './AddEmployeeModal';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/lib/types';

interface AddEmployeeHeaderProps {
  user: AuthUser;
}

export function AddEmployeeHeader({ user }: AddEmployeeHeaderProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const router = useRouter();

  const canAdd = user.role.toLowerCase() === 'admin' || user.role.toLowerCase() === 'hr' || user.email === 'admin@dayflow.in';

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="font-headline text-4xl font-bold mb-2">Employees</h1>
        <p className="font-body text-base opacity-60">
          Manage and view all employee profiles.
        </p>
      </div>
      
      {canAdd && (
        <SketchyButton variant="primary" onClick={() => setShowAddModal(true)}>
          + New
        </SketchyButton>
      )}

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
