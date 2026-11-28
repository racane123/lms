import { z } from "zod";
import { emptyToUndefined } from "@/lib/zod-helpers";

export const courseInputSchema = z.object({
  title: z.string().trim()
    .min(3, "Title must be at least 3 characters.")
    .max(120, "Title must be 120 characters or fewer."),
  description: z.preprocess(emptyToUndefined, z.string().trim().max(5000, "Description is too long.").optional()),
  categoryId: z.preprocess(emptyToUndefined, z.string().optional()),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], { message: "Choose a difficulty level." }),
});
export type CourseInput = z.infer<typeof courseInputSchema>;

export const courseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
