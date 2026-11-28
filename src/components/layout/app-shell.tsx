import Link from "next/link";
import { navByRole } from "@/config/navigation";
import type { SessionContext } from "@/lib/session";
import { SignOutButton } from "./sign-out-button";

export function AppShell({ ctx, children }: { ctx: SessionContext; children: React.ReactNode }) {
  const items = navByRole[ctx.role];
  return (
    <div className="flex min-h-screen flex-col bg-muted/30 md:flex-row">
      {/* Mobile top bar */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-2 md:hidden">
        <nav className="flex gap-1 overflow-x-auto" aria-label="Main">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              {item.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </header>

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r bg-background md:flex">
        <div className="px-5 py-4 text-lg font-semibold tracking-tight">LMS</div>
        <nav className="flex-1 space-y-1 px-3" aria-label="Main">
          {items.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-muted hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 border-t p-4">
          <div className="truncate text-sm font-medium">{ctx.name}</div>
          <div className="truncate text-xs text-muted-foreground">{ctx.email}</div>
          <SignOutButton />
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
