// GET /api/employees — List employees (Admin only for full list)
import { getCurrentUser } from '@/lib/auth';
import { getAllEmployees } from '@/lib/data/employees';
import { canViewEmployees } from '@/lib/permissions';

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, error: 'Not authenticated' },
      { status: 401 }
    );
  }

  if (!canViewEmployees(user)) {
    return Response.json(
      { success: false, error: 'Forbidden: insufficient permissions' },
      { status: 403 }
    );
  }

  const employees = getAllEmployees();
  return Response.json({ success: true, data: employees });
}
