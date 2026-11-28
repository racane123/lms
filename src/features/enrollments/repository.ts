import { db } from "@/lib/db";

export const enrollmentRepo = {
  find: (userId: string, courseId: string) =>
    db.enrollment.findUnique({ where: { userId_courseId: { userId, courseId } } }),

  create: (userId: string, courseId: string) => db.enrollment.create({ data: { userId, courseId } }),

  listByUser: (userId: string) =>
    db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          select: {
            id: true, slug: true, title: true, level: true,
            instructor: { select: { name: true } },
            category: { select: { name: true } },
          },
        },
      },
    }),

  listAll: (orgId: string, take = 200) =>
    db.enrollment.findMany({
      where: { course: { organizationId: orgId } },
      orderBy: { enrolledAt: "desc" },
      take,
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { id: true, title: true, slug: true } },
      },
    }),

  listByCourse: (courseId: string) =>
    db.enrollment.findMany({
      where: { courseId },
      orderBy: { enrolledAt: "desc" },
      include: { user: { select: { id: true, name: true, email: true } } },
    }),
};
