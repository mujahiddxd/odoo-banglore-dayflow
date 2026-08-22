import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAttendanceStatus } from '@/lib/data/attendance';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Always use authenticated user's employeeId
    const { status, record } = getAttendanceStatus(user.employeeId);

    return NextResponse.json({
      success: true,
      status,
      checkedIn: status === 'CHECKED_IN',
      checkedOut: status === 'CHECKED_OUT',
      checkInTime: record?.checkIn ?? null,
      checkOutTime: record?.checkOut ?? null,
      workingMinutes: record?.workingMinutes ?? 0,
      breakMinutes: record?.breakMinutes ?? 0,
      extraMinutes: record?.extraMinutes ?? 0,
    });
  } catch (error) {
    console.error('Attendance status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
