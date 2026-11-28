import { Prisma } from "@prisma/client";
import { courseRepo } from "@/features/courses/repository";
import { summaryForEnrollments } from "@/features/progress/repository";
import { logActivity } from "@/lib/activity";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { assertCan, type Ctx } from "@/lib/permissions";
import { enrollmentRepo } from "./repository";

export async function enroll(ctx: Ctx, courseId: string) {
  assertCan(ctx, "course:enroll");

  const course = await courseRepo.findById(ctx.organizationId, courseId);
  if (!course || course.status !== "PUBLISHED") throw new NotFoundError("This course isn't available.");

  if (await enrollmentRepo.find(ctx.userId, courseId)) {
    throw new ConflictError("You're already enrolled in this course.");
  }
  try {
    const enrollment = await enrollmentRepo.create(ctx.userId, courseId);
    await logActivity(ctx, "enrollment.created", "Enrollment", enrollment.id, { courseId, title: course.title });
  } catch (e) {
    // Two simultaneous requests: the unique (userId, courseId) constraint is the real guard.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      throw new ConflictError("You're already enrolled in this course.");
    }
    throw e;
  }
  return course;
}

export async function getMyEnrollment(ctx: Ctx, courseId: string) {
  assertCan(ctx, "course:enroll");
  return enrollmentRepo.find(ctx.userId, courseId);
}

export async function listAllEnrollments(ctx: Ctx) {
  assertCan(ctx, "enrollment:viewAll");
  return enrollmentRepo.listAll(ctx.organizationId);
}

export async function listCourseStudents(ctx: Ctx, courseId: string) {
  const course = await courseRepo.findById(ctx.organizationId, courseId);
  if (!course) throw new NotFoundError("Course not found.");
  assertCan(ctx, "course:viewEnrollments", { ownerId: course.instructorId, organizationId: course.organizationId });

  const rows = await enrollmentRepo.listByCourse(courseId);
  const progress = await summaryForEnrollments(rows.map((r) => ({ id: r.id, courseId })));
  return { course, rows: rows.map((r) => ({ ...r, progress: progress.get(r.id)! })) };
}
