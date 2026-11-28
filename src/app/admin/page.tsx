import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminDashboard } from "@/features/dashboard/service";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function AdminDashboardPage() {
  const ctx = await requireRole("ADMIN");
  const d = await getAdminDashboard(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Admin dashboard" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Students" value={d.students} />
          <StatCard label="Instructors" value={d.instructors} />
          <StatCard label="Courses" value={d.courses} hint={`${d.published} published`} />
          <StatCard label="Enrollments" value={d.enrollments} hint={`${d.enrollmentsThisWeek} in the last 7 days`} />
        </div>

        <Card className="mt-8">
          <CardHeader><CardTitle className="text-base">Recent platform activity</CardTitle></CardHeader>
          <CardContent>
            {d.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">Activity will appear here as people use the platform.</p>
            ) : (
              <ul className="divide-y text-sm">
                {d.recent.map((a) => (
                  <li key={a.id} className="flex justify-between gap-4 py-2">
                    <span>
                      <strong>{a.actor?.name ?? "System"}</strong>{" "}
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">{a.action}</code>
                    </span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(a.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
