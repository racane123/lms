import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudentDashboard } from "@/features/dashboard/service";
import { formatDate, levelLabel } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function StudentDashboardPage() {
  const ctx = await requireRole("STUDENT");
  const d = await getStudentDashboard(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader title={`Welcome back, ${ctx.name.split(" ")[0]}`} description="Here's where your learning stands." />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Enrolled courses" value={d.items.length} />
          <StatCard label="In progress" value={d.inProgress} />
          <StatCard label="Completed" value={d.completed} />
          <StatCard label="Overall progress" value={`${d.overall}%`} />
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">My courses</h2>
        {d.items.length === 0 ? (
          <EmptyState
            title="You haven't enrolled in any courses yet"
            description="Browse the catalog and enroll for free."
            action={<Button asChild><Link href="/courses">Browse courses</Link></Button>}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {d.items.map((i) => (
              <Card key={i.id}>
                <CardContent className="space-y-3 p-5">
                  <div>
                    <Link href={`/courses/${i.course.slug}`} className="font-semibold hover:underline">{i.course.title}</Link>
                    <p className="text-xs text-muted-foreground">
                      {i.course.instructor.name} · {levelLabel[i.course.level]} · Enrolled {formatDate(i.enrolledAt)}
                    </p>
                  </div>
                  <ProgressBar value={i.progress.percent} label={`${i.course.title} progress`} />
                  <p className="text-xs text-muted-foreground">
                    {i.progress.completed} of {i.progress.total} lessons completed ({i.progress.percent}%)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader><CardTitle className="text-base">Recent learning activity</CardTitle></CardHeader>
          <CardContent>
            {d.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">Completed lessons will show up here.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {d.recentActivity.map((a) => (
                  <li key={a.id} className="flex justify-between gap-4">
                    <span>Completed <strong>{a.lesson.title}</strong> in {a.lesson.module.course.title}</span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(a.completedAt)}</span>
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
