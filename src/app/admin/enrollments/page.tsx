import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listAllEnrollments } from "@/features/enrollments/service";
import { formatDate } from "@/lib/format";
import { requireRole } from "@/lib/session";

export default async function AdminEnrollmentsPage() {
  const ctx = await requireRole("ADMIN");
  const rows = await listAllEnrollments(ctx);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-5xl">
        <PageHeader title="Enrollments" description="The 200 most recent enrollments." />
        {rows.length === 0 ? (
          <EmptyState title="No enrollments yet" description="Enrollments appear once students join a published course." />
        ) : (
          <div className="overflow-x-auto rounded-lg border bg-background">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead><TableHead>Course</TableHead>
                  <TableHead>Status</TableHead><TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="font-medium">{r.user.name}</div>
                      <div className="text-xs text-muted-foreground">{r.user.email}</div>
                    </TableCell>
                    <TableCell><Link href={`/courses/${r.course.slug}`} className="hover:underline">{r.course.title}</Link></TableCell>
                    <TableCell><Badge variant="secondary">{r.status.toLowerCase()}</Badge></TableCell>
                    <TableCell>{formatDate(r.enrolledAt)}</TableCell>
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
