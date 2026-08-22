// POST /api/auth/login — Set session cookie
import { NextRequest } from 'next/server';
import { setSession } from '@/lib/auth';
import { getEmployee } from '@/lib/data/employees';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { employeeId } = body;

  if (!employeeId || !getEmployee(employeeId)) {
    return Response.json(
      { success: false, error: 'Invalid employee ID' },
      { status: 400 }
    );
  }

  await setSession(employeeId);

  const employee = getEmployee(employeeId)!;
  return Response.json({
    success: true,
    data: {
      employeeId: employee.id,
      name: employee.name,
      email: employee.email,
      role: employee.role,
      avatar: employee.avatar,
    },
  });
}
