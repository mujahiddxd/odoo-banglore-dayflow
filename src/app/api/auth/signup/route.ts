import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { initDatabase, execute, queryOne } from '@/lib/db';
import { generateEmployeeId } from '@/lib/employee-id';
import { sendCompanyRegistrationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    await initDatabase();

    const body = await request.json();
    const { companyName, name, email, phone, password, confirmPassword, logo } = body;

    // --- Validation ---
    if (!companyName || !name || !email || !password) {
      return NextResponse.json(
        { error: 'Company name, admin name, email, and password are required.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    // --- Check if email already exists ---
    const existing = await queryOne<{ id: number }>(
      'SELECT id FROM employees WHERE email = ?',
      [email]
    );
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }

    // --- Create Company ---
    const companyResult = await execute(
      'INSERT INTO companies (name, logo) VALUES (?, ?)',
      [companyName.trim(), logo || null]
    );
    const companyId = companyResult.insertId;

    // --- Create Admin Employee ---
    const employeeId = await generateEmployeeId(name);
    const passwordHash = await bcrypt.hash(password, 10);

    const empResult = await execute(
      `INSERT INTO employees
        (employee_id, company_id, name, email, phone, password_hash, role, position, department, first_login)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employeeId,
        companyId,
        name.trim(),
        email.toLowerCase().trim(),
        phone?.trim() || null,
        passwordHash,
        'admin',
        'HR Manager',
        'Human Resources',
        false,
      ]
    );

    // --- Send Welcome Email (non-blocking) ---
    sendCompanyRegistrationEmail(email, name, companyName, employeeId, password).catch(
      console.error
    );

    return NextResponse.json({
      success: true,
      message: 'Company registered successfully. Check your email for login details.',
      employeeId,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
