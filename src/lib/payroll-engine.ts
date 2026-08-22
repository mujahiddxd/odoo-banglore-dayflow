// ============================================================
// Payroll Integration Engine
// ============================================================
// Calculates payable days by combining:
//   - Working schedule
//   - Attendance records
//   - Approved time off
//   - Holiday configuration (future)

import type { PayableDaysSummary } from './types';
import { getAttendanceForMonth } from './data/attendance';
import { getApprovedLeaveDatesForMonth } from './data/timeoff';
import { getSalaryConfig } from './data/salary';

/**
 * Calculate payable days summary for an employee for a given month.
 * This is the authoritative calculation for payroll.
 */
export function calculatePayableDays(
  employeeId: string,
  year: number,
  month: number // 1-indexed
): PayableDaysSummary {
  const salaryConfig = getSalaryConfig(employeeId);
  const workingDaysPerWeek = salaryConfig?.workingDaysPerWeek ?? 5;

  // 1. Calendar days
  const calendarDays = new Date(year, month, 0).getDate();

  // 2. Working days (exclude weekends based on schedule)
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;
  const lastDay = isCurrentMonth ? Math.min(now.getDate(), calendarDays) : calendarDays;

  let workingDays = 0;
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    if (workingDaysPerWeek >= 6) {
      if (dow !== 0) workingDays++; // Sun off only
    } else {
      if (dow !== 0 && dow !== 6) workingDays++; // Sat+Sun off
    }
  }

  // 3. Attendance records
  const attendance = getAttendanceForMonth(employeeId, year, month);
  const presentDays = attendance.filter(
    (r) => r.status === 'CHECKED_OUT' || r.status === 'CHECKED_IN'
  ).length;
  const totalWorkingMinutes = attendance.reduce((sum, r) => sum + r.workingMinutes, 0);
  const totalExtraMinutes = attendance.reduce((sum, r) => sum + r.extraMinutes, 0);

  // 4. Approved leave
  const leaveDates = getApprovedLeaveDatesForMonth(employeeId, year, month);
  const paidLeaveDays = leaveDates.filter((l) => l.isPaid).length;
  const unpaidLeaveDays = leaveDates.filter((l) => !l.isPaid).length;

  // 5. Absent days (working days with no attendance AND no approved leave)
  const attendanceDates = new Set(attendance.map((r) => r.date));
  const leaveDateSet = new Set(leaveDates.map((l) => l.date));

  let absentDays = 0;
  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const dateStr = date.toISOString().split('T')[0];

    // Skip non-working days
    if (workingDaysPerWeek >= 6) {
      if (dow === 0) continue;
    } else {
      if (dow === 0 || dow === 6) continue;
    }

    // Skip future days in the current month
    if (isCurrentMonth && d >= now.getDate()) continue;

    // If not present and not on leave → absent
    if (!attendanceDates.has(dateStr) && !leaveDateSet.has(dateStr)) {
      absentDays++;
    }
  }

  // 6. Payable days = present + paid leave days
  const payableDays = presentDays + paidLeaveDays;

  return {
    month,
    year,
    calendarDays,
    workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    absentDays,
    payableDays,
    totalWorkingMinutes,
    totalExtraMinutes,
  };
}
