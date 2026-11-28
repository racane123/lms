import type { LessonType } from "@prisma/client";
import { db } from "@/lib/db";
import { moveItem } from "@/lib/reorder";

const courseOwner = { select: { id: true, instructorId: true, organizationId: true } } as const;

export const curriculumRepo = {
  moduleWithCourse: (orgId: string, id: string) =>
    db.module.findFirst({
      where: { id, course: { organizationId: orgId } },
      include: { course: courseOwner },
    }),

  lessonWithCourse: (orgId: string, id: string) =>
    db.lesson.findFirst({
      where: { id, module: { course: { organizationId: orgId } } },
      include: { module: { include: { course: courseOwner } } },
    }),

  async nextModulePosition(courseId: string) {
    const agg = await db.module.aggregate({ where: { courseId }, _max: { position: true } });
    return (agg._max.position ?? -1) + 1;
  },
  async nextLessonPosition(moduleId: string) {
    const agg = await db.lesson.aggregate({ where: { moduleId }, _max: { position: true } });
    return (agg._max.position ?? -1) + 1;
  },

  createModule: (courseId: string, title: string, position: number) =>
    db.module.create({ data: { courseId, title, position } }),
  renameModule: (id: string, title: string) => db.module.update({ where: { id }, data: { title } }),
  deleteModule: (id: string) => db.module.delete({ where: { id } }),

  createLesson: (moduleId: string, title: string, type: LessonType, position: number) =>
    db.lesson.create({ data: { moduleId, title, type, position } }),
  updateLesson: (id: string, data: { title: string; type: LessonType; content: string | null; videoUrl: string | null }) =>
    db.lesson.update({ where: { id }, data }),
  deleteLesson: (id: string) => db.lesson.delete({ where: { id } }),

  async moveModule(courseId: string, id: string, dir: "up" | "down") {
    const rows = await db.module.findMany({ where: { courseId }, orderBy: { position: "asc" }, select: { id: true } });
    const order = moveItem(rows.map((r) => r.id), id, dir);
    if (!order) return;
    await db.$transaction(order.map((mid, i) => db.module.update({ where: { id: mid }, data: { position: i } })));
  },

  async moveLesson(moduleId: string, id: string, dir: "up" | "down") {
    const rows = await db.lesson.findMany({ where: { moduleId }, orderBy: { position: "asc" }, select: { id: true } });
    const order = moveItem(rows.map((r) => r.id), id, dir);
    if (!order) return;
    await db.$transaction(order.map((lid, i) => db.lesson.update({ where: { id: lid }, data: { position: i } })));
  },
};
