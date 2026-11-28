import type { CourseLevel, CourseStatus } from "@prisma/client";

export const levelLabel: Record<CourseLevel, string> = {
  BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced",
};
export const statusLabel: Record<CourseStatus, string> = {
  DRAFT: "Draft", PUBLISHED: "Published", ARCHIVED: "Archived",
};
export const formatDate = (d: Date) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(d);
