import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import type { Ctx, Role } from "./permissions";
import { homeByRole } from "@/config/navigation";

export type SessionContext = Ctx & { name: string; email: string; image?: string | null };

/** Returns null when signed out OR when the account has been deactivated. */
export async function getContext(): Promise<SessionContext | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const u = session.user as typeof session.user & {
    role: Role;
    organizationId: string;
    isActive: boolean;
  };
  if (!u.isActive || !u.organizationId) return null;

  return {
    userId: u.id,
    role: u.role,
    organizationId: u.organizationId,
    name: u.name,
    email: u.email,
    image: u.image,
  };
}

export async function requireUser(): Promise<SessionContext> {
  const ctx = await getContext();
  if (!ctx) redirect("/login");
  return ctx;
}

export async function requireRole(...roles: Role[]): Promise<SessionContext> {
  const ctx = await requireUser();
  if (!roles.includes(ctx.role)) redirect(homeByRole[ctx.role]);
  return ctx;
}
