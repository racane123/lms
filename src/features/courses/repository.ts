import type { CourseLevel, CourseStatus, Prisma } from "@prisma/client";
import { db } from "@/lib/db";

const cardSelect = {
  id: true, slug: true, title: true, description: true, level: true, status: true, updatedAt: true,
  instructor: { select: { name: true } },
  category: { select: { name: true } },
  _count: { select: { enrollments: true, modules: true } },
} satisfies Prisma.CourseSelect;

export const courseRepo = {
  findById: (orgId: string, id: string) =>
    db.course.findFirst({ where: { id, organizationId: orgId } }),

  findForEdit: (orgId: string, id: string) =>
    db.course.findFirst({
      where: { id, organizationId: orgId },
      include: {
        category: true,
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { position: "asc" },
          include: { lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, type: true } } },
        },
      },
    }),

  findPublishedBySlug: (orgId: string, slug: string) =>
    db.course.findFirst({
      where: { organizationId: orgId, slug, status: "PUBLISHED" },
      include: {
        instructor: { select: { name: true } },
        category: true,
        _count: { select: { enrollments: true } },
        modules: {
          orderBy: { position: "asc" },
          // Lesson content is intentionally NOT selected: it is for enrolled students only.
          include: { lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, type: true } } },
        },
      },
    }),

  listPublished: (orgId: string, f: { q?: string; categorySlug?: string; level?: CourseLevel }) =>
    db.course.findMany({
      where: {
        organizationId: orgId,
        status: "PUBLISHED",
        ...(f.q && {
          OR: [
            { title: { contains: f.q, mode: "insensitive" } },
            { description: { contains: f.q, mode: "insensitive" } },
          ],
        }),
        ...(f.categorySlug && { category: { slug: f.categorySlug } }),
        ...(f.level && { level: f.level }),
      },
      select: cardSelect,
      orderBy: { createdAt: "desc" },
      take: 48, // MVP cap; pagination is a Phase 2 (post-MVP) item
    }),

  listByInstructor: (orgId: string, instructorId: string) =>
    db.course.findMany({
      where: { organizationId: orgId, instructorId },
      select: cardSelect,
      orderBy: { updatedAt: "desc" },
    }),

  listAll: (orgId: string) =>
    db.course.findMany({ where: { organizationId: orgId }, select: cardSelect, orderBy: { updatedAt: "desc" } }),

  listCategories: (orgId: string) =>
    db.category.findMany({ where: { organizationId: orgId }, orderBy: { name: "asc" } }),

  categoryExists: async (orgId: string, id: string) =>
    (await db.category.count({ where: { id, organizationId: orgId } })) > 0,

  slugExists: async (orgId: string, slug: string) =>
    (await db.course.count({ where: { organizationId: orgId, slug } })) > 0,

  countLessons: (courseId: string) => db.lesson.count({ where: { module: { courseId } } }),
  countEnrollments: (courseId: string) => db.enrollment.count({ where: { courseId } }),

  create: (data: Prisma.CourseUncheckedCreateInput) => db.course.create({ data }),
  update: (id: string, data: Prisma.CourseUncheckedUpdateInput) => db.course.update({ where: { id }, data }),
  delete: (id: string) => db.course.delete({ where: { id } }),

  setStatus: (id: string, status: CourseStatus) => db.course.update({ where: { id }, data: { status } }),
};
