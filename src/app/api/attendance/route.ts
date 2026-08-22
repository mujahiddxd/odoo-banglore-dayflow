import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getAttendanceForMonth,
  getAllAttendanceForMonth,
  checkIn,
  checkOut,
  getAttendanceStatus as getStatus,
} from '@/lib/data/attendance';
import { getApprovedLeaveDatesForMonth } from '@/lib/data/timeoff';
import { getSalaryConfig } from '@/lib/data/salary';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { query, queryOne } from '@/lib/db';

/**
 * Extract the real client IP from request headers.
 * NEVER trust frontend-supplied IP.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  // Fallback for local development
  return '127.0.0.1';
}

// GET — Get attendance records for a month
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
    const filterEmployeeId = searchParams.get('employeeId');

    // Admin can view all; Employee can view own only
    if (hasPermission(user.role, PERMISSIONS.VIEW_ANY_ATTENDANCE)) {
      if (filterEmployeeId) {
        // Admin viewing a specific employee
        const records = getAttendanceForMonth(filterEmployeeId, year, month);
        const leaveDates = getApprovedLeaveDatesForMonth(filterEmployeeId, year, month);
        const emp = await queryOne<{ name: string }>('SELECT name FROM employees WHERE employee_id = ?', [filterEmployeeId]);
        return NextResponse.json({
          success: true,
          data: {
            records: records.map((r) => ({ ...r, employeeName: emp?.name ?? '' })),
            leaveDates,
          },
        });
      }
      // Admin viewing all employees
      const dbEmployees = await query<{ employee_id: string, name: string, department: string }>('SELECT employee_id, name, department FROM employees');
      const empMap = new Map(dbEmployees.map((e) => [e.employee_id, e]));

      const records = getAllAttendanceForMonth(year, month);
      const enriched = records.map((r) => {
        const emp = empMap.get(r.employeeId);
        return { ...r, employeeName: emp?.name ?? '', department: emp?.department ?? '' };
      });
      return NextResponse.json({ success: true, data: { records: enriched } });
    }

    // Employee: own records only
    const records = getAttendanceForMonth(user.employeeId, year, month);
    const leaveDates = getApprovedLeaveDatesForMonth(user.employeeId, year, month);
    return NextResponse.json({
      success: true,
      data: { records, leaveDates },
    });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Check in or check out
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'check-in' or 'check-out'
    const ipAddress = getClientIp(request);
    const userAgent = request.headers.get('user-agent') ?? '';

    // Always use the authenticated user's employeeId — NEVER trust frontend
    const employeeId = user.employeeId;

    if (action === 'check-in') {
      if (!hasPermission(user.role, PERMISSIONS.CHECK_IN)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const result = checkIn(employeeId, ipAddress, userAgent);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, auditAction: result.auditAction },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        checkInTime: result.record!.checkIn,
        record: result.record,
      });
    }

    if (action === 'check-out') {
      if (!hasPermission(user.role, PERMISSIONS.CHECK_OUT)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      // Get employee's break time from salary config
      const salaryConfig = getSalaryConfig(employeeId);
      const breakTimeHours = salaryConfig?.breakTimeHours ?? 1;

      const result = checkOut(employeeId, ipAddress, userAgent, breakTimeHours);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error, auditAction: result.auditAction },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        checkOutTime: result.record!.checkOut,
        record: result.record,
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
