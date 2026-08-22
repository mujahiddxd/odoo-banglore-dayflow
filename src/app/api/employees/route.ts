<<<<<<< HEAD
// GET /api/employees — List employees (Admin only for full list)
import { getCurrentUser } from '@/lib/auth';
import { getAllEmployees } from '@/lib/data/employees';
import { canViewEmployees } from '@/lib/permissions';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  if (!canViewEmployees(user)) {
    return Response.json(
      { success: false, error: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
  }

  const employees = getAllEmployees();
  return Response.json({ success: true, data: employees });
=======
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession } from '@/lib/auth';
import { initDatabase, query, execute } from '@/lib/db';
import { generateEmployeeId, generateRandomPassword } from '@/lib/employee-id';

// GET — List all employees for the current user's company
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await initDatabase();

    const today = new Date().toISOString().split('T')[0];

    const employees = await query<{
      id: number;
      employee_id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      avatar: string;
      created_at: string;
    }>(
      'SELECT id, employee_id, name, email, phone, role, avatar, created_at FROM employees WHERE company_id = ? ORDER BY created_at DESC',
      [session.companyId]
    );

    // Get today's attendance for each employee
    const attendance = await query<{
      employee_id: number;
      check_in: string;
      check_out: string;
    }>(
      `SELECT a.employee_id, a.check_in, a.check_out
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE e.company_id = ? AND a.date = ?`,
      [session.companyId, today]
    );

    const attendanceMap = new Map(
      attendance.map((a) => [a.employee_id, a])
    );

    const employeesWithStatus = employees.map((emp) => {
      const att = attendanceMap.get(emp.id);
      let status: 'present' | 'leave' | 'absent' = 'absent';
      if (att?.check_in && !att?.check_out) {
        status = 'present';
      } else if (att?.check_in && att?.check_out) {
        status = 'present';
      }
      return { ...emp, status };
    });

    return NextResponse.json({ employees: employeesWithStatus });
  } catch (error) {
    console.error('Employees GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create a new employee (Admin/HR only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    if (session.role !== 'admin' && session.role !== 'hr') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await initDatabase();

    const body = await request.json();
    const { name, email, phone, role = 'employee' } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Generate employee ID and random password
    const employeeId = await generateEmployeeId(name);
    const randomPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const result = await execute(
      'INSERT INTO employees (employee_id, company_id, name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [employeeId, session.companyId, name, email, phone || null, passwordHash, role]
    );

    return NextResponse.json({
      success: true,
      employee: {
        id: result.insertId,
        employeeId,
        name,
        email,
        role,
      },
      generatedPassword: randomPassword,
      generatedId: employeeId,
    });
  } catch (error: any) {
    console.error('Employees POST error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'An employee with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
>>>>>>> origin/main
}
