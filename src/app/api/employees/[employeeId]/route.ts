// GET /api/employees/:employeeId — Employee profile
import { getCurrentUser } from '@/lib/auth';
import { getFullProfile } from '@/lib/data/employees';
import { canAccessProfile } from '@/lib/permissions';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ employeeId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const { employeeId } = await params;

  if (!canAccessProfile(user, employeeId)) {
    return Response.json(
      { success: false, error: 'Forbidden: you cannot access this profile' },
      { status: 403 }
    );
  }

  const profile = getFullProfile(employeeId);
  if (!profile) {
    return Response.json(
      { success: false, error: 'Employee not found' },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: profile });
}
