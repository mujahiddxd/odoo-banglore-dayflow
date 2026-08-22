import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSession, getCurrentUser } from '@/lib/auth';
import { initDatabase, query, execute } from '@/lib/db';
import { generateEmployeeId, generateRandomPassword } from '@/lib/employee-id';
import { sendWelcomeEmail } from '@/lib/email';

import { canViewEmployees } from '@/lib/permissions';

import { getAttendanceStatus } from '@/lib/data/attendance';
import { getApprovedLeaveDatesForMonth } from '@/lib/data/timeoff';

// GET — List all employees (Admin/HR only)
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = canViewEmployees(user);

    await initDatabase();
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const todayStr = now.toISOString().split('T')[0];

    const employees = await query<any>(
      "SELECT id, employee_id, name, email, phone, role, avatar, profile_picture, position, department, created_at FROM employees WHERE role != 'admin' ORDER BY created_at DESC"
    );

    const employeesWithStatus = employees.map((emp) => {
      const att = getAttendanceStatus(emp.employee_id);
      
      let status: 'present' | 'leave' | 'absent' = 'absent';
      
      if (att.status === 'CHECKED_IN' || att.status === 'CHECKED_OUT') {
        status = 'present';
      } else {
        const leaveDates = getApprovedLeaveDatesForMonth(emp.employee_id, year, month);
        if (leaveDates.some(l => l.date === todayStr)) {
          status = 'leave';
        }
      }
      
      const avatar = emp.profile_picture || emp.avatar || '';
      
      if (!isAdmin) {
        return {
          id: emp.id,
          employee_id: emp.employee_id,
          name: emp.name,
          avatar,
          status,
          role: emp.role,
        };
      }
      
      return { 
        ...emp, 
        status,
        avatar
      };
    });

    return NextResponse.json({
      success: true,
      data: employeesWithStatus,
      employees: employeesWithStatus,
    });
  } catch (error) {
    console.error('Employees GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// POST — Create a new employee (Admin/HR only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userRole = session.role?.toLowerCase();
    const isSeedAdmin = session.email === 'admin@dayflow.in';
    const canCreate = isSeedAdmin || (userRole === 'admin' || userRole === 'hr');

    if (!canCreate) {
      return NextResponse.json({ error: 'Forbidden: Regular employees cannot add new employees' }, { status: 403 });
    }

    await initDatabase();

    const body = await request.json();
    const { name, email, phone, role = 'employee', position = '', department = '' } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const employeeId = await generateEmployeeId(name);
    const randomPassword = generateRandomPassword();
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const result = await execute(
      'INSERT INTO employees (employee_id, company_id, name, email, phone, password_hash, role, position, department, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeId, session.companyId, name, email, phone || null, passwordHash, role, position, department, true]
    );

    // Send the welcome email asynchronously (don't await it to avoid blocking the response)
    sendWelcomeEmail(email, name, employeeId, randomPassword).catch(console.error);

    return NextResponse.json({
      success: true,
      employee: {
        id: result.insertId,
        employeeId,
        name,
        email,
        role,
        position,
        department
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
}
