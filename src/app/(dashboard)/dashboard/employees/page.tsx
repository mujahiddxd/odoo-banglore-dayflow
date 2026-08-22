import { requireAuth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { query, initDatabase } from "@/lib/db";
import { canViewEmployees } from "@/lib/permissions";
import { EmployeeDirectory } from "@/components/employees/EmployeeDirectory";
import type { Employee } from "@/lib/types";

export default async function EmployeesPage() {
  const user = await requireAuth();

  if (!canViewEmployees(user)) {
    redirect("/dashboard");
  }

  await initDatabase();
  let dbEmployees;
  if (user.role === 'ADMIN') {
    dbEmployees = await query(
      'SELECT employee_id, name, email, phone, role, avatar, profile_picture, position, department FROM employees WHERE company_id = ?',
      [user.companyId]
    );
  } else {
    dbEmployees = await query(
      "SELECT employee_id, name, email, phone, role, avatar, profile_picture, position, department FROM employees WHERE company_id = ? AND role != 'admin'",
      [user.companyId]
    );
  }

  const employees: Employee[] = dbEmployees.map((e: any) => ({
    id: e.employee_id,
    name: e.name,
    email: e.email,
    mobile: e.phone || '',
    position: e.position || (e.role === 'admin' ? 'Admin' : 'Employee'),
    department: e.department || '',
    manager: '',
    company: '',
    location: '',
    avatar: e.profile_picture || e.avatar || '',
    role: e.role.toUpperCase() as "ADMIN" | "EMPLOYEE",
  }));

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
