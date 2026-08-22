import { requireAuth } from "@/lib/auth";
import { EmployeeProfile } from "@/components/profile/EmployeeProfile";

export default async function MyProfilePage() {
  const user = await requireAuth();

  return (
    <EmployeeProfile employeeId={user.employeeId} currentUser={user} />
  );
}
