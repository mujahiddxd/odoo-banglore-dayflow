import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { initDatabase, queryOne, execute } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Role-based access: Admin can view anyone, employee can view only themselves
    if (session.role !== 'admin' && session.employeeId !== employeeId && employeeId !== 'me') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    const targetEmployeeId = employeeId === 'me' ? session.employeeId : employeeId;

    await initDatabase();

    const employee = await queryOne<any>(
      'SELECT * FROM employees WHERE employee_id = ?',
      [targetEmployeeId]
    );

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employee not found' },
        { status: 404 }
      );
    }

    const company = await queryOne<{ name: string; logo: string }>(
      'SELECT name, logo FROM companies WHERE id = ?',
      [employee.company_id]
    );

    // Parse JSON fields
    const skills = employee.skills ? (typeof employee.skills === 'string' ? JSON.parse(employee.skills) : employee.skills) : [];
    const certifications = employee.certifications ? (typeof employee.certifications === 'string' ? JSON.parse(employee.certifications) : employee.certifications) : [];
    const resumeEntries = employee.resume_entries ? (typeof employee.resume_entries === 'string' ? JSON.parse(employee.resume_entries) : employee.resume_entries) : [];
    const educationEntries = employee.education_entries ? (typeof employee.education_entries === 'string' ? JSON.parse(employee.education_entries) : employee.education_entries) : [];

    return NextResponse.json({
      success: true,
      data: {
        employee: {
          id: employee.employee_id,
          name: employee.name,
          email: employee.email,
          mobile: employee.phone || '',
          position: employee.position || '',
          department: employee.department || '',
          manager: employee.manager || '',
          company: company?.name || '',
          location: employee.location || '',
          avatar: employee.profile_picture || employee.avatar || '',
          role: employee.role.toUpperCase(),
        },
        privateInfo: {
          dateOfBirth: employee.date_of_birth ? new Date(employee.date_of_birth).toISOString().split('T')[0] : '',
          residentialAddress: employee.address || '',
          nationality: employee.nationality || '',
          personalEmail: employee.personal_email || '',
          gender: employee.gender || '',
          maritalStatus: employee.marital_status || '',
          dateOfJoining: employee.date_of_joining ? new Date(employee.date_of_joining).toISOString().split('T')[0] : '',
        },
        bankDetails: {
          accountNumber: employee.bank_account || '',
          bankName: employee.bank_name || '',
          ifscCode: employee.ifsc_code || '',
        },
        companyIdentifiers: {
          panNumber: employee.pan_number || '',
          uanNumber: employee.uan_number || '',
          employeeCode: employee.employee_id,
        },
        profileInfo: {
          about: employee.about || '',
          whatILoveAboutMyJob: '', // Can be added later if needed
          interests: '', // Can be added later
          skills,
          certifications,
          resumeText: employee.resume_text || '',
        },
        resume: resumeEntries,
        education: educationEntries,
      },
    });
  } catch (error) {
    console.error('Employee GET error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  try {
    const { employeeId } = await params;
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const isAdmin = session.role === 'admin';
    const isSelf = session.employeeId === employeeId || employeeId === 'me';
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const targetEmployeeId = employeeId === 'me' ? session.employeeId : employeeId;
    const body = await request.json();

    await initDatabase();

    // Verify employee exists
    const employee = await queryOne<{ id: number }>('SELECT id FROM employees WHERE employee_id = ?', [targetEmployeeId]);
    if (!employee) {
      return NextResponse.json({ success: false, error: 'Employee not found' }, { status: 404 });
    }

    // Role-based allowed fields
    const adminAllowedFields = [
      'name', 'email', 'phone', 'position', 'department', 'manager', 'location', 
      'date_of_birth', 'address', 'gender', 'marital_status', 'nationality', 'personal_email', 'date_of_joining',
      'pan_number', 'uan_number', 'bank_name', 'bank_account', 'ifsc_code',
      'about', 'profile_picture'
    ];
    
    const employeeAllowedFields = ['phone', 'address', 'profile_picture', 'personal_email'];
    
    const allowedFields = isAdmin ? adminAllowedFields : employeeAllowedFields;

    const updates: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        updates.push(`${key} = ?`);
        values.push(body[key]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update or missing permissions' }, { status: 400 });
    }

    const query = `UPDATE employees SET ${updates.join(', ')} WHERE employee_id = ?`;
    await execute(query, [...values, targetEmployeeId]);

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Employee PATCH error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
