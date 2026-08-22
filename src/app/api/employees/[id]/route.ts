import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, queryOne } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await initDatabase();

    const { id } = await params;

    // "me" returns the current user's profile
    const employeeId = id === 'me' ? session.userId : parseInt(id, 10);

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
      'SELECT id, employee_id, company_id, name, email, phone, role, avatar, created_at FROM employees WHERE id = ? AND company_id = ?',
      [employeeId, session.companyId]
    );

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const company = await queryOne<{ name: string; logo: string }>(
      'SELECT name, logo FROM companies WHERE id = ?',
      [employee.company_id]
    );

    return NextResponse.json({
      employee: {
        ...employee,
        companyName: company?.name,
      },
    });
  } catch (error) {
    console.error('Employee GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
