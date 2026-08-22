import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, execute } from '@/lib/db';
import { signToken, getSessionCookieOptions } from '@/lib/auth';
import { generateEmployeeId } from '@/lib/employee-id';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;
    const companyName = 'Odoo';

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Create company
    const companyResult = await execute(
      'INSERT INTO companies (name) VALUES (?)',
      [companyName]
    );
    const companyId = companyResult.insertId;

    // Generate employee ID and hash password
    const employeeId = await generateEmployeeId(name);
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin employee
    const employeeResult = await execute(
      'INSERT INTO employees (employee_id, company_id, name, email, phone, password_hash, role, first_login) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeId, companyId, name, email, phone || null, passwordHash, 'admin', false]
    );

    // Generate JWT
    const token = await signToken({
      userId: employeeResult.insertId,
      employeeId,
      companyId,
      role: 'admin',
      name,
      email,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: employeeResult.insertId,
        employeeId,
        name,
        email,
        role: 'admin',
      },
      generatedId: employeeId,
    });

    response.cookies.set(getSessionCookieOptions(token));
    return response;
  } catch (error: any) {
    console.error('Sign up error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
