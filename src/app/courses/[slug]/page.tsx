import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { ActionForm } from "@/components/shared/action-form";
import { SubmitButton } from "@/components/shared/submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPublishedCourse } from "@/features/courses/service";
import { enrollAction } from "@/features/enrollments/actions";
import { getMyEnrollment } from "@/features/enrollments/service";
import { levelLabel } from "@/lib/format";
import { getContext } from "@/lib/session";
import { getDefaultOrganizationId } from "@/lib/tenant";

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const orgId = await getDefaultOrganizationId();
  const course = await getPublishedCourse(orgId, slug);
  if (!course) notFound();

  const ctx = await getContext();
  const enrolled = ctx?.role === "STUDENT" ? Boolean(await getMyEnrollment(ctx, course.id)) : false;
  const lessonCount = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <>
      <PublicHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="mb-3 flex flex-wrap gap-2">
              {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
              <Badge variant="outline">{levelLabel[course.level]}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Taught by {course.instructor.name} · {course._count.enrollments} enrolled · {lessonCount} lessons
            </p>
          </div>

          {course.description && <p className="whitespace-pre-line text-foreground/90">{course.description}</p>}

          <section aria-labelledby="curriculum">
            <h2 id="curriculum" className="mb-3 text-lg font-semibold">What you&apos;ll learn</h2>
            {course.modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">The curriculum hasn&apos;t been published yet.</p>
            ) : (
              <div className="space-y-2">
                {course.modules.map((m) => (
                  <details key={m.id} className="rounded-lg border bg-background p-3" open>
                    <summary className="cursor-pointer font-medium">{m.title}</summary>
                    <ul className="mt-2 space-y-1 pl-4 text-sm text-muted-foreground">
                      {m.lessons.map((l) => <li key={l.id} className="list-disc">{l.title}</li>)}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside>
          <Card className="sticky top-6">
            <CardContent className="space-y-4 p-5">
              <p className="text-2xl font-semibold">Free</p>
              {!ctx && (
                <Button asChild className="w-full">
                  <Link href={`/login?next=/courses/${course.slug}`}>Log in to enroll</Link>
                </Button>
              )}
              {ctx?.role === "STUDENT" && enrolled && (
                <>
                  <p className="text-sm text-emerald-700">You&apos;re enrolled in this course.</p>
                  <Button asChild variant="outline" className="w-full"><Link href="/dashboard">Go to dashboard</Link></Button>
                </>
              )}
              {ctx?.role === "STUDENT" && !enrolled && (
                <ActionForm action={enrollAction}>
                  <input type="hidden" name="courseId" value={course.id} />
                  <SubmitButton className="w-full" pendingText="Enrolling…">Enroll for free</SubmitButton>
                </ActionForm>
              )}
              {ctx && ctx.role !== "STUDENT" && (
                <p className="text-sm text-muted-foreground">Only student accounts can enroll in courses.</p>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </>
  );
}
