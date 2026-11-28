import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { CourseStatusBadge } from "@/components/shared/course-status-badge";
import { InlineAction } from "@/components/shared/inline-action";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteCourseAction, setCourseStatusAction } from "@/features/courses/actions";
import { CourseForm } from "@/features/courses/components/course-form";
import { getCourseForEdit, listCategories } from "@/features/courses/service";
import { CurriculumManager } from "@/features/curriculum/components/curriculum-manager";
import { orNotFound } from "@/lib/page-guard";
import { requireRole } from "@/lib/session";

export default async function CourseEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  const [course, categories] = await Promise.all([
    orNotFound(getCourseForEdit(ctx, id)),
    listCategories(ctx.organizationId),
  ]);

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-6xl">
        <PageHeader
          title={course.title}
          description={`${course._count.enrollments} enrolled`}
          actions={
            <>
              <CourseStatusBadge status={course.status} />
              <Button asChild variant="outline" size="sm"><Link href={`/instructor/courses/${course.id}/students`}>Students</Link></Button>
              {course.status === "PUBLISHED" && (
                <Button asChild variant="outline" size="sm"><Link href={`/courses/${course.slug}`}>View public page</Link></Button>
              )}
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <CurriculumManager courseId={course.id} modules={course.modules} />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Course details</CardTitle></CardHeader>
              <CardContent>
                <CourseForm
                  categories={categories}
                  course={{ id: course.id, title: course.title, description: course.description, categoryId: course.categoryId, level: course.level }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Publishing</CardTitle></CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {course.status !== "PUBLISHED" && (
                  <InlineAction action={setCourseStatusAction} fields={{ id: course.id, status: "PUBLISHED" }} variant="default">Publish</InlineAction>
                )}
                {course.status === "PUBLISHED" && (
                  <InlineAction action={setCourseStatusAction} fields={{ id: course.id, status: "DRAFT" }} variant="outline" confirm="Unpublish this course? It will disappear from the catalog.">Unpublish</InlineAction>
                )}
                {course.status !== "ARCHIVED" && (
                  <InlineAction action={setCourseStatusAction} fields={{ id: course.id, status: "ARCHIVED" }} variant="outline" confirm="Archive this course? It will disappear from the catalog.">Archive</InlineAction>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Courses with enrollments can&apos;t be deleted. Archive them instead.</p>
                <InlineAction action={deleteCourseAction} fields={{ id: course.id }} variant="destructive" confirm="Permanently delete this course and all its modules and lessons?">
                  Delete course
                </InlineAction>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
