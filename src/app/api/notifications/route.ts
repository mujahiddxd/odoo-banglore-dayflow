import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query, execute } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';

    let sql = 'SELECT * FROM notifications WHERE employee_id = (SELECT id FROM employees WHERE employee_id = ?) ';
    let params: any[] = [user.employeeId];

    if (unreadOnly) {
      sql += 'AND is_read = FALSE ';
    }
    sql += 'ORDER BY created_at DESC LIMIT 50';

    const notifications = await query(sql, params);

    return NextResponse.json({
      success: true,
      notifications,
    });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await execute(
        'UPDATE notifications SET is_read = TRUE WHERE employee_id = (SELECT id FROM employees WHERE employee_id = ?)',
        [user.employeeId]
      );
      return NextResponse.json({ success: true });
    }

    if (notificationId) {
      await execute(
        'UPDATE notifications SET is_read = TRUE WHERE id = ? AND employee_id = (SELECT id FROM employees WHERE employee_id = ?)',
        [notificationId, user.employeeId]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Notifications PUT error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
