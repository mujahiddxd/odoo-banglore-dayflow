// GET /api/employees/:employeeId/salary — Salary config
// PUT /api/employees/:employeeId/salary — Update salary config (Admin only)
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { canViewSalary, canEditSalary } from '@/lib/permissions';
import { getSalaryConfig, updateSalaryConfig } from '@/lib/data/salary';
import { calculateSalary, validateSalaryConfig } from '@/lib/salary-engine';
import type { SalaryConfig } from '@/lib/types';

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

  // Authorization: owner OR admin
  if (!canViewSalary(user, employeeId)) {
    return Response.json(
      { success: false, error: 'Forbidden: you cannot view this salary' },
      { status: 403 }
    );
  }

  const config = getSalaryConfig(employeeId);
  if (!config) {
    return Response.json(
      { success: false, error: 'Salary configuration not found' },
      { status: 404 }
    );
  }

  // Compute fresh amounts via engine
  const computed = calculateSalary(config);

  return Response.json({
    success: true,
    data: {
      config,
      computed,
    },
  });
}

export async function PUT(
  request: NextRequest,
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

  // Only Admin can edit salary
  if (!canEditSalary(user)) {
    return Response.json(
      { success: false, error: 'Forbidden: only admin can edit salary' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { config: incomingConfig, reason } = body as {
    config: SalaryConfig;
    reason?: string;
  };

  // Ensure employee ID matches URL
  incomingConfig.employeeId = employeeId;

  // Validate before saving
  const validationError = validateSalaryConfig(incomingConfig);
  if (validationError) {
    return Response.json(
      { success: false, error: validationError },
      { status: 400 }
    );
  }

  // Backend recalculates everything — never trust frontend amounts
  const updated = updateSalaryConfig(
    employeeId,
    incomingConfig,
    user.employeeId,
    user.name,
    reason ?? ''
  );

  const computed = calculateSalary(updated);

  return Response.json({
    success: true,
    data: {
      config: updated,
      computed,
    },
  });
}
