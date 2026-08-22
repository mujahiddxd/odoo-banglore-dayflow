import { NextRequest, NextResponse } from 'next/server';
import { getSession, getCurrentUser } from '@/lib/auth';
import { initDatabase, queryOne } from '@/lib/db';
import { getFullProfile } from '@/lib/data/employees';
import { canAccessProfile } from '@/lib/permissions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    
    // 1. Check DB first if JWT session exists
    const session = await getSession();
    if (session) {
      try {
        await initDatabase();
        // "me" returns the current user's profile
        const idToQuery = employeeId === 'me' ? session.userId : parseInt(employeeId, 10);
        
        if (!isNaN(idToQuery)) {
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
            [idToQuery, session.companyId]
          );

          if (employee) {
            const company = await queryOne<{ name: string; logo: string }>(
              'SELECT name, logo FROM companies WHERE id = ?',
              [employee.company_id]
            );

            return NextResponse.json({
              success: true,
              employee: {
                ...employee,
                companyName: company?.name,
              },
            });
          }
        }
      } catch {
        // DB not connected in local dev, fall through to in-memory store
      }
    }

    // 2. Check in-memory mock store
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!canAccessProfile(user, employeeId)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: you cannot access this profile' },
        { status: 403 }
      );
    }

    const profile = getFullProfile(employeeId);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Employee GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
