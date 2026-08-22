// ============================================================
// Attendance Data Store (In-Memory for Hackathon Demo)
// ============================================================

import type {
  AttendanceRecord,
  AttendanceAuditEntry,
  AttendanceAuditAction,
  AttendanceStatus,
  ApprovedNetwork,
  MonthlyAttendanceSummary,
} from '../types';

// ---- Helper: generate unique ID ----
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ---- Approved Networks (seed with localhost for dev) ----

const approvedNetworks: Map<string, ApprovedNetwork> = new Map([
  [
    'net-001',
    {
      id: 'net-001',
      companyId: 'company-001',
      officeId: 'office-001',
      officeName: 'Bangalore HQ',
      networkName: 'Office WiFi',
      ipv4: '127.0.0.1',
      cidr: '127.0.0.0/8',
      ipv6: '::1',
      enabled: true,
      validFrom: '2024-01-01',
      validUntil: '2030-12-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  [
    'net-002',
    {
      id: 'net-002',
      companyId: 'company-001',
      officeId: 'office-001',
      officeName: 'Bangalore HQ',
      networkName: 'Office LAN',
      ipv4: '192.168.1.1',
      cidr: '192.168.1.0/24',
      ipv6: '',
      enabled: true,
      validFrom: '2024-01-01',
      validUntil: '2030-12-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// ---- Attendance Records (seed with sample data) ----

function createSeedAttendance(): Map<string, AttendanceRecord[]> {
  const store = new Map<string, AttendanceRecord[]>();
  const employees = ['emp-001', 'emp-002', 'emp-003'];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed

  for (const empId of employees) {
    const records: AttendanceRecord[] = [];

    // Seed past 15 working days of the current month
    for (let day = 1; day <= Math.min(now.getDate() - 1, 28); day++) {
      const date = new Date(year, month, day);
      const dow = date.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends

      const dateStr = date.toISOString().split('T')[0];
      const checkInHour = 9 + Math.floor(Math.random() * 1); // 9:00-9:59
      const checkInMin = Math.floor(Math.random() * 30);
      const checkOutHour = 17 + Math.floor(Math.random() * 2); // 17:00-18:59
      const checkOutMin = Math.floor(Math.random() * 60);

      const checkIn = new Date(year, month, day, checkInHour, checkInMin);
      const checkOut = new Date(year, month, day, checkOutHour, checkOutMin);
      const totalMin = Math.floor((checkOut.getTime() - checkIn.getTime()) / 60000);
      const breakMin = 60; // 1 hour break
      const workMin = totalMin - breakMin;
      const extraMin = Math.max(0, workMin - 480); // 8h = 480min standard

      records.push({
        id: `att-${empId}-${dateStr}`,
        employeeId: empId,
        date: dateStr,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        workingMinutes: workMin,
        breakMinutes: breakMin,
        extraMinutes: extraMin,
        status: 'CHECKED_OUT',
        ipAddress: '127.0.0.1',
        networkId: 'net-001',
        officeId: 'office-001',
        createdAt: checkIn.toISOString(),
        updatedAt: checkOut.toISOString(),
      });
    }

    store.set(empId, records);
  }

  return store;
}

const attendanceStore = createSeedAttendance();

// ---- Attendance Audit ----

const auditStore: AttendanceAuditEntry[] = [];

// ============================================================
// CIDR / Network Matching
// ============================================================

function ipToLong(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function cidrMatch(ip: string, cidr: string): boolean {
  // Handle IPv6 loopback
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    if (cidr.startsWith('127.') || cidr === '::1') return true;
  }

  // Strip IPv6-mapped IPv4 prefix
  const cleanIp = ip.replace('::ffff:', '');

  // Check simple IPv4 match
  const parts = cidr.split('/');
  const networkIp = parts[0];
  const prefixLen = parts.length > 1 ? parseInt(parts[1], 10) : 32;

  // Validate IPv4
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIp)) return false;
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(networkIp)) return false;

  const ipLong = ipToLong(cleanIp);
  const netLong = ipToLong(networkIp);
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;

  return (ipLong & mask) === (netLong & mask);
}

/**
 * Check if an IP matches any active approved network.
 * Returns the matched network or null.
 */
export function matchApprovedNetwork(ip: string): ApprovedNetwork | null {
  const now = new Date().toISOString().split('T')[0];

  for (const network of approvedNetworks.values()) {
    if (!network.enabled) continue;
    if (network.validFrom > now || network.validUntil < now) continue;

    // Check IPv6 match
    if (network.ipv6 && ip === network.ipv6) return network;

    // Check CIDR match
    if (network.cidr && cidrMatch(ip, network.cidr)) return network;

    // Check exact IPv4 match
    const cleanIp = ip.replace('::ffff:', '');
    if (network.ipv4 === cleanIp) return network;
  }

  return null;
}

/**
 * Check if network verification should be enforced.
 * In development, can be disabled via env var.
 */
export function isNetworkCheckEnabled(): boolean {
  return process.env.ATTENDANCE_NETWORK_CHECK !== 'false';
}

// ============================================================
// Attendance Data Access Functions
// ============================================================

/**
 * Get today's attendance status for an employee.
 */
export function getAttendanceStatus(
  employeeId: string
): { status: AttendanceStatus; record: AttendanceRecord | null } {
  const today = new Date().toISOString().split('T')[0];
  const records = attendanceStore.get(employeeId) ?? [];
  const todayRecord = records.find((r) => r.date === today);

  if (!todayRecord) {
    return { status: 'NOT_CHECKED_IN', record: null };
  }

  return { status: todayRecord.status, record: todayRecord };
}

/**
 * Get all attendance records for an employee for a specific month.
 */
export function getAttendanceForMonth(
  employeeId: string,
  year: number,
  month: number // 1-indexed
): AttendanceRecord[] {
  const records = attendanceStore.get(employeeId) ?? [];
  return records
    .filter((r) => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get attendance records for ALL employees on a specific date.
 */
export function getAttendanceForDate(date: string): AttendanceRecord[] {
  const result: AttendanceRecord[] = [];
  for (const records of attendanceStore.values()) {
    const match = records.find((r) => r.date === date);
    if (match) result.push(match);
  }
  return result;
}

/**
 * Get all attendance records for all employees for a month (admin view).
 */
export function getAllAttendanceForMonth(
  year: number,
  month: number
): AttendanceRecord[] {
  const result: AttendanceRecord[] = [];
  for (const records of attendanceStore.values()) {
    for (const r of records) {
      const d = new Date(r.date);
      if (d.getFullYear() === year && d.getMonth() + 1 === month) {
        result.push(r);
      }
    }
  }
  return result.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Check in an employee. Enforces state machine.
 */
export function checkIn(
  employeeId: string,
  ipAddress: string,
  userAgent: string
): {
  success: boolean;
  record?: AttendanceRecord;
  error?: string;
  auditAction: AttendanceAuditAction;
} {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const records = attendanceStore.get(employeeId) ?? [];
  const existing = records.find((r) => r.date === today);

  // Check for duplicate check-in
  if (existing) {
    if (existing.status === 'CHECKED_IN') {
      addAudit(employeeId, 'ALREADY_CHECKED_IN', ipAddress, null, null, false, 'Already checked in today', userAgent);
      return { success: false, error: 'Already checked in today', auditAction: 'ALREADY_CHECKED_IN' };
    }
    if (existing.status === 'CHECKED_OUT') {
      addAudit(employeeId, 'ALREADY_CHECKED_OUT', ipAddress, null, null, false, 'Already checked out today', userAgent);
      return { success: false, error: 'Already completed attendance for today', auditAction: 'ALREADY_CHECKED_OUT' };
    }
  }

  // Network check
  if (isNetworkCheckEnabled()) {
    const network = matchApprovedNetwork(ipAddress);
    if (!network) {
      addAudit(employeeId, 'INVALID_NETWORK', ipAddress, null, null, false, 'Not on approved company network', userAgent);
      return {
        success: false,
        error: 'Attendance can only be marked from an approved company network.',
        auditAction: 'INVALID_NETWORK',
      };
    }

    // Create attendance record with network info
    const record: AttendanceRecord = {
      id: `att-${uid()}`,
      employeeId,
      date: today,
      checkIn: now,
      checkOut: null,
      workingMinutes: 0,
      breakMinutes: 0,
      extraMinutes: 0,
      status: 'CHECKED_IN',
      ipAddress,
      networkId: network.id,
      officeId: network.officeId,
      createdAt: now,
      updatedAt: now,
    };

    records.push(record);
    attendanceStore.set(employeeId, records);
    addAudit(employeeId, 'CHECK_IN_SUCCESS', ipAddress, network.id, network.officeId, true, null, userAgent);
    return { success: true, record, auditAction: 'CHECK_IN_SUCCESS' };
  }

  // Network check disabled (dev mode)
  const record: AttendanceRecord = {
    id: `att-${uid()}`,
    employeeId,
    date: today,
    checkIn: now,
    checkOut: null,
    workingMinutes: 0,
    breakMinutes: 0,
    extraMinutes: 0,
    status: 'CHECKED_IN',
    ipAddress,
    networkId: null,
    officeId: null,
    createdAt: now,
    updatedAt: now,
  };

  records.push(record);
  attendanceStore.set(employeeId, records);
  addAudit(employeeId, 'CHECK_IN_SUCCESS', ipAddress, null, null, true, null, userAgent);
  return { success: true, record, auditAction: 'CHECK_IN_SUCCESS' };
}

/**
 * Check out an employee. Calculates hours.
 */
export function checkOut(
  employeeId: string,
  ipAddress: string,
  userAgent: string,
  breakTimeHours: number = 1,
  standardWorkHours: number = 8
): {
  success: boolean;
  record?: AttendanceRecord;
  error?: string;
  auditAction: AttendanceAuditAction;
} {
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toISOString();
  const records = attendanceStore.get(employeeId) ?? [];
  const existing = records.find((r) => r.date === today);

  if (!existing || existing.status !== 'CHECKED_IN') {
    addAudit(employeeId, 'CHECK_OUT_FAILED', ipAddress, null, null, false, 'No active check-in found', userAgent);
    return { success: false, error: 'No active check-in found', auditAction: 'CHECK_OUT_FAILED' };
  }

  const checkInTime = new Date(existing.checkIn!).getTime();
  const checkOutTime = new Date(now).getTime();
  const totalMinutes = Math.floor((checkOutTime - checkInTime) / 60000);
  const breakMinutes = breakTimeHours * 60;
  const workingMinutes = Math.max(0, totalMinutes - breakMinutes);
  const standardMinutes = standardWorkHours * 60;
  const extraMinutes = Math.max(0, workingMinutes - standardMinutes);

  existing.checkOut = now;
  existing.workingMinutes = workingMinutes;
  existing.breakMinutes = breakMinutes;
  existing.extraMinutes = extraMinutes;
  existing.status = 'CHECKED_OUT';
  existing.updatedAt = now;

  addAudit(employeeId, 'CHECK_OUT_SUCCESS', ipAddress, existing.networkId, existing.officeId, true, null, userAgent);
  return { success: true, record: existing, auditAction: 'CHECK_OUT_SUCCESS' };
}

/**
 * Calculate monthly attendance summary for an employee.
 */
export function getMonthlyAttendanceSummary(
  employeeId: string,
  year: number,
  month: number,
  workingDaysPerWeek: number = 5
): MonthlyAttendanceSummary {
  const records = getAttendanceForMonth(employeeId, year, month);
  const now = new Date();

  // Count working days in the month (up to today or end of month)
  const daysInMonth = new Date(year, month, 0).getDate();
  const lastDay = year === now.getFullYear() && month === now.getMonth() + 1
    ? Math.min(now.getDate(), daysInMonth)
    : daysInMonth;

  let workingDays = 0;
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    // Mon-Fri for 5-day week, Mon-Sat for 6-day
    if (workingDaysPerWeek >= 6) {
      if (dow !== 0) workingDays++;
    } else {
      if (dow !== 0 && dow !== 6) workingDays++;
    }
  }

  const daysPresent = records.filter(
    (r) => r.status === 'CHECKED_OUT' || r.status === 'CHECKED_IN'
  ).length;

  const totalWorkingMinutes = records.reduce((sum, r) => sum + r.workingMinutes, 0);
  const totalExtraMinutes = records.reduce((sum, r) => sum + r.extraMinutes, 0);

  // Absent = working days - present - approved leave (leave will be calculated separately)
  const absentDays = Math.max(0, workingDays - daysPresent);

  return {
    daysPresent,
    workingDays,
    absentDays,
    approvedLeave: 0, // Will be filled by the API layer integrating with time-off
    totalWorkingMinutes,
    totalExtraMinutes,
  };
}

// ---- Audit Helpers ----

function addAudit(
  employeeId: string,
  action: AttendanceAuditAction,
  ipAddress: string,
  networkId: string | null,
  officeId: string | null,
  success: boolean,
  failureReason: string | null,
  userAgent: string
): void {
  auditStore.push({
    id: `audit-${uid()}`,
    employeeId,
    action,
    timestamp: new Date().toISOString(),
    ipAddress,
    networkId,
    officeId,
    success,
    failureReason,
    userAgent,
  });
}

export function getAuditLog(employeeId?: string): AttendanceAuditEntry[] {
  if (employeeId) {
    return auditStore.filter((a) => a.employeeId === employeeId);
  }
  return [...auditStore];
}

// ============================================================
// Network Management (Admin CRUD)
// ============================================================

export function getAllNetworks(): ApprovedNetwork[] {
  return Array.from(approvedNetworks.values());
}

export function getNetwork(id: string): ApprovedNetwork | undefined {
  return approvedNetworks.get(id);
}

export function addNetwork(
  data: Omit<ApprovedNetwork, 'id' | 'createdAt' | 'updatedAt'>
): ApprovedNetwork {
  const id = `net-${uid()}`;
  const now = new Date().toISOString();
  const network: ApprovedNetwork = { ...data, id, createdAt: now, updatedAt: now };
  approvedNetworks.set(id, network);
  return network;
}

export function updateNetwork(
  id: string,
  data: Partial<Omit<ApprovedNetwork, 'id' | 'createdAt'>>
): ApprovedNetwork | null {
  const existing = approvedNetworks.get(id);
  if (!existing) return null;
  const updated: ApprovedNetwork = {
    ...existing,
    ...data,
    updatedAt: new Date().toISOString(),
  };
  approvedNetworks.set(id, updated);
  return updated;
}

export function deleteNetwork(id: string): boolean {
  return approvedNetworks.delete(id);
}
