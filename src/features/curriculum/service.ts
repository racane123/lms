import { courseRepo } from "@/features/courses/repository";
import { NotFoundError } from "@/lib/errors";
import { assertCan, type Ctx } from "@/lib/permissions";
import type { z } from "zod";
import { curriculumRepo } from "./repository";
import type { addLessonSchema, addModuleSchema, renameModuleSchema, updateLessonSchema } from "./schemas";

type Owner = { instructorId: string; organizationId: string };
const authorize = (ctx: Ctx, c: Owner) =>
  assertCan(ctx, "course:update", { ownerId: c.instructorId, organizationId: c.organizationId });

async function loadCourse(ctx: Ctx, courseId: string) {
  const course = await courseRepo.findById(ctx.organizationId, courseId);
  if (!course) throw new NotFoundError("Course not found.");
  authorize(ctx, course);
  return course;
}
async function loadModule(ctx: Ctx, moduleId: string) {
  const mod = await curriculumRepo.moduleWithCourse(ctx.organizationId, moduleId);
  if (!mod) throw new NotFoundError("Module not found.");
  authorize(ctx, mod.course);
  return mod;
}
async function loadLesson(ctx: Ctx, lessonId: string) {
  const lesson = await curriculumRepo.lessonWithCourse(ctx.organizationId, lessonId);
  if (!lesson) throw new NotFoundError("Lesson not found.");
  authorize(ctx, lesson.module.course);
  return lesson;
}

export async function addModule(ctx: Ctx, input: z.infer<typeof addModuleSchema>) {
  const course = await loadCourse(ctx, input.courseId);
  await curriculumRepo.createModule(course.id, input.title, await curriculumRepo.nextModulePosition(course.id));
}
export async function renameModule(ctx: Ctx, input: z.infer<typeof renameModuleSchema>) {
  await loadModule(ctx, input.id);
  await curriculumRepo.renameModule(input.id, input.title);
}
export async function deleteModule(ctx: Ctx, id: string) {
  await loadModule(ctx, id);
  await curriculumRepo.deleteModule(id);
}
export async function moveModule(ctx: Ctx, id: string, dir: "up" | "down") {
  const mod = await loadModule(ctx, id);
  await curriculumRepo.moveModule(mod.courseId, id, dir);
}

export async function addLesson(ctx: Ctx, input: z.infer<typeof addLessonSchema>) {
  const mod = await loadModule(ctx, input.moduleId);
  await curriculumRepo.createLesson(mod.id, input.title, input.type, await curriculumRepo.nextLessonPosition(mod.id));
}
export async function updateLesson(ctx: Ctx, input: z.infer<typeof updateLessonSchema>) {
  await loadLesson(ctx, input.id);
  await curriculumRepo.updateLesson(input.id, {
    title: input.title,
    type: input.type,
    content: input.content ?? null,
    videoUrl: input.videoUrl ?? null,
  });
}
export async function deleteLesson(ctx: Ctx, id: string) {
  await loadLesson(ctx, id);
  await curriculumRepo.deleteLesson(id);
}
export async function moveLesson(ctx: Ctx, id: string, dir: "up" | "down") {
  const lesson = await loadLesson(ctx, id);
  await curriculumRepo.moveLesson(lesson.moduleId, id, dir);
}

/** Used by the lesson editor page; the URL's courseId must match the lesson's real course. */
export async function getLessonForEdit(ctx: Ctx, lessonId: string, courseId: string) {
  const lesson = await loadLesson(ctx, lessonId);
  if (lesson.module.courseId !== courseId) throw new NotFoundError("Lesson not found.");
  return lesson;
}
