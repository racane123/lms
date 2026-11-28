import { z } from "zod";
import { toEmbedUrl } from "@/lib/video";
import { emptyToUndefined, idSchema } from "@/lib/zod-helpers";

const moduleTitle = z.string().trim()
  .min(2, "Module title must be at least 2 characters.")
  .max(120, "Module title must be 120 characters or fewer.");
const lessonTitle = z.string().trim()
  .min(2, "Lesson title must be at least 2 characters.")
  .max(150, "Lesson title must be 150 characters or fewer.");
const lessonType = z.enum(["TEXT", "VIDEO"], { message: "Choose a lesson type." });

export const addModuleSchema = z.object({ courseId: idSchema, title: moduleTitle });
export const renameModuleSchema = z.object({ id: idSchema, title: moduleTitle });
export const addLessonSchema = z.object({ moduleId: idSchema, title: lessonTitle, type: lessonType });

export const updateLessonSchema = z
  .object({
    id: idSchema,
    title: lessonTitle,
    type: lessonType,
    content: z.preprocess(emptyToUndefined, z.string().max(50000, "Lesson content is too long.").optional()),
    videoUrl: z.preprocess(emptyToUndefined, z.string().trim().max(300).optional()),
  })
  .superRefine((v, refCtx) => {
    if (v.videoUrl && !toEmbedUrl(v.videoUrl)) {
      refCtx.addIssue({ code: "custom", path: ["videoUrl"], message: "Video link must be a YouTube or Vimeo URL." });
    }
    if (v.type === "VIDEO" && !v.videoUrl) {
      refCtx.addIssue({ code: "custom", path: ["videoUrl"], message: "Add a video link for video lessons." });
    }
  });
