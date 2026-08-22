import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, execute, queryOne } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const targetEmployeeId = employeeId === 'me' ? session.employeeId : employeeId;

    // Only allow setting up own profile or if admin
    if (session.role !== 'admin' && session.employeeId !== targetEmployeeId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    await initDatabase();

    // Verify employee exists and needs setup
    const employee = await queryOne<{ id: number, first_login: boolean }>(
      'SELECT id, first_login FROM employees WHERE employee_id = ? AND company_id = ?',
      [targetEmployeeId, session.companyId]
    );

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      phone, address, date_of_birth, gender, nationality, 
      profile_picture, resume_text, skills, education_entries, resume_entries 
    } = body;

    const updates: string[] = [];
    const values: any[] = [];

    const addUpdate = (key: string, value: any) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    };

    addUpdate('phone', phone);
    addUpdate('address', address);
    addUpdate('date_of_birth', date_of_birth ? new Date(date_of_birth) : undefined);
    addUpdate('gender', gender);
    addUpdate('nationality', nationality);
    addUpdate('profile_picture', profile_picture);
    addUpdate('resume_text', resume_text);
    addUpdate('skills', skills ? JSON.stringify(skills) : undefined);
    addUpdate('education_entries', education_entries ? JSON.stringify(education_entries) : undefined);
    addUpdate('resume_entries', resume_entries ? JSON.stringify(resume_entries) : undefined);
    addUpdate('first_login', false);

    if (updates.length > 0) {
      values.push(targetEmployeeId, session.companyId);
      const query = `UPDATE employees SET ${updates.join(', ')} WHERE employee_id = ? AND company_id = ?`;
      await execute(query, values);
    }

    return NextResponse.json({ success: true, message: 'Profile setup completed' });

  } catch (error) {
    console.error('Profile setup error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
