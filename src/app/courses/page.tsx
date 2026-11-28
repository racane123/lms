import Link from "next/link";
import type { CourseLevel } from "@prisma/client";
import { PublicHeader } from "@/components/layout/public-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NativeSelect } from "@/components/shared/native-select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CourseCard } from "@/features/courses/components/course-card";
import { listCatalog, listCategories } from "@/features/courses/service";
import { levelLabel } from "@/lib/format";
import { getDefaultOrganizationId } from "@/lib/tenant";

const levels = Object.keys(levelLabel) as CourseLevel[];

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; level?: string }>;
}) {
  const sp = await searchParams;
  const orgId = await getDefaultOrganizationId(); // future: resolve from domain/subdomain
  const level = levels.includes(sp.level as CourseLevel) ? (sp.level as CourseLevel) : undefined;
  const q = sp.q?.trim() || undefined;

  const [courses, categories] = await Promise.all([
    listCatalog(orgId, { q, categorySlug: sp.category || undefined, level }),
    listCategories(orgId),
  ]);
  const filtered = Boolean(q || sp.category || level);

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight">Course catalog</h1>
        <p className="mt-1 text-muted-foreground">Browse free courses and start learning.</p>

        <form method="get" className="my-6 flex flex-wrap items-center gap-3" role="search">
          <Input name="q" defaultValue={q} placeholder="Search courses" aria-label="Search courses" className="max-w-xs" />
          <NativeSelect name="category" defaultValue={sp.category ?? ""} aria-label="Category">
            <option value="">All categories</option>
            {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
          </NativeSelect>
          <NativeSelect name="level" defaultValue={level ?? ""} aria-label="Difficulty">
            <option value="">All levels</option>
            {levels.map((l) => <option key={l} value={l}>{levelLabel[l]}</option>)}
          </NativeSelect>
          <Button type="submit">Filter</Button>
          {filtered && <Button asChild variant="ghost"><Link href="/courses">Clear</Link></Button>}
        </form>

        {courses.length === 0 ? (
          <EmptyState
            title={filtered ? "No courses match your filters" : "No courses published yet"}
            description={filtered ? "Try a different search or clear the filters." : "Check back soon."}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </main>
    </>
  );
}
