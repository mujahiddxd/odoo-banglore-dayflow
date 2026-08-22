import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getMonthlyAttendanceSummary } from '@/lib/data/attendance';
import { getApprovedLeaveDatesForMonth } from '@/lib/data/timeoff';
import { getSalaryConfig } from '@/lib/data/salary';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

// GET — Monthly attendance summary
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const now = new Date();
    const year = parseInt(searchParams.get('year') ?? String(now.getFullYear()), 10);
    const month = parseInt(searchParams.get('month') ?? String(now.getMonth() + 1), 10);
    const targetEmployeeId = searchParams.get('employeeId') ?? user.employeeId;

    // Authorization: employee can only view own; admin can view any
    if (targetEmployeeId !== user.employeeId) {
      if (!hasPermission(user.role, PERMISSIONS.VIEW_ANY_ATTENDANCE)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Get working days config from salary
    const salaryConfig = getSalaryConfig(targetEmployeeId);
    const workingDaysPerWeek = salaryConfig?.workingDaysPerWeek ?? 5;

    // Get attendance summary
    const summary = getMonthlyAttendanceSummary(
      targetEmployeeId,
      year,
      month,
      workingDaysPerWeek
    );

    // Get approved leave days for the month
    const leaveDates = getApprovedLeaveDatesForMonth(targetEmployeeId, year, month);
    const paidLeaveDays = leaveDates.filter((l) => l.isPaid).length;
    const unpaidLeaveDays = leaveDates.filter((l) => !l.isPaid).length;

    // Adjust absent days by subtracting approved leave
    const adjustedAbsentDays = Math.max(
      0,
      summary.absentDays - paidLeaveDays - unpaidLeaveDays
    );

    return NextResponse.json({
      success: true,
      data: {
        ...summary,
        approvedLeave: paidLeaveDays + unpaidLeaveDays,
        paidLeaveDays,
        unpaidLeaveDays,
        absentDays: adjustedAbsentDays,
        payableDays: summary.daysPresent + paidLeaveDays,
      },
    });
  } catch (error) {
    console.error('Attendance summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
