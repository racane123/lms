import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CourseStatusBadge } from "@/components/shared/course-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllCourses } from "@/features/courses/service";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function AdminCoursesPage() {
  const ctx = await requireRole("ADMIN");
  const courses = await listAllCourses(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Courses" description="All courses on the platform." />
        {courses.length === 0 ? (
          <EmptyState title="No courses yet" />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead><TableHead>Instructor</TableHead><TableHead>Status</TableHead>
                  <TableHead className="text-right">Enrolled</TableHead><TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell><Link href={`/instructor/courses/${c.id}`} className="font-medium hover:underline">{c.title}</Link></TableCell>
                    <TableCell>{c.instructor.name}</TableCell>
                    <TableCell><CourseStatusBadge status={c.status} /></TableCell>
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
