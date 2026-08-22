import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canApproveTimeOff } from '@/lib/permissions';
import {
  getRequest,
  approveRequest,
  rejectRequest,
} from '@/lib/data/timeoff';
import { createNotification } from '@/lib/notifications';
import { sendLeaveStatusEmail } from '@/lib/email';
import { queryOne } from '@/lib/db';

// PATCH — Approve, reject, or cancel a time-off request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { requestId } = await params;
    const body = await request.json();
    const { action, comment = '' } = body;

    const req = getRequest(requestId);
    if (!req) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (action === 'cancel') {
      // Employee can cancel their own request
      if (req.employeeId !== user.employeeId && !canApproveTimeOff(user)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const result = cancelRequest(requestId, user.employeeId, user.name, comment);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    // Approve/Reject — only admin/HR
    if (!canApproveTimeOff(user)) {
      return NextResponse.json(
        { error: 'Forbidden: only admins can approve or reject requests' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      const result = approveRequest(requestId, user.employeeId, user.name, comment);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      // Send notification
      await createNotification(
        req.employeeId,
        'Leave Request Approved',
        `Your ${req.timeOffTypeName} request for ${req.days} days has been approved by ${user.name}.`,
        '/dashboard/timeoff'
      );
      // Send email
      const emp = await queryOne<{ email: string, name: string }>('SELECT email, name FROM employees WHERE employee_id = ?', [req.employeeId]);
      if (emp) {
        await sendLeaveStatusEmail(emp.email, emp.name, 'approved', req.timeOffTypeName, req.days, user.name);
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'reject') {
      const result = rejectRequest(requestId, user.employeeId, user.name, comment);
      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
      // Send notification
      await createNotification(
        req.employeeId,
        'Leave Request Rejected',
        `Your ${req.timeOffTypeName} request for ${req.days} days was rejected.`,
        '/dashboard/timeoff'
      );
      // Send email
      const emp = await queryOne<{ email: string, name: string }>('SELECT email, name FROM employees WHERE employee_id = ?', [req.employeeId]);
      if (emp) {
        await sendLeaveStatusEmail(emp.email, emp.name, 'rejected', req.timeOffTypeName, req.days, user.name);
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('TimeOff PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
