import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

import {
  getRequestsForEmployee,
  getAllRequests,
  createRequest,
  getAllTimeOffTypes,
} from '@/lib/data/timeoff';

// GET — Get time-off requests
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Admin/HR can view all requests with filters
    if (hasPermission(user.role, PERMISSIONS.VIEW_ANY_TIME_OFF)) {
      const status = searchParams.get('status') as any;
      const typeId = searchParams.get('typeId') ?? undefined;
      const employeeId = searchParams.get('employeeId') ?? undefined;

      const requests = getAllRequests({
        status: status || undefined,
        timeOffTypeId: typeId,
        employeeId,
      });

      return NextResponse.json({ success: true, data: requests });
    }

    // Employee: own requests only
    const requests = getRequestsForEmployee(user.employeeId);
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error('TimeOff GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create a new time-off request
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!hasPermission(user.role, PERMISSIONS.CREATE_TIME_OFF)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { timeOffTypeId, startDate, endDate, reason } = body;

    if (!timeOffTypeId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'timeOffTypeId, startDate, and endDate are required' },
        { status: 400 }
      );
    }

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return NextResponse.json(
        { error: 'Start date must be before or equal to end date' },
        { status: 400 }
      );
    }

    // Employee is ALWAYS taken from the authenticated session
    // NEVER trust frontend-supplied employeeId
    const employeeId = user.employeeId;
    const employeeName = user.name;

    const result = createRequest(
      employeeId,
      employeeName,
      timeOffTypeId,
      startDate,
      endDate,
      reason ?? ''
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(
      { success: true, data: result.request },
      { status: 201 }
    );
  } catch (error) {
    console.error('TimeOff POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
