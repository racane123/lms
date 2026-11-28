import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { levelLabel } from "@/lib/format";
import type { CourseLevel } from "@prisma/client";

export type CourseCardData = {
  slug: string; title: string; description: string | null; level: CourseLevel;
  instructor: { name: string }; category: { name: string } | null;
  _count: { enrollments: number; modules: number };
};

export function CourseCard({ course }: { course: CourseCardData }) {
  return (
    <Link href={`/courses/${course.slug}`} className="group block focus-visible:outline-none">
      <Card className="h-full transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-2">
            {course.category && <Badge variant="secondary">{course.category.name}</Badge>}
            <Badge variant="outline">{levelLabel[course.level]}</Badge>
          </div>
          <h3 className="font-semibold leading-snug">{course.title}</h3>
          {course.description && <p className="line-clamp-3 text-sm text-muted-foreground">{course.description}</p>}
          <p className="mt-auto text-xs text-muted-foreground">
            {course.instructor.name} · {course._count.modules} modules · {course._count.enrollments} enrolled
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
