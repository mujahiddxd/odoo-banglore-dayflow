import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAuth();

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main
        className="flex-1 paper-bg"
        style={{ marginLeft: "var(--sidebar-width)" }}
      >
        <div className="p-6 md:p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
