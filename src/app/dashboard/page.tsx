import { AppShell } from "@/components/layout/app-shell";
import { SessionCheckCard } from "@/components/layout/session-check-card";
import { requireRole } from "@/lib/session";

export default async function StudentDashboardPage() {
  const ctx = await requireRole("STUDENT");
  return (
    <AppShell ctx={ctx}>
      <SessionCheckCard ctx={ctx} title="Student dashboard" />
    </AppShell>
  );
}
