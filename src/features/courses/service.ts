import type { CourseLevel, CourseStatus } from "@prisma/client";
import { logActivity } from "@/lib/activity";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { assertCan, type Ctx } from "@/lib/permissions";
import { slugify } from "@/lib/slug";
import type { CourseInput } from "./schemas";
import { courseRepo } from "./repository";

// ----- Public reads (organization is resolved by the caller, never from user input) -----
export const listCatalog = (orgId: string, f: { q?: string; categorySlug?: string; level?: CourseLevel }) =>
  courseRepo.listPublished(orgId, f);
export const getPublishedCourse = (orgId: string, slug: string) => courseRepo.findPublishedBySlug(orgId, slug);
export const listCategories = (orgId: string) => courseRepo.listCategories(orgId);

// ----- Role-scoped reads -----
export async function listMyCourses(ctx: Ctx) {
  assertCan(ctx, "course:create");
  return courseRepo.listByInstructor(ctx.organizationId, ctx.userId);
}

export async function listAllCourses(ctx: Ctx) {
  assertCan(ctx, "course:viewAll");
  return courseRepo.listAll(ctx.organizationId);
}

export async function getCourseForEdit(ctx: Ctx, id: string) {
  const course = await courseRepo.findForEdit(ctx.organizationId, id);
  if (!course) throw new NotFoundError("Course not found.");
  assertCan(ctx, "course:update", { ownerId: course.instructorId, organizationId: course.organizationId });
  return course;
}

// ----- Mutations -----
async function uniqueSlug(orgId: string, title: string) {
  const base = slugify(title);
  if (!(await courseRepo.slugExists(orgId, base))) return base;
  for (let i = 0; i < 5; i++) {
    const candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    if (!(await courseRepo.slugExists(orgId, candidate))) return candidate;
  }
  throw new ConflictError("Could not generate a unique URL for this course. Try a different title.");
}

async function assertCategory(orgId: string, categoryId?: string) {
  if (categoryId && !(await courseRepo.categoryExists(orgId, categoryId))) {
    throw new AppError("That category does not exist.");
  }
}

export async function createCourse(ctx: Ctx, input: CourseInput) {
  assertCan(ctx, "course:create");
  await assertCategory(ctx.organizationId, input.categoryId);
  const course = await courseRepo.create({
    organizationId: ctx.organizationId,
    instructorId: ctx.userId,
    title: input.title,
    slug: await uniqueSlug(ctx.organizationId, input.title),
    description: input.description,
    categoryId: input.categoryId,
    level: input.level,
  });
  await logActivity(ctx, "course.created", "Course", course.id, { title: course.title });
  return course;
}

export async function updateCourse(ctx: Ctx, id: string, input: CourseInput) {
  const course = await getCourseForEdit(ctx, id);
  await assertCategory(ctx.organizationId, input.categoryId);
  await courseRepo.update(course.id, {
    title: input.title,
    description: input.description ?? null,
    categoryId: input.categoryId ?? null,
    level: input.level,
  });
  await logActivity(ctx, "course.updated", "Course", id);
}

export async function setCourseStatus(ctx: Ctx, id: string, status: CourseStatus) {
  const course = await getCourseForEdit(ctx, id);
  if (status === "PUBLISHED" && (await courseRepo.countLessons(id)) === 0) {
    throw new AppError("Add at least one lesson before publishing this course.");
  }
  await courseRepo.setStatus(id, status);
  await logActivity(ctx, `course.${status.toLowerCase()}`, "Course", id, { title: course.title });
}

export async function deleteCourse(ctx: Ctx, id: string) {
  const course = await courseRepo.findById(ctx.organizationId, id);
  if (!course) throw new NotFoundError("Course not found.");
  assertCan(ctx, "course:delete", { ownerId: course.instructorId, organizationId: course.organizationId });
  if ((await courseRepo.countEnrollments(id)) > 0) {
    throw new ConflictError("This course has enrollments and can't be deleted. Archive it instead.");
  }
  await courseRepo.delete(id);
  await logActivity(ctx, "course.deleted", "Course", id, { title: course.title });
}
