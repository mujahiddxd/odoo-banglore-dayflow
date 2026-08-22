// ============================================================
// Time Off Data Store (In-Memory for Hackathon Demo)
// ============================================================

import type {
  TimeOffType,
  TimeOffAllocation,
  TimeOffRequest,
  TimeOffRequestStatus,
  TimeOffApprovalAudit,
} from '../types';

// ---- Helper: generate unique ID ----
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ============================================================
// Time Off Types (configurable, not hard-coded)
// ============================================================

const timeOffTypes: Map<string, TimeOffType> = new Map([
  [
    'tot-001',
    {
      id: 'tot-001',
      name: 'Paid Time Off',
      description: 'Annual paid leave for personal use',
      isPaid: true,
      allocationRequired: true,
      maxAllocation: 30,
      allowNegativeBalance: false,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  [
    'tot-002',
    {
      id: 'tot-002',
      name: 'Sick Time Off',
      description: 'Leave for medical or health reasons',
      isPaid: true,
      allocationRequired: true,
      maxAllocation: 12,
      allowNegativeBalance: false,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
  [
    'tot-003',
    {
      id: 'tot-003',
      name: 'Unpaid Leave',
      description: 'Leave without pay for extended absence',
      isPaid: false,
      allocationRequired: false,
      maxAllocation: 90,
      allowNegativeBalance: true,
      active: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    },
  ],
]);

// ============================================================
// Time Off Allocations (per employee, per type, per year)
// ============================================================

const currentYear = new Date().getFullYear();
const now = new Date().toISOString();

const allocations: Map<string, TimeOffAllocation[]> = new Map([
  [
    'emp-001',
    [
      {
        id: 'alloc-001-pto',
        employeeId: 'emp-001',
        timeOffTypeId: 'tot-001',
        timeOffTypeName: 'Paid Time Off',
        year: currentYear,
        allocatedDays: 24,
        usedDays: 3,
        pendingDays: 0,
        remainingDays: 21,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'alloc-001-sick',
        employeeId: 'emp-001',
        timeOffTypeId: 'tot-002',
        timeOffTypeName: 'Sick Time Off',
        year: currentYear,
        allocatedDays: 7,
        usedDays: 1,
        pendingDays: 0,
        remainingDays: 6,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ],
  [
    'emp-002',
    [
      {
        id: 'alloc-002-pto',
        employeeId: 'emp-002',
        timeOffTypeId: 'tot-001',
        timeOffTypeName: 'Paid Time Off',
        year: currentYear,
        allocatedDays: 24,
        usedDays: 5,
        pendingDays: 2,
        remainingDays: 17,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'alloc-002-sick',
        employeeId: 'emp-002',
        timeOffTypeId: 'tot-002',
        timeOffTypeName: 'Sick Time Off',
        year: currentYear,
        allocatedDays: 7,
        usedDays: 1,
        pendingDays: 0,
        remainingDays: 6,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ],
  [
    'emp-003',
    [
      {
        id: 'alloc-003-pto',
        employeeId: 'emp-003',
        timeOffTypeId: 'tot-001',
        timeOffTypeName: 'Paid Time Off',
        year: currentYear,
        allocatedDays: 24,
        usedDays: 2,
        pendingDays: 1,
        remainingDays: 21,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'alloc-003-sick',
        employeeId: 'emp-003',
        timeOffTypeId: 'tot-002',
        timeOffTypeName: 'Sick Time Off',
        year: currentYear,
        allocatedDays: 7,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: 7,
        createdAt: now,
        updatedAt: now,
      },
    ],
  ],
]);

// ============================================================
// Time Off Requests (seed with sample data)
// ============================================================

const requests: TimeOffRequest[] = [
  {
    id: 'req-001',
    employeeId: 'emp-002',
    employeeName: 'Rahul Kumar',
    timeOffTypeId: 'tot-001',
    timeOffTypeName: 'Paid Time Off',
    startDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 7);
      return d.toISOString().split('T')[0];
    })(),
    endDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 8);
      return d.toISOString().split('T')[0];
    })(),
    days: 2,
    reason: 'Family function',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'req-002',
    employeeId: 'emp-003',
    employeeName: 'Ananya Patel',
    timeOffTypeId: 'tot-001',
    timeOffTypeName: 'Paid Time Off',
    startDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    })(),
    endDate: (() => {
      const d = new Date(); d.setDate(d.getDate() + 14);
      return d.toISOString().split('T')[0];
    })(),
    days: 1,
    reason: 'Personal work',
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'req-003',
    employeeId: 'emp-002',
    employeeName: 'Rahul Kumar',
    timeOffTypeId: 'tot-002',
    timeOffTypeName: 'Sick Time Off',
    startDate: (() => {
      const d = new Date(); d.setDate(d.getDate() - 10);
      return d.toISOString().split('T')[0];
    })(),
    endDate: (() => {
      const d = new Date(); d.setDate(d.getDate() - 10);
      return d.toISOString().split('T')[0];
    })(),
    days: 1,
    reason: 'Not feeling well',
    status: 'APPROVED',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 86400000).toISOString(),
  },
];

