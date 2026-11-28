import type { CourseStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";

export function CourseStatusBadge({ status }: { status: CourseStatus }) {
  return <Badge variant={status === "PUBLISHED" ? "default" : "secondary"}>{statusLabel[status]}</Badge>;
}
