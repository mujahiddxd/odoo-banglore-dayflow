"use client";

import Link from "next/link";
import type { Employee } from "@/lib/types";

interface EmployeeDirectoryProps {
  employees: Employee[];
}

export function EmployeeDirectory({ employees }: EmployeeDirectoryProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 stagger-children">
      {employees.map((emp) => {
        const initials = emp.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();

        return (
          <Link
            key={emp.id}
            href={`/dashboard/employees/${emp.id}`}
            className="block"
          >
            <div className="sketchy-card p-6 cursor-pointer">
              <div className="tape tape-tl" />

              {/* Avatar */}
              <div
                className="w-14 h-14 rounded-full border-2 flex items-center justify-center text-lg font-bold mb-4"
                style={{
                  borderColor: "var(--uxsg-ink)",
                  background:
                    "linear-gradient(135deg, var(--uxsg-teal), var(--uxsg-yellow))",
                  color: "var(--uxsg-white)",
                  fontFamily: "var(--font-headline)",
                }}
              >
                {initials}
              </div>

              {/* Info */}
              <h3 className="font-headline text-lg font-bold mb-1">
                {emp.name}
              </h3>
              <p className="font-body text-sm opacity-70">{emp.position}</p>
              <p className="font-body text-xs opacity-50 mt-1">
                {emp.department}
              </p>

              {/* Role badge */}
              <div className="mt-4">
                <span
                  className={`sketchy-badge ${emp.role === "ADMIN" ? "sketchy-badge-yellow" : "sketchy-badge-teal"}`}
                >
                  {emp.role === "ADMIN" ? "🔑 Admin" : "👤 Employee"}
                </span>
              </div>

              {/* View arrow */}
              <div className="mt-3 font-body text-sm font-semibold opacity-60 group-hover:opacity-100">
                View Profile →
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
