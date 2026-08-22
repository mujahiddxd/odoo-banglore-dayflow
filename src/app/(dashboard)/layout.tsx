import { requireAuth } from "@/lib/auth";
import { Sidebar } from "@/components/dashboard/Sidebar";
import Chatbot from "@/components/Chatbot";

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
        {children}
      </main>
      <Chatbot />
    </div>
  );
}