// ============================================================
// Approval Audit
// ============================================================

const approvalAudit: TimeOffApprovalAudit[] = [
  {
    id: 'audit-req-003',
    requestId: 'req-003',
    action: 'APPROVED',
    performedBy: 'emp-001',
    performedByName: 'Priya Sharma',
    timestamp: new Date(Date.now() - 11 * 86400000).toISOString(),
    comment: 'Get well soon',
  },
];

// ============================================================
// Helper: Calculate business days between dates
// ============================================================

export function calculateBusinessDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dow = current.getDay();
    if (dow !== 0 && dow !== 6) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
}

// ============================================================
// Time Off Type Functions
// ============================================================

export function getAllTimeOffTypes(): TimeOffType[] {
  return Array.from(timeOffTypes.values()).filter((t) => t.active);
}

export function getTimeOffType(id: string): TimeOffType | undefined {
  return timeOffTypes.get(id);
}

export function createTimeOffType(
  data: Omit<TimeOffType, 'id' | 'createdAt'>
): TimeOffType {
  const id = `tot-${uid()}`;
  const type: TimeOffType = { ...data, id, createdAt: new Date().toISOString() };
  timeOffTypes.set(id, type);
  return type;
}

export function updateTimeOffType(
  id: string,
  data: Partial<Omit<TimeOffType, 'id' | 'createdAt'>>
): TimeOffType | null {
  const existing = timeOffTypes.get(id);
  if (!existing) return null;
  const updated = { ...existing, ...data };
  timeOffTypes.set(id, updated);
  return updated;
}

// ============================================================
// Allocation Functions
// ============================================================

export function getAllocationsForEmployee(
  employeeId: string,
  year?: number
): TimeOffAllocation[] {
  const empAllocations = allocations.get(employeeId) ?? [];
  if (year) {
    return empAllocations.filter((a) => a.year === year);
  }
  return empAllocations;
}

