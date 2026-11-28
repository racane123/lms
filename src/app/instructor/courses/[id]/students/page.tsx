import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressBar } from "@/components/shared/progress-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCourseStudents } from "@/features/enrollments/service";
import { formatDate } from "@/lib/format";
import { orNotFound } from "@/lib/page-guard";
import { requireRole } from "@/lib/session";

export default async function CourseStudentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  const { course, rows } = await orNotFound(listCourseStudents(ctx, id));

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Enrolled students"
          description={course.title}
          actions={<Button asChild variant="outline" size="sm"><Link href={`/instructor/courses/${id}`}>Back to course</Link></Button>}
        />
        {rows.length === 0 ? (
          <EmptyState title="No students yet" description="Students appear here once they enroll in this published course." />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead><TableHead>Enrolled</TableHead>
                  <TableHead className="w-56">Progress</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.user.name}</div>
                      <div className="text-xs text-muted-foreground">{r.user.email}</div>
                    </TableCell>
                    <TableCell>{formatDate(r.enrolledAt)}</TableCell>
                    <TableCell>
                      <ProgressBar value={r.progress.percent} label={`${r.user.name} progress`} />
                      <span className="text-xs text-muted-foreground">{r.progress.completed}/{r.progress.total} lessons</span>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{r.status.toLowerCase()}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
