"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", roles: ["ADMIN", "EMPLOYEE"] },
  { href: "/dashboard/my-profile", label: "My Profile", icon: "👤", roles: ["ADMIN", "EMPLOYEE"] },
  { href: "/dashboard/employees", label: "Employees", icon: "👥", roles: ["ADMIN"] },
];

export function Sidebar({ user }: { user: AuthUser }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="p-5 border-b-2" style={{ borderColor: "var(--uxsg-ink)" }}>
        <Link href="/dashboard" className="block">
          <h1 className="font-headline text-2xl font-bold tracking-tight">
            Odoo
          </h1>
          <p className="font-body text-xs opacity-50 mt-1">HR Management</p>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map(
          (item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          }
        )}
      </nav>

      {/* User section */}
      <div
        className="p-4 border-t-2"
        style={{ borderColor: "var(--uxsg-ink)" }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold"
            style={{
              borderColor: "var(--uxsg-ink)",
              background:
                "linear-gradient(135deg, var(--uxsg-teal), var(--uxsg-yellow))",
              color: "var(--uxsg-white)",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm font-semibold truncate">
              {user.name}
            </p>
            <p className="font-body text-xs opacity-50 truncate">
              {user.role === "ADMIN" ? "🔑 Admin" : "Employee"}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="sketchy-btn sketchy-btn-secondary w-full text-sm"
        >
          Sign Out
        </button>
      </div>
    </aside>
  );
}
