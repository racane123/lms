import { AppShell } from "@/components/layout/app-shell";
import { SessionCheckCard } from "@/components/layout/session-check-card";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  const ctx = await requireRole("ADMIN");
  return (
    <AppShell ctx={ctx}>
      <SessionCheckCard ctx={ctx} title="Admin dashboard" />
    </AppShell>
  );
}
