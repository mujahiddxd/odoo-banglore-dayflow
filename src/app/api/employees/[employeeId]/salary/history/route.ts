// GET /api/employees/:employeeId/salary/history — Salary history (Admin only)
import { getCurrentUser } from '@/lib/auth';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { getSalaryHistory } from '@/lib/data/salary';

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

  // Only Admin can view salary history
  if (!hasPermission(user.role, PERMISSIONS.VIEW_SALARY_HISTORY)) {
    return Response.json(
      { success: false, error: 'Forbidden: only admin can view salary history' },
      { status: 403 }
    );
  }

  const { employeeId } = await params;
  const history = getSalaryHistory(employeeId);

  return Response.json({ success: true, data: history });
}
