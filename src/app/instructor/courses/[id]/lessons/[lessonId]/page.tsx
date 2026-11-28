import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { ActionForm } from "@/components/shared/action-form";
import { NativeSelect } from "@/components/shared/native-select";
import { PageHeader } from "@/components/shared/page-header";
import { SubmitButton } from "@/components/shared/submit-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateLessonAction } from "@/features/curriculum/actions";
import { getLessonForEdit } from "@/features/curriculum/service";
import { orNotFound } from "@/lib/page-guard";
import { requireRole } from "@/lib/session";

export default async function LessonEditorPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const { id, lessonId } = await params;
  const ctx = await requireRole("INSTRUCTOR", "ADMIN");
  const lesson = await orNotFound(getLessonForEdit(ctx, lessonId, id));

  return (
    <AppShell ctx={ctx}>
      <div className="mx-auto max-w-3xl">
        <PageHeader
          title="Edit lesson"
          description={`In module: ${lesson.module.title}`}
          actions={<Button asChild variant="outline" size="sm"><Link href={`/instructor/courses/${id}`}>Back to course</Link></Button>}
        />
        <Card>
          <CardContent className="p-6">
            <ActionForm action={updateLessonAction} className="space-y-4">
              <input type="hidden" name="id" value={lesson.id} />
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" defaultValue={lesson.title} required maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Lesson type</Label>
                <NativeSelect id="type" name="type" defaultValue={lesson.type} className="w-full">
                  <option value="TEXT">Text</option>
                  <option value="VIDEO">Video</option>
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video link (YouTube or Vimeo)</Label>
                <Input id="videoUrl" name="videoUrl" type="url" defaultValue={lesson.videoUrl ?? ""} placeholder="https://www.youtube.com/watch?v=…" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Lesson content</Label>
                <Textarea id="content" name="content" rows={14} defaultValue={lesson.content ?? ""} />
              </div>
              <SubmitButton>Save lesson</SubmitButton>
            </ActionForm>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
