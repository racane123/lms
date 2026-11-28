"use server";

import type { FormState } from "@/lib/action-state";
import { runAction } from "@/lib/action-runner";
import { directionSchema, idSchema } from "@/lib/zod-helpers";
import {
  addLessonSchema, addModuleSchema, renameModuleSchema, updateLessonSchema,
} from "./schemas";
import {
  addLesson, addModule, deleteLesson, deleteModule, moveLesson, moveModule, renameModule, updateLesson,
} from "./service";

const STAFF = ["INSTRUCTOR", "ADMIN"] as const;
const PATHS = ["/instructor/courses/[id]", "/instructor/courses/[id]/lessons/[lessonId]", "/courses/[slug]"];
const data = (fd: FormData) => Object.fromEntries(fd);

export const addModuleAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => addModule(ctx, addModuleSchema.parse(data(fd))), { revalidate: PATHS });

export const renameModuleAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => renameModule(ctx, renameModuleSchema.parse(data(fd))), { revalidate: PATHS });

export const deleteModuleAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => deleteModule(ctx, idSchema.parse(fd.get("id"))), { revalidate: PATHS });

export const moveModuleAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => moveModule(ctx, idSchema.parse(fd.get("id")), directionSchema.parse(fd.get("direction"))), { revalidate: PATHS });

export const addLessonAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => addLesson(ctx, addLessonSchema.parse(data(fd))), { revalidate: PATHS });

export const updateLessonAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => updateLesson(ctx, updateLessonSchema.parse(data(fd))), { success: "Lesson saved.", revalidate: PATHS });

export const deleteLessonAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => deleteLesson(ctx, idSchema.parse(fd.get("id"))), { revalidate: PATHS });

export const moveLessonAction = (_: FormState, fd: FormData) =>
  runAction([...STAFF], (ctx) => moveLesson(ctx, idSchema.parse(fd.get("id")), directionSchema.parse(fd.get("direction"))), { revalidate: PATHS });
