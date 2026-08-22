import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllEmployees } from "@/lib/data/employees";
import { canViewEmployees } from "@/lib/permissions";
import { EmployeeDirectory } from "@/components/employees/EmployeeDirectory";

export default async function EmployeesPage() {
  const user = await requireAuth();

  if (!canViewEmployees(user)) {
    redirect("/dashboard");
  }

  const employees = getAllEmployees();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-2">Employees</h1>
        <p className="font-body text-base opacity-60">
          Manage and view all employee profiles.
        </p>
      </div>

      <EmployeeDirectory employees={employees} />
    </div>
  );
}
