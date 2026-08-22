import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, queryOne } from '@/lib/db';
import { signToken, getSessionCookieOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find the employee
    const employee = await queryOne<{
      id: number;
      employee_id: string;
      company_id: number;
      name: string;
      email: string;
      password_hash: string;
      role: string;
    }>('SELECT id, employee_id, company_id, name, email, password_hash, role FROM employees WHERE email = ?', [email]);

    if (!employee) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, employee.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT
    const token = await signToken({
      userId: employee.id,
      employeeId: employee.employee_id,
      companyId: employee.company_id,
      role: employee.role,
      name: employee.name,
      email: employee.email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: employee.id,
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
      },
    });

    response.cookies.set(getSessionCookieOptions(token));
    return response;
  } catch (error: any) {
    console.error('Sign in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
