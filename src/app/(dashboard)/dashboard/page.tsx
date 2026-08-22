import { requireAuth } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await requireAuth();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-headline text-4xl font-bold mb-2">
          Welcome back, {user.name.split(" ")[0]}!
        </h1>
        <p className="font-body text-base opacity-60">
          Here&apos;s your Dayflow dashboard.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 stagger-children">
        {/* Quick stats cards */}
        <div className="sketchy-card p-6">
          <div className="tape tape-tl" />
          <p className="font-body text-sm opacity-60 uppercase tracking-wider mb-2">
            Role
          </p>
          <p className="font-headline text-2xl font-bold">
            {user.role === "ADMIN" ? "🔑 Admin" : "👤 Employee"}
          </p>
        </div>

        <div className="sketchy-card p-6">
          <div className="tape tape-tl" />
          <p className="font-body text-sm opacity-60 uppercase tracking-wider mb-2">
            Quick Action
          </p>
          <a
            href="/dashboard/my-profile"
            className="font-headline text-xl font-bold hover:underline"
          >
            View My Profile →
          </a>
        </div>

        {user.role === "ADMIN" && (
          <div className="sketchy-card p-6">
            <div className="tape tape-tl" />
            <p className="font-body text-sm opacity-60 uppercase tracking-wider mb-2">
              Manage
            </p>
            <a
              href="/dashboard/employees"
              className="font-headline text-xl font-bold hover:underline"
            >
              View Employees →
            </a>
          </div>
        )}
      </div>

      {/* Info note */}
      <div className="mt-10 flex justify-center">
        <div className="sticky-note sticky-note-yellow max-w-sm text-center">
          <p>
            🎯 Use &quot;My Profile&quot; to view your information, salary
            details, and more.
            {user.role === "ADMIN" &&
              " As Admin, you can also manage all employees."}
          </p>
        </div>
      </div>
    </div>
  );
}
