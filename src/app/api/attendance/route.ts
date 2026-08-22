import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, query, queryOne, execute } from '@/lib/db';

// GET — Get attendance records
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await initDatabase();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const date = searchParams.get('date');

    let sql = '';
    let params: any[] = [];

    if (session.role === 'admin' || session.role === 'hr') {
      // Admin can view all employees' attendance
      sql = `SELECT a.*, e.name as employee_name, e.employee_id as emp_code 
             FROM attendance a 
             JOIN employees e ON a.employee_id = e.id 
             WHERE e.company_id = ?`;
      params = [session.companyId];

      if (employeeId) {
        sql += ' AND a.employee_id = ?';
        params.push(employeeId);
      }
    } else {
      // Employee can only view own attendance
      sql = `SELECT a.*, e.name as employee_name, e.employee_id as emp_code 
             FROM attendance a 
             JOIN employees e ON a.employee_id = e.id 
             WHERE a.employee_id = ?`;
      params = [session.userId];
    }

    if (date) {
      sql += ' AND a.date = ?';
      params.push(date);
    }

    sql += ' ORDER BY a.date DESC, a.check_in DESC LIMIT 50';

    const records = await query(sql, params);
    return NextResponse.json({ attendance: records });
  } catch (error) {
    console.error('Attendance GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Check in or check out
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await initDatabase();

    const body = await request.json();
    const { action } = body; // 'check-in' or 'check-out'

    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (action === 'check-in') {
      // Check if already checked in today
      const existing = await queryOne(
        'SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL',
        [session.userId, today]
      );

      if (existing) {
        return NextResponse.json(
          { error: 'Already checked in today' },
          { status: 400 }
        );
      }

      await execute(
        'INSERT INTO attendance (employee_id, check_in, date) VALUES (?, ?, ?)',
        [session.userId, now, today]
      );

      return NextResponse.json({
        success: true,
        checkInTime: new Date().toISOString(),
      });
    } else if (action === 'check-out') {
      // Find today's open attendance record
      const record = await queryOne<{ id: number }>(
        'SELECT id FROM attendance WHERE employee_id = ? AND date = ? AND check_out IS NULL',
        [session.userId, today]
      );

      if (!record) {
        return NextResponse.json(
          { error: 'No active check-in found' },
          { status: 400 }
        );
      }

      await execute(
        'UPDATE attendance SET check_out = ? WHERE id = ?',
        [now, record.id]
      );

      return NextResponse.json({
        success: true,
        checkOutTime: new Date().toISOString(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Attendance POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
