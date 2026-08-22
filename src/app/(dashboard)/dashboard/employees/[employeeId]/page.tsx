import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canViewEmployees } from "@/lib/permissions";
import { getEmployee } from "@/lib/data/employees";
import { EmployeeProfile } from "@/components/profile/EmployeeProfile";

export default async function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const user = await requireAuth();

  if (!canViewEmployees(user)) {
    redirect("/dashboard");
  }

  const { employeeId } = await params;
  const employee = getEmployee(employeeId);

  if (!employee) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="sketchy-card p-8 text-center max-w-md">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="font-headline text-2xl mb-2">Employee Not Found</h2>
          <p className="font-body text-sm opacity-70">
            No employee exists with ID: {employeeId}
          </p>
        </div>
      </div>
    );
  }

  return <EmployeeProfile employeeId={employeeId} currentUser={user} />;
}
