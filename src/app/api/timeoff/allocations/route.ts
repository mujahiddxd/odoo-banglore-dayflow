import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS, canManageAllocations } from '@/lib/permissions';
import {
  getAllocationsForEmployee,
  createOrUpdateAllocation,
} from '@/lib/data/timeoff';

// GET — Get time-off allocations for an employee
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetEmployeeId = searchParams.get('employeeId') ?? user.employeeId;
    const year = searchParams.get('year')
      ? parseInt(searchParams.get('year')!, 10)
      : new Date().getFullYear();

    // Authorization: employee can only view own allocations
    if (targetEmployeeId !== user.employeeId) {
      if (!hasPermission(user.role, PERMISSIONS.VIEW_ANY_TIME_OFF)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const allocs = getAllocationsForEmployee(targetEmployeeId, year);
    return NextResponse.json({ success: true, data: allocs });
  } catch (error) {
    console.error('Allocations GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create or update an allocation (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageAllocations(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { employeeId, timeOffTypeId, allocatedDays, year } = body;

    if (!employeeId || !timeOffTypeId || allocatedDays == null) {
      return NextResponse.json(
        { error: 'employeeId, timeOffTypeId, and allocatedDays are required' },
        { status: 400 }
      );
    }

    const allocation = createOrUpdateAllocation(
      employeeId,
      timeOffTypeId,
      allocatedDays,
      year
    );

    return NextResponse.json({ success: true, data: allocation });
  } catch (error) {
    console.error('Allocations POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
