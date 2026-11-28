"use server";

import { redirect } from "next/navigation";
import type { FormState } from "@/lib/action-state";
import { runAction } from "@/lib/action-runner";
import { idSchema } from "@/lib/zod-helpers";
import { courseInputSchema, courseStatusSchema } from "./schemas";
import { createCourse, deleteCourse, setCourseStatus, updateCourse } from "./service";

const STAFF = ["INSTRUCTOR", "ADMIN"] as const;
const PATHS = ["/instructor/courses", "/instructor/courses/[id]", "/admin/courses", "/courses", "/courses/[slug]"];

export async function createCourseAction(_: FormState, fd: FormData): Promise<FormState> {
  const out: { id?: string } = {};
  const result = await runAction([...STAFF], async (ctx) => {
    const input = courseInputSchema.parse(Object.fromEntries(fd));
    out.id = (await createCourse(ctx, input)).id;
  }, { revalidate: PATHS });
  if (out.id) redirect(`/instructor/courses/${out.id}`);
  return result;
}

export async function updateCourseAction(_: FormState, fd: FormData): Promise<FormState> {
  return runAction([...STAFF], async (ctx) => {
    await updateCourse(ctx, idSchema.parse(fd.get("id")), courseInputSchema.parse(Object.fromEntries(fd)));
  }, { success: "Course saved.", revalidate: PATHS });
}

export async function setCourseStatusAction(_: FormState, fd: FormData): Promise<FormState> {
  return runAction([...STAFF], async (ctx) => {
    await setCourseStatus(ctx, idSchema.parse(fd.get("id")), courseStatusSchema.parse(fd.get("status")));
  }, { revalidate: PATHS });
}

export async function deleteCourseAction(_: FormState, fd: FormData): Promise<FormState> {
  const out: { to?: string } = {};
  const result = await runAction([...STAFF], async (ctx) => {
    await deleteCourse(ctx, idSchema.parse(fd.get("id")));
    out.to = ctx.role === "ADMIN" ? "/admin/courses" : "/instructor/courses";
  }, { revalidate: PATHS });
  if (out.to) redirect(out.to);
  return result;
}
