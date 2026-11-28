import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CourseStatusBadge } from "@/components/shared/course-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listMyCourses } from "@/features/courses/service";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function MyCoursesPage() {
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  const courses = await listMyCourses(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="My courses"
          actions={<Button asChild><Link href="/instructor/courses/new">New course</Link></Button>}
        />
        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create a course, add modules and lessons, then publish it."
            action={<Button asChild><Link href="/instructor/courses/new">Create a course</Link></Button>}
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Modules</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead><TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Link href={`/instructor/courses/${c.id}`} className="font-medium hover:underline">{c.title}</Link></TableCell>
                    <TableCell><CourseStatusBadge status={c.status} /></TableCell>
                    <TableCell className="text-right">{c._count.modules}</TableCell>
                    <TableCell className="text-right">{c._count.enrollments}</TableCell>
                    <TableCell>{formatDate(c.updatedAt)}</TableCell>
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
