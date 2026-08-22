import { NextResponse } from 'next/server';
import { getSession, getCurrentUser } from '@/lib/auth';
import { initDatabase, queryOne } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (session) {
      try {
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

        if (employee) {
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
              avatar: employee.avatar,
            },
          });
        }
      } catch {
        // DB not connected in local dev without MySQL running, continue to mock
      }
    }

    // Check mock/cookie session
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 1,
        employee_id: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        avatar: user.avatar,
      },
      data: user,
    });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
