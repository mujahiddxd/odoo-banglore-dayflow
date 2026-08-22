import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
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
      profile_picture: string;
      position: string;
      department: string;
      first_login: boolean;
      created_at: string;
    }>(
      'SELECT id, employee_id, company_id, name, email, phone, role, avatar, profile_picture, position, department, first_login, created_at FROM employees WHERE id = ?',
      [session.userId]
    );

    if (!employee) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const company = await queryOne<{ name: string; logo: string }>(
      'SELECT name, logo FROM companies WHERE id = ?',
      [employee.company_id]
    );

    return NextResponse.json({
      success: true,
      user: {
        ...employee,
        companyName: company?.name,
        companyLogo: company?.logo,
      },
      data: {
        employeeId: employee.employee_id,
        name: employee.name,
        email: employee.email,
        role: employee.role.toUpperCase(),
        avatar: employee.profile_picture || employee.avatar || '',
        position: employee.position,
        department: employee.department,
        firstLogin: !!employee.first_login,
      },
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
