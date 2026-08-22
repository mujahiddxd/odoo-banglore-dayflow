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

    const employee = await queryOne<{
      id: number;
      employee_id: string;
      company_id: number;
      name: string;
      email: string;
      phone: string;
      role: string;
      avatar: string;
      created_at: string;
    }>(
      'SELECT id, employee_id, company_id, name, email, phone, role, avatar, created_at FROM employees WHERE id = ?',
      [session.userId]
    );

    if (!employee) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const company = await queryOne<{ name: string; logo: string }>(
      'SELECT name, logo FROM companies WHERE id = ?',
      [employee.company_id]
    );

    return NextResponse.json({
      user: {
        ...employee,
        companyName: company?.name,
        companyLogo: company?.logo,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
