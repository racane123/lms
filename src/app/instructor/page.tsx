import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { StatCard } from "@/components/shared/stat-card";
import { CourseStatusBadge } from "@/components/shared/course-status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorDashboard } from "@/features/dashboard/service";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function InstructorDashboardPage() {
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  const d = await getInstructorDashboard(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Instructor dashboard"
          actions={<Button asChild><Link href="/instructor/courses/new">New course</Link></Button>}
        />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Courses created" value={d.totalCourses} />
          <StatCard label="Enrollments" value={d.totalEnrollments} hint={`${d.uniqueStudents} unique students`} />
          <StatCard label="Avg. student progress" value={`${d.avgProgress}%`} />
          <StatCard label="Completed" value={d.completedCount} hint="enrollments at 100%" />
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Course performance</h2>
        {d.perCourse.length === 0 ? (
          <EmptyState
            title="You haven't created a course yet"
            action={<Button asChild><Link href="/instructor/courses/new">Create your first course</Link></Button>}
          />
        ) : (
          <div className="space-y-3">
            {d.perCourse.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <Link href={`/instructor/courses/${c.id}`} className="font-medium hover:underline">{c.title}</Link>
                    <div className="mt-1"><CourseStatusBadge status={c.status} /></div>
                  </div>
                  <div className="w-40 space-y-1">
                    <ProgressBar value={c.avgProgress} label={`${c.title} average progress`} />
                    <p className="text-xs text-muted-foreground">{c.enrolled} enrolled · avg {c.avgProgress}%</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader><CardTitle className="text-base">Recent enrollments</CardTitle></CardHeader>
          <CardContent>
            {d.recentEnrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">New enrollments will appear here.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {d.recentEnrollments.map((e) => (
                  <li key={e.id} className="flex justify-between gap-4">
                    <span><strong>{e.user.name}</strong> enrolled in {e.course.title}</span>
                    <span className="shrink-0 text-muted-foreground">{formatDate(e.enrolledAt)}</span>
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
