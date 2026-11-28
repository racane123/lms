import { db } from "@/lib/db";

export type ProgressSummary = { total: number; completed: number; percent: number };

export async function summaryForEnrollments(
  rows: { id: string; courseId: string }[],
): Promise<Map<string, ProgressSummary>> {
  const result = new Map<string, ProgressSummary>();
  if (rows.length === 0) return result;

  const courseIds = [...new Set(rows.map((r) => r.courseId))];
  const [courses, done] = await Promise.all([
    db.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, modules: { select: { _count: { select: { lessons: true } } } } },
    }),
    db.lessonProgress.groupBy({
      by: ["enrollmentId"],
      where: { enrollmentId: { in: rows.map((r) => r.id) } },
      _count: { _all: true },
    }),
  ]);

  const totals = new Map(courses.map((c) => [c.id, c.modules.reduce((s, m) => s + m._count.lessons, 0)]));
  const doneBy = new Map(done.map((d) => [d.enrollmentId, d._count._all]));

  for (const r of rows) {
    const total = totals.get(r.courseId) ?? 0;
    const completed = Math.min(doneBy.get(r.id) ?? 0, total);
    result.set(r.id, { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 });
  }
  return result;
}
