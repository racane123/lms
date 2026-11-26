import { AppShell } from "@/components/layout/app-shell";
import { SessionCheckCard } from "@/components/layout/session-check-card";
import { requireRole } from "@/lib/session";

export default async function InstructorDashboardPage() {
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  return (
    <AppShell ctx={ctx}>
      <SessionCheckCard ctx={ctx} title="Instructor dashboard" />
    </AppShell>
  );
}
