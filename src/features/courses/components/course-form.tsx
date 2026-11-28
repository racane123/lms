import { ActionForm } from "@/components/shared/action-form";
import { NativeSelect } from "@/components/shared/native-select";
import { SubmitButton } from "@/components/shared/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelLabel } from "@/lib/format";
import type { CourseLevel } from "@prisma/client";
import { createCourseAction, updateCourseAction } from "../actions";

type Props = {
  categories: { id: string; name: string }[];
  course?: { id: string; title: string; description: string | null; categoryId: string | null; level: CourseLevel };
};

export function CourseForm({ categories, course }: Props) {
  return (
    <ActionForm action={course ? updateCourseAction : createCourseAction} className="space-y-4">
      {course && <input type="hidden" name="id" value={course.id} />}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={course?.title} required maxLength={120} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={course?.description ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="categoryId">Category</Label>
          <NativeSelect id="categoryId" name="categoryId" defaultValue={course?.categoryId ?? ""} className="w-full">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">Difficulty</Label>
          <NativeSelect id="level" name="level" defaultValue={course?.level ?? "BEGINNER"} className="w-full">
            {(Object.keys(levelLabel) as CourseLevel[]).map((l) => <option key={l} value={l}>{levelLabel[l]}</option>)}
          </NativeSelect>
        </div>
      </div>
      <SubmitButton>{course ? "Save changes" : "Create course"}</SubmitButton>
    </ActionForm>
  );
}
