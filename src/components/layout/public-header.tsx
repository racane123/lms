import Link from "next/link";
import { Button } from "@/components/ui/button";
import { homeByRole } from "@/config/navigation";
import { getContext } from "@/lib/session";

export async function PublicHeader() {
  const ctx = await getContext();
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link href="/" className="text-lg font-semibold tracking-tight">LMS</Link>
        <nav className="flex items-center gap-2" aria-label="Public">
          <Button asChild variant="ghost" size="sm"><Link href="/courses">Courses</Link></Button>
          {ctx ? (
            <Button asChild size="sm"><Link href={homeByRole[ctx.role]}>My dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
              <Button asChild size="sm"><Link href="/register">Register</Link></Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
