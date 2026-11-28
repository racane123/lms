import { enrollmentRepo } from "@/features/enrollments/repository";
import { summaryForEnrollments } from "@/features/progress/repository";
import { db } from "@/lib/db";
import { assertCan, type Ctx } from "@/lib/permissions";

export async function getAdminDashboard(ctx: Ctx) {
  assertCan(ctx, "analytics:viewPlatform");
  const org = ctx.organizationId;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const inOrg = { course: { organizationId: org } };

  const [students, instructors, courses, published, enrollments, enrollmentsThisWeek, recent] = await Promise.all([
    db.user.count({ where: { organizationId: org, role: "STUDENT" } }),
    db.user.count({ where: { organizationId: org, role: "INSTRUCTOR" } }),
    db.course.count({ where: { organizationId: org } }),
    db.course.count({ where: { organizationId: org, status: "PUBLISHED" } }),
    db.enrollment.count({ where: inOrg }),
    db.enrollment.count({ where: { ...inOrg, enrolledAt: { gte: weekAgo } } }),
    db.activityLog.findMany({
      where: { organizationId: org },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { actor: { select: { name: true } } },
    }),
  ]);
  return { students, instructors, courses, published, enrollments, enrollmentsThisWeek, recent };
}

export async function getInstructorDashboard(ctx: Ctx) {
  assertCan(ctx, "course:create");
  const org = ctx.organizationId;

  const [courses, enrollments] = await Promise.all([
    db.course.findMany({
      where: { organizationId: org, instructorId: ctx.userId },
      select: { id: true, title: true, status: true },
      orderBy: { updatedAt: "desc" },
    }),
    db.enrollment.findMany({
      where: { course: { organizationId: org, instructorId: ctx.userId } },
      orderBy: { enrolledAt: "desc" },
      take: 500, // MVP cap on rows used for averages
      select: {
        id: true, courseId: true, userId: true, enrolledAt: true,
        user: { select: { name: true } },
        course: { select: { title: true } },
      },
    }),
  ]);
  const progress = await summaryForEnrollments(enrollments.map((e) => ({ id: e.id, courseId: e.courseId })));

  const perCourse = courses.map((c) => {
    const rows = enrollments.filter((e) => e.courseId === c.id);
    const avg = rows.length
      ? Math.round(rows.reduce((s, e) => s + (progress.get(e.id)?.percent ?? 0), 0) / rows.length)
      : 0;
    return { ...c, enrolled: rows.length, avgProgress: avg };
  });
  const percents = enrollments.map((e) => progress.get(e.id)?.percent ?? 0);

  return {
    totalCourses: courses.length,
    totalEnrollments: enrollments.length,
    uniqueStudents: new Set(enrollments.map((e) => e.userId)).size,
    avgProgress: percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0,
    completedCount: percents.filter((p) => p === 100).length,
    perCourse,
    recentEnrollments: enrollments.slice(0, 5),
  };
}

export async function getStudentDashboard(ctx: Ctx) {
  assertCan(ctx, "course:enroll"); // student-only capability
  const enrollments = await enrollmentRepo.listByUser(ctx.userId);
  const progress = await summaryForEnrollments(enrollments.map((e) => ({ id: e.id, courseId: e.courseId })));

  const items = enrollments.map((e) => ({ ...e, progress: progress.get(e.id)! }));
  const completed = items.filter((i) => i.progress.total > 0 && i.progress.percent === 100).length;
  const inProgress = items.filter((i) => i.progress.percent > 0 && i.progress.percent < 100).length;
  const overall = items.length ? Math.round(items.reduce((s, i) => s + i.progress.percent, 0) / items.length) : 0;

  const recentActivity = await db.lessonProgress.findMany({
    where: { userId: ctx.userId },
    orderBy: { completedAt: "desc" },
    take: 5,
    include: { lesson: { select: { title: true, module: { select: { course: { select: { title: true } } } } } } },
  });

  return { items, completed, inProgress, overall, recentActivity };
}