export function createOrUpdateAllocation(
  employeeId: string,
  timeOffTypeId: string,
  allocatedDays: number,
  year?: number
): TimeOffAllocation {
  const targetYear = year ?? new Date().getFullYear();
  const type = timeOffTypes.get(timeOffTypeId);
  const typeName = type?.name ?? 'Unknown';

  const empAllocations = allocations.get(employeeId) ?? [];
  const existing = empAllocations.find(
    (a) => a.timeOffTypeId === timeOffTypeId && a.year === targetYear
  );

  if (existing) {
    existing.allocatedDays = allocatedDays;
    existing.remainingDays = allocatedDays - existing.usedDays - existing.pendingDays;
    existing.updatedAt = new Date().toISOString();
    return existing;
  }

  const newAlloc: TimeOffAllocation = {
    id: `alloc-${uid()}`,
    employeeId,
    timeOffTypeId,
    timeOffTypeName: typeName,
    year: targetYear,
    allocatedDays,
    usedDays: 0,
    pendingDays: 0,
    remainingDays: allocatedDays,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  empAllocations.push(newAlloc);
  allocations.set(employeeId, empAllocations);
  return newAlloc;
}

// ============================================================
// Time Off Request Functions
// ============================================================

export function getRequestsForEmployee(employeeId: string): TimeOffRequest[] {
  return requests
    .filter((r) => r.employeeId === employeeId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getAllRequests(filters?: {
  status?: TimeOffRequestStatus;
  timeOffTypeId?: string;
  employeeId?: string;
}): TimeOffRequest[] {
  let result = [...requests];

  if (filters?.status) {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters?.timeOffTypeId) {
    result = result.filter((r) => r.timeOffTypeId === filters.timeOffTypeId);
  }
  if (filters?.employeeId) {
    result = result.filter((r) => r.employeeId === filters.employeeId);
  }

  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRequest(id: string): TimeOffRequest | undefined {
  return requests.find((r) => r.id === id);
}

/**
 * Create a new time-off request. Days are calculated on the backend.
 */
export function createRequest(
  employeeId: string,
  employeeName: string,
  timeOffTypeId: string,
  startDate: string,
  endDate: string,
  reason: string
): { success: boolean; request?: TimeOffRequest; error?: string } {
  const type = timeOffTypes.get(timeOffTypeId);
  if (!type) {
    return { success: false, error: 'Invalid time off type' };
  }
  if (!type.active) {
    return { success: false, error: 'This time off type is not active' };
  }

  // Calculate days on the backend
  const days = calculateBusinessDays(startDate, endDate);
  if (days <= 0) {
    return { success: false, error: 'Invalid date range' };
  }

    // Check allocation balance
  if (type.allocationRequired) {
    const empAllocations = allocations.get(employeeId) ?? [];
    let alloc = empAllocations.find(
      (a) => a.timeOffTypeId === timeOffTypeId && a.year === new Date().getFullYear()
    );

    // Auto-allocate if they don't have one
    if (!alloc) {
      alloc = createOrUpdateAllocation(employeeId, timeOffTypeId, type.maxAllocation || 30);
    }

    if (!type.allowNegativeBalance && alloc.remainingDays < days) {
      return {
        success: false,
        error: `Insufficient balance. Available: ${alloc.remainingDays} days, Requested: ${days} days`,
      };
    }

    // Update pending days (not permanently deducted until approved)
    alloc.pendingDays += days;
    alloc.remainingDays = alloc.allocatedDays - alloc.usedDays - alloc.pendingDays;
    alloc.updatedAt = new Date().toISOString();
  }

  const request: TimeOffRequest = {
    id: `req-${uid()}`,
    employeeId,
    employeeName,
    timeOffTypeId,
    timeOffTypeName: type.name,
    startDate,
    endDate,
    days,
    reason,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  requests.push(request);
  return { success: true, request };
}

/**
 * Approve a time-off request. Deducts from allocation.
 */
export function approveRequest(
  requestId: string,
  approvedBy: string,
  approvedByName: string,
  comment: string = ''
): { success: boolean; error?: string } {
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Request not found' };
  if (req.status !== 'PENDING') {
    return { success: false, error: `Cannot approve a ${req.status} request` };
  }

  // Update allocation
  const empAllocations = allocations.get(req.employeeId) ?? [];
  const alloc = empAllocations.find(
    (a) => a.timeOffTypeId === req.timeOffTypeId && a.year === new Date().getFullYear()
  );

  if (alloc) {
    alloc.usedDays += req.days;
    alloc.pendingDays = Math.max(0, alloc.pendingDays - req.days);
    alloc.remainingDays = alloc.allocatedDays - alloc.usedDays - alloc.pendingDays;
    alloc.updatedAt = new Date().toISOString();
  }

  req.status = 'APPROVED';
  req.updatedAt = new Date().toISOString();

  approvalAudit.push({
    id: `audit-${uid()}`,
    requestId,
    action: 'APPROVED',
    performedBy: approvedBy,
    performedByName: approvedByName,
    timestamp: new Date().toISOString(),
    comment,
  });

  return { success: true };
}

/**
 * Reject a time-off request.
 */
export function rejectRequest(
  requestId: string,
  rejectedBy: string,
  rejectedByName: string,
  comment: string = ''
): { success: boolean; error?: string } {
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Request not found' };
  if (req.status !== 'PENDING') {
    return { success: false, error: `Cannot reject a ${req.status} request` };
  }

  // Restore pending days in allocation
  const empAllocations = allocations.get(req.employeeId) ?? [];
  const alloc = empAllocations.find(
    (a) => a.timeOffTypeId === req.timeOffTypeId && a.year === new Date().getFullYear()
  );

  if (alloc) {
    alloc.pendingDays = Math.max(0, alloc.pendingDays - req.days);
    alloc.remainingDays = alloc.allocatedDays - alloc.usedDays - alloc.pendingDays;
    alloc.updatedAt = new Date().toISOString();
  }

  req.status = 'REJECTED';
  req.updatedAt = new Date().toISOString();

  approvalAudit.push({
    id: `audit-${uid()}`,
    requestId,
    action: 'REJECTED',
    performedBy: rejectedBy,
    performedByName: rejectedByName,
    timestamp: new Date().toISOString(),
    comment,
  });

  return { success: true };
}

/**
 * Cancel a time-off request. If approved, restores allocation.
 */
export function cancelRequest(
  requestId: string,
  cancelledBy: string,
  cancelledByName: string,
  comment: string = ''
): { success: boolean; error?: string } {
  const req = requests.find((r) => r.id === requestId);
  if (!req) return { success: false, error: 'Request not found' };
  if (req.status === 'CANCELLED') {
    return { success: false, error: 'Request already cancelled' };
  }

  const empAllocations = allocations.get(req.employeeId) ?? [];
  const alloc = empAllocations.find(
    (a) => a.timeOffTypeId === req.timeOffTypeId && a.year === new Date().getFullYear()
  );

  if (alloc) {
    if (req.status === 'APPROVED') {
      // Restore used days
      alloc.usedDays = Math.max(0, alloc.usedDays - req.days);
    } else if (req.status === 'PENDING') {
      // Restore pending days
      alloc.pendingDays = Math.max(0, alloc.pendingDays - req.days);
    }
    alloc.remainingDays = alloc.allocatedDays - alloc.usedDays - alloc.pendingDays;
    alloc.updatedAt = new Date().toISOString();
  }

  req.status = 'CANCELLED';
  req.updatedAt = new Date().toISOString();

  approvalAudit.push({
    id: `audit-${uid()}`,
    requestId,
    action: 'CANCELLED',
    performedBy: cancelledBy,
    performedByName: cancelledByName,
    timestamp: new Date().toISOString(),
    comment,
  });

  return { success: true };
}

/**
 * Get approved leave dates for an employee in a given month.
 * Used by the attendance module to determine ON_LEAVE status.
 */
export function getApprovedLeaveDatesForMonth(
  employeeId: string,
  year: number,
  month: number // 1-indexed
): { date: string; type: string; isPaid: boolean }[] {
  const result: { date: string; type: string; isPaid: boolean }[] = [];
  const approvedRequests = requests.filter(
    (r) => r.employeeId === employeeId && r.status === 'APPROVED'
  );

  for (const req of approvedRequests) {
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    const current = new Date(start);
    const type = timeOffTypes.get(req.timeOffTypeId);

    while (current <= end) {
      if (
        current.getFullYear() === year &&
        current.getMonth() + 1 === month &&
        current.getDay() !== 0 &&
        current.getDay() !== 6
      ) {
        result.push({
          date: current.toISOString().split('T')[0],
          type: req.timeOffTypeName,
          isPaid: type?.isPaid ?? true,
        });
      }
      current.setDate(current.getDate() + 1);
    }
  }

  return result;
}

export function getApprovalAuditForRequest(requestId: string): TimeOffApprovalAudit[] {
  return approvalAudit.filter((a) => a.requestId === requestId);
}
