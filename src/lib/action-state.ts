import { ZodError } from "zod";
import { AppError } from "./errors";
import { ForbiddenError } from "./permissions";

export type FormState = { error?: string; success?: string };

export function toFormState(e: unknown): FormState {
  if (e instanceof ZodError) return { error: e.issues.map((i) => i.message).join(" ") };
  if (e instanceof ForbiddenError || e instanceof AppError) return { error: e.message };
  console.error(e);
  return { error: "Something went wrong. Please try again." };
}
