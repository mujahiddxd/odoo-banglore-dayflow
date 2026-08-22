"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DEMO_USERS = [
  {
    id: "emp-001",
    name: "Priya Sharma",
    role: "ADMIN",
    position: "HR Manager",
    department: "Human Resources",
    color: "#FCDD2A",
    emoji: "👩‍💼",
  },
  {
    id: "emp-002",
    name: "Rahul Kumar",
    role: "EMPLOYEE",
    position: "Senior Software Engineer",
    department: "Engineering",
    color: "#61C4D8",
    emoji: "👨‍💻",
  },
  {
    id: "emp-003",
    name: "Ananya Patel",
    role: "EMPLOYEE",
    position: "Product Designer",
    department: "Design",
    color: "#a8d4e6",
    emoji: "👩‍🎨",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleLogin(employeeId: string) {
    setLoading(employeeId);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      });
      if (res.ok) {
        router.push("/dashboard");
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen paper-bg flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1
            className="font-headline text-5xl md:text-6xl font-bold tracking-tight"
            style={{ color: "var(--uxsg-ink)" }}
          >
            Dayflow
          </h1>
          <div className="relative inline-block mt-2">
            <p className="font-body text-lg opacity-70">
              Employee Management System
            </p>
            <svg
              className="absolute -bottom-2 left-0 w-full"
              height="8"
              viewBox="0 0 200 8"
              preserveAspectRatio="none"
            >
              <path
                d="M0,4 Q25,0 50,4 T100,4 T150,4 T200,4"
                fill="none"
                stroke="#FCDD2A"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        {/* User selection */}
        <div className="mb-8 text-center">
          <p className="font-hand text-xl opacity-80">
            ↓ Pick a user to log in as ↓
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 stagger-children">
          {DEMO_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => handleLogin(user.id)}
              disabled={loading !== null}
              className="sketchy-card p-6 text-left cursor-pointer group relative overflow-visible"
              style={{ opacity: loading && loading !== user.id ? 0.5 : 1 }}
            >
              {/* Tape corners */}
              <div className="tape tape-tl" />

              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl mb-4"
                style={{
                  borderColor: "var(--uxsg-ink)",
                  background: user.color,
                }}
              >
                {user.emoji}
              </div>

              {/* Info */}
              <h3 className="font-headline text-xl font-bold mb-1">
                {user.name}
              </h3>
              <p className="font-body text-sm opacity-70 mb-1">
                {user.position}
              </p>
              <p className="font-body text-xs opacity-50">{user.department}</p>

              {/* Role badge */}
              <div className="mt-4">
                <span
                  className={`sketchy-badge ${user.role === "ADMIN" ? "sketchy-badge-yellow" : "sketchy-badge-teal"}`}
                >
                  {user.role === "ADMIN" ? "🔑 Admin" : "👤 Employee"}
                </span>
              </div>

              {/* Loading state */}
              {loading === user.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                  <div className="font-hand text-lg">Logging in...</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Decorative sticky note */}
        <div className="mt-12 flex justify-center">
          <div className="sticky-note sticky-note-blue max-w-xs text-center">
            <p>
              💡 Admin (Priya) can view all employees and their salaries.
              Regular employees can only view their own profile and salary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
