import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canViewEmployees } from "@/lib/permissions";
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

  return <EmployeeProfile employeeId={employeeId} currentUser={user} />;
}
