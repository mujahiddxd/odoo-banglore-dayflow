import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await initDatabase();

    const today = new Date().toISOString().split('T')[0];

    // Check for an open check-in (no check-out)
    const openRecord = await queryOne<{ id: number; check_in: string }>(
      'SELECT id, check_in FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL',
      [session.userId, today]
    );

    if (openRecord) {
      return NextResponse.json({
        checkedIn: true,
        checkedOut: false,
        checkInTime: openRecord.check_in,
      });
    }

    // Check if already checked in and out today
    const closedRecord = await queryOne<{ id: number }>(
      'SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NOT NULL',
      [session.userId, today]
    );

    if (closedRecord) {
      return NextResponse.json({
        checkedIn: false,
        checkedOut: true,
      });
    }

    return NextResponse.json({
      checkedIn: false,
      checkedOut: false,
    });
  } catch (error) {
    console.error('Attendance status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
