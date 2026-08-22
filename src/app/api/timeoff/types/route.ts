import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canManageTimeOffTypes } from '@/lib/permissions';
import {
  getAllTimeOffTypes,
  createTimeOffType,
  updateTimeOffType,
} from '@/lib/data/timeoff';

// GET — List all active time-off types (available to all authenticated users)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const types = getAllTimeOffTypes();
    return NextResponse.json({ success: true, data: types });
  } catch (error) {
    console.error('TimeOff types GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create a new time-off type (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageTimeOffTypes(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name,
      description = '',
      isPaid = true,
      allocationRequired = true,
      maxAllocation = 30,
      allowNegativeBalance = false,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const type = createTimeOffType({
      name,
      description,
      isPaid,
      allocationRequired,
      maxAllocation,
      allowNegativeBalance,
      active: true,
    });

    return NextResponse.json({ success: true, data: type }, { status: 201 });
  } catch (error) {
    console.error('TimeOff types POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT — Update a time-off type (admin only)
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (!canManageTimeOffTypes(user)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Time off type ID is required' },
        { status: 400 }
      );
    }

    const type = updateTimeOffType(id, data);
    if (!type) {
      return NextResponse.json(
        { error: 'Time off type not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: type });
  } catch (error) {
    console.error('TimeOff types PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
